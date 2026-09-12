import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class PointRuleVersion(Base):
    __tablename__ = "point_rule_versions"

    id = Column(String(50), primary_key=True)  # e.g., "2026-v1"
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    effective_from = Column(DateTime, default=datetime.utcnow)
    effective_to = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    rules = relationship("PointRule", back_populates="version", cascade="all, delete-orphan")

class PointRule(Base):
    __tablename__ = "point_rules"

    id = Column(String(100), primary_key=True, default=lambda: f"RULE-{uuid.uuid4().hex[:8].upper()}")
    rule_code = Column(String(100), nullable=True, index=True)  # e.g., "EXTERNAL_HACKATHON_1ST"
    version_id = Column(String(50), ForeignKey("point_rule_versions.id"), nullable=False, index=True)
    category_slug = Column(String(50), nullable=False, index=True)  # e.g., "hackathon", "certification"
    condition_key = Column(String(50), nullable=False)  # e.g., "result", "level"
    condition_val = Column(String(100), nullable=False)  # e.g., "Winner", "2nd Place", "Participant"
    points = Column(Integer, nullable=False)
    scope = Column(String(50), default="TEAM", nullable=False)  # TEAM, INDIVIDUAL_AND_TEAM
    activity_type = Column(String(50), default="TEAM_ACTIVITY", nullable=False)  # TEAM_ACTIVITY, INDIVIDUAL_CONTRIBUTION, SPRINT_TRACK
    description = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    version = relationship("PointRuleVersion", back_populates="rules")
    calculations = relationship("PointCalculation", back_populates="rule")

