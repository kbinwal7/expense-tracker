from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine

# Database URL
DATABASE_URL = DATABASE_URL = "postgresql://postgres:postgressql@localhost:5432/expense"

# Create engine
# engine helps connect to the database 
engine = create_engine(DATABASE_URL)

# Create session
SessionLocal = sessionmaker(
    autoflush=False,
    bind=engine
)

Base = declarative_base()

