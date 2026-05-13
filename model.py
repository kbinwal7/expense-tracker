from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class ExpenseCategory(str, Enum):
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
        orm_mode = True