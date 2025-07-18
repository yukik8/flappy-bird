from datetime import date, datetime
from typing import Optional

from sqlalchemy import Column, DateTime
from sqlalchemy.sql import func
from sqlmodel import Field, SQLModel


class BaseModel(SQLModel):
    last_update: datetime
    additional_information: Optional[str] = None


class Score(BaseModel, table=True):
    id: Optional[int] = Field(primary_key=True)
    username: str
    score: int
