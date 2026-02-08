from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class GameStat(Base):
    __tablename__ = "player_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    difficulty = Column(String)
    is_win = Column(Boolean)
    played_at = Column(DateTime(timezone=True), server_default=func.now())