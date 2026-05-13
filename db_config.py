from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

# Database URL
DATABASE_URL = DATABASE_URL = "postgresql://postgres:postgressql@localhost:5432/expense"

# Create engine
# engine helps connect to the database 
engine = create_engine(DATABASE_URL)

# Create session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

