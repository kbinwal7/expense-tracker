from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from datetime import datetime
import enum

Base = declarative_base()


class ExpenseCategory(enum.Enum):
    SKINCARE = "SKINCARE"
    MAKEUP = "MAKEUP"
    DINE_OUT = "DINE OUT"
    TAKEAWAY = "TAKEAWAY"
    STUDY = "STUDY"
    PRODUCTIVITY = "PRODUCTIVITY"
    SHOPPING = "SHOPPING"
    FITNESS = "FITNESS"
    SUBSCRIPTIONS = "SUBSCRIPTIONS"
    ENTERTAINMENT = "ENTERTAINMENT"
    
    


class Transaction(Base):
    __tablename__ = "Transactions"

    id = Column(
    Integer,
    primary_key=True,
    index=True,
    autoincrement=True
)

    name = Column(String, nullable=False)

    amount = Column(Float, nullable=False)

    category = Column(
        Enum(ExpenseCategory),
        nullable=False
    )

    transaction_time = Column(
        DateTime,
        nullable=False
    )