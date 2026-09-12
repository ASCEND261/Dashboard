import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class LedgerScopeEnum(str, enum.Enum):
    INDIVIDUAL = "INDIVIDUAL"
    TEAM = "TEAM"

class LedgerStatusEnum(str, enum.Enum):
    APPLIED = "APPLIED"
    REVERSED = "REVERSED"

class PointLedger(Base):
    __tablename__ = "point_ledger"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    achievement_id = Column(String(50), nullable=True, index=True)
    member_id = Column(String(50), ForeignKey("users.id"), nullable=True, index=True)
    team_id = Column(String(50), ForeignKey("teams.id"), nullable=False, index=True)
    
    source_type = Column(String(50), nullable=False, index=True)  # ACHIEVEMENT, MEETUP_ATTENDANCE, WEEKLY_CHALLENGE, BONUS, PENALTY, REVERSAL
    source_id = Column(String(100), nullable=False, index=True)
    
    rule_id = Column(String(100), nullable=False)
    rule_version = Column(String(50), nullable=False, default="TSJ-2026-v1")
    
    base_points = Column(Integer, nullable=False, default=0)
    bonus_points = Column(Integer, nullable=False, default=0)
    penalty_points = Column(Integer, nullable=False, default=0)
    final_points = Column(Integer, nullable=False, default=0)
    
    scope = Column(Enum(LedgerScopeEnum), nullable=False, index=True)
    status = Column(Enum(LedgerStatusEnum), default=LedgerStatusEnum.APPLIED, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    created_by = Column(String(100), nullable=False)  # Verifier ID or System

    # Unique constraint prevents double-counting on identical source and scope
    __table_args__ = (
        UniqueConstraint("source_type", "source_id", "scope", name="uq_source_scope_double_counting"),
    )
