import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from app.database import Base

class PenaltyRecord(Base):
    __tablename__ = "penalty_records"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    achievement_id = Column(String(50), ForeignKey("achievements.id"), nullable=False, index=True)
    team_id = Column(String(50), ForeignKey("teams.id"), nullable=False, index=True)
    
    original_points = Column(Integer, nullable=False)
    penalty_rate = Column(Float, nullable=False, default=0.90)  # Official 90% penalty rate
    penalty_points = Column(Integer, nullable=False)  # original_points * 0.90
    final_team_points = Column(Integer, nullable=False)  # original_points - penalty_points
    
    reason = Column(Text, nullable=False)
    verified_by = Column(String(50), ForeignKey("users.id"), nullable=False)
    applied_at = Column(DateTime, default=datetime.utcnow, index=True)
