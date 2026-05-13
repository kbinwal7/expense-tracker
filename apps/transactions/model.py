from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class ExpenseCategory(str, Enum):
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
    OTHER = "OTHER"


from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class Transaction(BaseModel):

    id: Optional[int] = None

    name: str

    amount: float

    category: ExpenseCategory

    transaction_time: datetime
    
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True