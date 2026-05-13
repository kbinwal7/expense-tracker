from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from db_config import SessionLocal, engine, Base
from apps.transactions.db_model import TransactionModel, ExpenseCategory
from apps.transactions.model import Transaction as TransactionSchema
from sqlalchemy.orm import Session
from fastapi import APIRouter
from apps.auth.auth import get_current_active_user
from apps.auth.db_user import User as UserModel

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    db = SessionLocal()
    try:
        count = db.query(TransactionModel).count()
        if count == 0:
            for t in sample_transactions:
                db.add(TransactionModel(**t.model_dump()))
        db.commit()
    finally:
        db.close()


Base.metadata.create_all(bind=engine)


# GET all — only return THIS user's transactions
@router.get("/")
def get_all_transactions(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    return (
        db.query(TransactionModel)
        .filter(TransactionModel.user_id == current_user.id)
        .order_by(TransactionModel.transaction_time.desc())
        .all()
    )


# GET by ID — only if it belongs to current user
@router.get("/{id}")
def get_transaction_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    transaction = (
        db.query(TransactionModel)
        .filter(TransactionModel.id == id, TransactionModel.user_id == current_user.id)
        .first()
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


# POST — attach user_id when creating
@router.post("/")
def add_transaction(
    trans: TransactionSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    new_transaction = TransactionModel(
        name=trans.name,
        amount=trans.amount,
        category=trans.category,
        transaction_time=trans.transaction_time,
        user_id=current_user.id
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return new_transaction


# PUT — only update if it belongs to current user
@router.put("/{id}")
def update_transaction(
    id: int,
    trans: TransactionSchema,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    db_trans = (
        db.query(TransactionModel)
        .filter(TransactionModel.id == id, TransactionModel.user_id == current_user.id)
        .first()
    )
    if not db_trans:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db_trans.name = trans.name
    db_trans.amount = trans.amount
    db_trans.category = trans.category
    db_trans.transaction_time = trans.transaction_time

    db.commit()
    db.refresh(db_trans)
    return db_trans


# DELETE — only delete if it belongs to current user
@router.delete("/{id}")
def delete_transaction(
    id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    transaction = (
        db.query(TransactionModel)
        .filter(TransactionModel.id == id, TransactionModel.user_id == current_user.id)
        .first()
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(transaction)
    db.commit()
    return {"message": "Deleted successfully"}