from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Create engine
# engine helps connect to the database 
engine = create_engine(DATABASE_URL)

# Create session
SessionLocal = sessionmaker(
    autoflush=False,
    bind=engine
)

Base = declarative_base()

