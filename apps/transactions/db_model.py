from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from db_config import Base
from datetime import datetime
import enum

class ExpenseCategory(str, enum.Enum):
    FOOD = "FOOD"
    TRANSPORT = "TRANSPORT"
    SHOPPING = "SHOPPING"
    BILLS = "BILLS"
    HEALTH = "HEALTH"
    ENTERTAINMENT = "ENTERTAINMENT"
    EDUCATION = "EDUCATION"
    FITNESS = "FITNESS"
    BEAUTY = "BEAUTY"
    TRAVEL = "TRAVEL"
    SUBSCRIPTIONS = "SUBSCRIPTIONS"
    PERSONAL = "PERSONAL"
    HOME = "HOME"
    PRODUCTIVITY = "PRODUCTIVITY"
    OTHER = "OTHER"

class TransactionModel(Base):
    __tablename__ = "Transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(Enum(ExpenseCategory), nullable=False)
    transaction_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # NO relationship needed — we filter by user_id in routes directly