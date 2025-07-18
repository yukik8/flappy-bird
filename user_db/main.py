from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import cast as sql_cast
from sqlalchemy.types import TIMESTAMP
from sqlmodel import Session, select
from time import sleep
from contextlib import asynccontextmanager
from .database import create_db_and_tables, get_session
from .models import Score
from datetime import datetime, timezone


def now():
    return datetime.now(timezone.utc)


class ScoreRequest(BaseModel):
    username: str
    score: int


sleep(10)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開発中は "*" でOK。公開時は制限する。
    allow_credentials=True,
    allow_methods=["*"],  # POST, GET, OPTIONS などを許可
    allow_headers=["*"],  # Content-Type などを許可
)


@app.post("/submit_score/")
def submit_score(
    payload: ScoreRequest,
    session: Session = Depends(get_session)
):
    if not payload.username or not payload.score:
        raise HTTPException(
            status_code=400, detail="Username and score are required")
    print(payload)
    score_data = {
        "username": payload.username,
        "score": payload.score,
        "last_update": now()
    }
    users_score = Score(**score_data)
    session.add(users_score)
    session.commit()
    session.refresh(users_score)
    return users_score


@app.get("/leaderboard/")
def get_leaderboard(limit: int = 10, session: Session = Depends(get_session)):
    statement = select(Score).order_by(Score.score.desc()).limit(limit)
    results = session.exec(statement).all()
    return results


@app.get("/get_users/")
def read_users(session: Session = Depends(get_session)):
    users = session.exec(select(Score)).all()
    return users


@app.get("/hello_world/")
def hello_world():
    return "hello world"


@app.get("/current_time/")
def current_time():
    return f"{now()}"


# @app.delete("/delete_user/{user_id}")
# def delete_user(user_id: int, session: Session = Depends(get_session)):
#     user = session.get(Score, user_id)
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     session.delete(user)
#     session.commit()
#     return {"detail": "User deleted successfully"}


# @app.patch("/update_user/{user_id}")
# def update_user(user_id: int, user: Score, session: Session = Depends(get_session
#                                                                       )):
#     existing_user = session.get(Score, user_id)
#     if not existing_user:
#         raise HTTPException(status_code=404, detail="User not found")

#     for key, value in user.dict(exclude_unset=True).items():
#         setattr(existing_user, key, value)

#     session.add(existing_user)
#     session.commit()
#     session.refresh(existing_user)
#     return existing_user
