from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlUrl import SQLALCHEMY_DATABASE_URL

# PostgreSQL Database URL
# Format: postgresql://username:password@host:port/database_name

# Create the SQLAlchemy engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create a SessionLocal class to generate new session objects
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our models to inherit from
Base = declarative_base()