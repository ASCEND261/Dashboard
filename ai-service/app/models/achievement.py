import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Enum, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class AchievementStatusEnum(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    NEEDS_MORE_PROOF = "NEEDS_MORE_PROOF"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class VerificationDecisionEnum(str, enum.Enum):
    VERIFIED = "VERIFIED"
    NEEDS_MORE_PROOF = "NEEDS_MORE_PROOF"
    REJECTED = "REJECTED"

class AchievementCategory(Base):
    __tablename__ = "achievement_categories"

    id = Column(String(50), primary_key=True)  # e.g., "cat-hackathon"
    slug = Column(String(50), unique=True, nullable=False, index=True)  # e.g., "hackathon"
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)  # e.g., "Trophy", "Award", "Code"
    required_fields = Column(JSON, nullable=False)  # schema defining dynamic fields
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    achievements = relationship("Achievement", back_populates="category")

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String(50), primary_key=True)  # e.g., "ACH-2026-00142"
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    team_id = Column(String(50), ForeignKey("teams.id"), nullable=False, index=True)
    category_id = Column(String(50), ForeignKey("achievement_categories.id"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    achievement_date = Column(String(50), nullable=False)  # ISO date string e.g. "2026-09-04"
    metadata_json = Column(JSON, nullable=False, default={})  # structured form values
    
    status = Column(Enum(AchievementStatusEnum), default=AchievementStatusEnum.SUBMITTED, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="achievements")
    team = relationship("Team", back_populates="achievements")
    category = relationship("AchievementCategory", back_populates="achievements")
    proofs = relationship("AchievementProof", back_populates="achievement", cascade="all, delete-orphan")
    verification_records = relationship("VerificationRecord", back_populates="achievement", cascade="all, delete-orphan")
    point_calculation = relationship("PointCalculation", back_populates="achievement", uselist=False, cascade="all, delete-orphan")
    integration_event = relationship("IntegrationEvent", back_populates="achievement", uselist=False, cascade="all, delete-orphan")

class AchievementProof(Base):
    __tablename__ = "achievement_proofs"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    achievement_id = Column(String(50), ForeignKey("achievements.id"), nullable=False, index=True)
    
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)  # Private storage relative path
    mime_type = Column(String(100), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    file_hash_sha256 = Column(String(64), nullable=False, index=True)
    
    # Proof Intelligence: extracted info & consistency check
    ai_extracted = Column(JSON, nullable=True)
    # Duplicate Detection results
    duplicate_check = Column(JSON, nullable=True)
    
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    achievement = relationship("Achievement", back_populates="proofs")

class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    achievement_id = Column(String(50), ForeignKey("achievements.id"), nullable=False, index=True)
    verifier_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    decision = Column(Enum(VerificationDecisionEnum), nullable=False)
    reason = Column(Text, nullable=True)
    rule_id_applied = Column(String(100), ForeignKey("point_rules.id"), nullable=True)
    verified_at = Column(DateTime, default=datetime.utcnow, index=True)

    achievement = relationship("Achievement", back_populates="verification_records")
    verifier = relationship("User", back_populates="verifications")

class PointCalculation(Base):
    __tablename__ = "point_calculations"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    achievement_id = Column(String(50), ForeignKey("achievements.id"), unique=True, nullable=False, index=True)
    rule_id = Column(String(100), ForeignKey("point_rules.id"), nullable=False)
    rule_version = Column(String(50), nullable=False)
    points = Column(Integer, nullable=False)
    calculated_at = Column(DateTime, default=datetime.utcnow)

    achievement = relationship("Achievement", back_populates="point_calculation")
    rule = relationship("PointRule", back_populates="calculations")
