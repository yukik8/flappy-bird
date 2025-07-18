from sqlmodel import create_engine, Session, SQLModel
from .models import *
from os import environ

# Database URL, could be PostgreSQL, MySQL, SQLite, etc.
engine = create_engine(environ["DB_URL"])

def get_session():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
