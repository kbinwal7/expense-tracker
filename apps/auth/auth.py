from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt

from jwt.exceptions import InvalidTokenError

from fastapi import APIRouter, Depends, FastAPI, HTTPException, status

from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
)

from pwdlib import PasswordHash

from pydantic import BaseModel, ConfigDict

from sqlalchemy import Boolean, Column, Integer, String

from sqlalchemy.orm import (
    Session,
    declarative_base,
    sessionmaker,
)

from db_config import SessionLocal, engine

from apps.auth.db_user import User as UserModel
from apps.auth.user import User, Token, TokenData, UserCreate, UserLogin
from db_config import Base

from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
router = APIRouter()

@router.get("/")
async def auth_home():
    return {"message": "Auth routes"}






password_hash = PasswordHash.recommended()

def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)

def get_password_hash(password):
    return password_hash.hash(password)

Base.metadata.create_all(bind=engine)

fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "hashed_password": get_password_hash("secret"),
        "disabled": False,
    }
}

def init_db():
    db = SessionLocal()

    try:
        count = db.query(UserModel).count()

        if count == 0:
            for _, user_data in fake_users_db.items():
                db_user = UserModel(**user_data)
                db.add(db_user)

            db.commit()

    finally:
        db.close()



init_db()
app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
DUMMY_HASH = get_password_hash("dummypassword")


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

def get_user(db: Session, username: str):
    return (
        db.query(UserModel)
        .filter(UserModel.username == username)
        .first()
    )

def authenticate_user(
    db: Session,
    username: str,
    password: str,
):
    user = get_user(db, username)

    if not user:
        verify_password(password, DUMMY_HASH)
        return False

    if not verify_password(password, user.hashed_password):
        return False

    return user

def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None,
):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return encoded_jwt


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        username: str | None = payload.get("sub")

        if username is None:
            raise credentials_exception

        token_data = TokenData(username=username)

    except InvalidTokenError:
        raise credentials_exception

    user = get_user(db, username=token_data.username)

    if user is None:
        raise credentials_exception

    return user


async def get_current_active_user(
    current_user: Annotated[
        UserModel,
        Depends(get_current_user),
    ],
):
    if current_user.disabled:
        raise HTTPException(
            status_code=400,
            detail="Inactive user",
        )

    return current_user



@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: Annotated[
        OAuth2PasswordRequestForm,
        Depends(),
    ],
    db: Session = Depends(get_db),
):
    user = authenticate_user(
        db,
        form_data.username,
        form_data.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "username": user.username,
        "token_type": "bearer",
    }



@router.get("/users/me/", response_model=User)
async def read_users_me(
    current_user: Annotated[
        UserModel,
        Depends(get_current_active_user),
    ],
):
    return current_user


@router.get("/users/me/items/")
async def read_own_items(
    current_user: Annotated[
        UserModel,
        Depends(get_current_active_user),
    ],
):
    return [
        {
            "item_id": "Foo",
            "owner": current_user.username,
        }
    ]
    


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    
    # check if username already exists
    existing_user = db.query(UserModel).filter(
        UserModel.username == user.username
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )
    
    # check if email already exists
    existing_email = db.query(UserModel).filter(
        UserModel.email == user.email
    ).first()
    
    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = UserModel(
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        disabled=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully", "username": new_user.username}


@router.post("/login")
def login_user(user: UserLogin,db: Session = Depends(get_db)):
    db_user = authenticate_user(db, user.username, user.password)

    if not db_user:
        raise HTTPException(
            status_code=400,
            detail="Invalid username or password"
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(
        data={"sub": db_user.username},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer", "username": db_user.username}