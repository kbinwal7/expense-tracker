from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import both models FIRST so Base knows about all tables before create_all
from apps.auth.db_user import User
from apps.transactions.db_model import TransactionModel

from db_config import Base, engine

Base.metadata.create_all(bind=engine)

# Import routers AFTER create_all
from apps.auth.auth import router as auth_router
from apps.transactions.transactions import router as transactions_router
from apps.dashboard.dashboard import router as dashboard_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(transactions_router, prefix="/transactions", tags=["Transactions"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])


@app.get("/")
async def root():
    return {"message": "API is running"}