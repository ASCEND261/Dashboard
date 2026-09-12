import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base

class RoleEnum(str, enum.Enum):
    MEMBER = "MEMBER"
    CORE_MEMBER = "CORE_MEMBER"
    ADMIN = "ADMIN"

class SprintTrackEnum(str, enum.Enum):
    CODE_TRACK = "CODE_TRACK"  # DSA & Competitive Programming
    OPEN_SOURCE_TRACK = "OPEN_SOURCE_TRACK"  # GitHub contributions, PRs
    BUILD_TRACK = "BUILD_TRACK"  # Developers & Makers
    PITCH_TRACK = "PITCH_TRACK"  # Communicators & Non-Coders

class Department(Base):
    __tablename__ = "departments"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="department")
    teams = relationship("Team", back_populates="department")

class Team(Base):
    __tablename__ = "teams"

    id = Column(String(50), primary_key=True)  # e.g., "ASCEND", "NOVA"
    name = Column(String(100), nullable=False)
    department_id = Column(String(50), ForeignKey("departments.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="teams")
    users = relationship("User", back_populates="team")
    achievements = relationship("Achievement", back_populates="team")

class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.MEMBER, nullable=False, index=True)
    sprint_track = Column(Enum(SprintTrackEnum), default=SprintTrackEnum.CODE_TRACK, nullable=True)
    
    department_id = Column(String(50), ForeignKey("departments.id"), nullable=True)
    team_id = Column(String(50), ForeignKey("teams.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="users")
    team = relationship("Team", back_populates="users")
    achievements = relationship("Achievement", back_populates="user")
    verifications = relationship("VerificationRecord", back_populates="verifier")
