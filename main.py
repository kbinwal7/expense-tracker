from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from db_config import SessionLocal,engine
import db_model
from model import Transaction, ExpenseCategory
from sqlalchemy.orm import Session


transactions = [

    Transaction(
        id=1,
        name="Nykaa Lipstick",
        amount=799,
        category=ExpenseCategory.MAKEUP,
        transaction_time=datetime(2026, 5, 10, 18, 30)
    ),

    Transaction(
        id=2,
        name="Starbucks Coffee",
        amount=420,
        category=ExpenseCategory.DINE_OUT,
        transaction_time=datetime(2026, 5, 11, 17, 15)
    ),

    Transaction(
        id=3,
        name="Notion Subscription",
        amount=299,
        category=ExpenseCategory.PRODUCTIVITY,
        transaction_time=datetime(2026, 5, 1, 9, 0)
    ),

    Transaction(
        id=4,
        name="Korean Sheet Masks",
        amount=1200,
        category=ExpenseCategory.SKINCARE,
        transaction_time=datetime(2026, 5, 8, 20, 45)
    ),

    Transaction(
        id=5,
        name="Zomato Pasta Order",
        amount=650,
        category=ExpenseCategory.TAKEAWAY,
        transaction_time=datetime(2026, 5, 9, 22, 10)
    ),

    Transaction(
        id=6,
        name="Pinterest Study Notes",
        amount=199,
        category=ExpenseCategory.STUDY,
        transaction_time=datetime(2026, 5, 7, 14, 20)
    ),

    Transaction(
        id=7,
        name="H&M Shopping",
        amount=2499,
        category=ExpenseCategory.SHOPPING,
        transaction_time=datetime(2026, 5, 6, 16, 40)
    ),

    Transaction(
        id=8,
        name="Pilates Membership",
        amount=1800,
        category=ExpenseCategory.FITNESS,
        transaction_time=datetime(2026, 5, 3, 7, 30)
    ),

    Transaction(
        id=9,
        name="Spotify Premium",
        amount=119,
        category=ExpenseCategory.SUBSCRIPTIONS,
        transaction_time=datetime(2026, 5, 2, 11, 5)
    ),

    Transaction(
        id=10,
        name="Movie Night",
        amount=550,
        category=ExpenseCategory.ENTERTAINMENT,
        transaction_time=datetime(2026, 5, 12, 19, 0)
    )

]


def get_db():
    db=SessionLocal()
    yield db
    db.close()
    
def init_db():
    db=SessionLocal()
    
    count=db.query(db_model.Transaction).count()
    
    if count==0:
        for transaction in transactions:
            db.add(db_model.Transaction(**transaction.model_dump())) #double star to unpack
        
    db.commit()
    
app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
db_model.Base.metadata.create_all(bind=engine)
init_db()

@app.get("/transactions")
def get_all_trsanctions(db: Session=Depends(get_db)):
    db_transaction=db.query(db_model.Transaction).order_by(
      db_model.Transaction.transaction_time.desc()
  ).all()
    return db_transaction

@app.get("/transactions/{id}") #this is  dynamic now
def get_transaction_by_id(id:int,db: Session=Depends(get_db)):
    db_transaction= db.query(db_model.Transactions).filter(db_model.Transactions.id ==id).first()
    if db_transaction:
        return db_transaction
    return {"error": "Transaction not found"}
    
    return None

@app.post("/transactions")
def add_to_list(trans:Transaction,db: Session=Depends(get_db)):
    db.add(db_model.Transaction(**trans.model_dump()))
    db.commit()
    return {"message": "Transaction created successfully", "transaction": trans}
    
@app.put("/transactions/{id}")
def update_by_id(
    id: int,
    trans: Transaction,
    db: Session = Depends(get_db)
):
    db_trans = (
        db.query(db_model.Transaction)
        .filter(db_model.Transaction.id == id)
        .first()
    )

    if not db_trans:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    db_trans.name = trans.name
    db_trans.amount = trans.amount
    db_trans.category = trans.category
    db_trans.transaction_time = trans.transaction_time

    db.commit()
    db.refresh(db_trans)

    return {
        "message": "Transaction updated successfully",
        "transaction": db_trans
    }
    
@app.delete("/transactions/{id}")
def delete_trsanction(id: int, db: Session = Depends(get_db)):

    db_transaction = (
        db.query(db_model.Transaction)
        .filter(db_model.Transaction.id == id)
        .first()
    )

    if not db_transaction:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(db_transaction)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }
    

