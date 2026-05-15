from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from db_config import SessionLocal
from apps.transactions.db_model import TransactionModel
from apps.auth.auth import get_current_active_user
from apps.auth.db_user import User as UserModel

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/monthly-trend")
def get_monthly_trend(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    results = (
        db.query(
            func.to_char(TransactionModel.transaction_time, 'YYYY-MM').label("month"),
            func.sum(TransactionModel.amount).label("total")
        )
        .filter(TransactionModel.user_id == current_user.id)
        .group_by("month")
        .order_by("month")
        .all()
    )
    return [{"month": row.month, "total": float(row.total)} for row in results]


@router.get("/category-breakdown")
def get_category_breakdown(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    results = (
        db.query(
            TransactionModel.category,
            func.sum(TransactionModel.amount).label("total")
        )
        .filter(TransactionModel.user_id == current_user.id)
        .group_by(TransactionModel.category)
        .order_by(func.sum(TransactionModel.amount).desc())
        .all()
    )
    return [{"category": row.category.value, "total": float(row.total)} for row in results]


from sqlalchemy import func
from fastapi import Depends
from sqlalchemy.orm import Session

@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    now = datetime.utcnow()

    result = (
        db.query(
            func.sum(TransactionModel.amount).label("total_spend"),
            func.count(TransactionModel.id).label("transaction_count"),
            func.avg(TransactionModel.amount).label("average_spend")
        )
        .filter(
            TransactionModel.user_id == current_user.id,
            func.extract('year', TransactionModel.created_at) == now.year,
            func.extract('month', TransactionModel.created_at) == now.month
        )
        .first()
    )

    return {
        "total_spend": float(result.total_spend or 0),
        "transaction_count": int(result.transaction_count or 0),
        "average_spend": float(result.average_spend or 0)
    }
    
@router.get("/top-spend")
def get_top_category(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    result = (
        db.query(
            TransactionModel.category,
            func.sum(TransactionModel.amount).label("total")
        )
        .filter(TransactionModel.user_id == current_user.id)
        .group_by(TransactionModel.category)
        .order_by(func.sum(TransactionModel.amount).desc())
        .first()
    )
    if not result:
        return None
    return {"category": result.category.value, "total": float(result.total)}


@router.get("/recent-transactions")
def get_recent_transactions(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    return (
        db.query(TransactionModel)
        .filter(TransactionModel.user_id == current_user.id)
        .order_by(TransactionModel.transaction_time.desc())
        .limit(10)
        .all()
    )