from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel, Field
import redis
import requests
import json
import uuid
import os

from database import engine, get_db, Base
from models import GameStat

Base.metadata.create_all(bind=engine)

app = FastAPI()

REDIS_HOST = os.getenv("REDIS_HOST", "redis_db")
GENERATOR_URL = os.getenv("GENERATOR_URL", "http://game_service:8080")

r = redis.Redis(host=REDIS_HOST, port=6379, db=0, decode_responses=True)

class StartGameRequest(BaseModel):
    difficulty: str
    user_id: int = Field(alias="userId")

class MoveRequest(BaseModel):
    game_id: str
    row: int
    col: int
    value: int

def get_game_from_redis(game_id: str):
    data = r.get(f"play:{game_id}")
    return json.loads(data) if data else None

def save_game_to_redis(game_id: str, data: dict):
    r.setex(f"play:{game_id}", 3600, json.dumps(data))

@app.post("/start")
def start_game(request: StartGameRequest):
    try:
        response = requests.get(f"{GENERATOR_URL}/generate", params={"difficulty": request.difficulty})
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Generator failed")
        
        gen_data = response.json()
        
    except Exception:
        raise HTTPException(status_code=500, detail="Connection error with Game Service")

    game_id = str(uuid.uuid4())

    game_state = {
        "user_id": request.user_id,
        "difficulty": request.difficulty,
        "lives": 3,
        "status": "ACTIVE",
        "current_board": gen_data["board"],
        "solution": gen_data["solution"]
    }

    save_game_to_redis(game_id, game_state)

    return {
        "game_id": game_id,
        "board": game_state["current_board"],
        "lives": 3
    }

@app.post("/move")
def make_move(request: MoveRequest, db: Session = Depends(get_db)):
    game = get_game_from_redis(request.game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game["status"] != "ACTIVE":
        return {"status": "GAME_OVER", "message": "Game finished"}

    correct_value = game["solution"][request.row][request.col]
    
    if request.value == correct_value:
        game["current_board"][request.row][request.col] = request.value
        
        is_finished = not any(0 in row for row in game["current_board"])
        
        if is_finished:
            game["status"] = "WON"
            r.delete(f"play:{request.game_id}")
            
            new_stat = GameStat(
                user_id=game["user_id"],
                difficulty=game["difficulty"],
                is_win=True
            )
            db.add(new_stat)
            db.commit()
            
            return {"result": "WIN", "lives": game["lives"]}
        
        save_game_to_redis(request.game_id, game)
        return {"result": "CORRECT", "lives": game["lives"]}
    
    else:
        game["lives"] -= 1
        
        if game["lives"] <= 0:
            game["status"] = "LOST"
            r.delete(f"play:{request.game_id}")
            
            new_stat = GameStat(
                user_id=game["user_id"],
                difficulty=game["difficulty"],
                is_win=False
            )
            db.add(new_stat)
            db.commit()
            
            return {"result": "GAME_OVER", "solution": game["solution"]}
        
        save_game_to_redis(request.game_id, game)
        return {"result": "WRONG", "lives": game["lives"]}

@app.get("/leaderboard/{difficulty}")
def get_leaderboard(difficulty: str, db: Session = Depends(get_db)):
    results = db.query(
        GameStat.user_id,
        func.count(GameStat.id).label("wins")
    ).filter(
        GameStat.difficulty == difficulty,
        GameStat.is_win == True
    ).group_by(
        GameStat.user_id
    ).order_by(
        desc("wins")
    ).limit(10).all()

    leaderboard = []
    for row in results:
        leaderboard.append({
            "userId": row.user_id,
            "wins": row.wins,
            "username": f"User #{row.user_id}"
        })
        
    return leaderboard