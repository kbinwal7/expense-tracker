from pydantic import BaseModel, ConfigDict

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class User(BaseModel):
    username: str
    email: str
    full_name: str | None = None
    disabled: bool | None = None

    model_config = ConfigDict(from_attributes=True)


class UserInDB(User):
    hashed_password: str

    model_config = ConfigDict(from_attributes=True)
    
class UserCreate(BaseModel):
    username: str
    full_name: str
    email: str
    password: str
    
class UserLogin(BaseModel):
    username: str
    password: str