import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Enum, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class SyncStatusEnum(str, enum.Enum):
    READY = "READY"
    SYNCING = "SYNCING"
    SYNCED = "SYNCED"
    FAILED = "FAILED"

class IntegrationEvent(Base):
    __tablename__ = "integration_events"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    achievement_id = Column(String(50), ForeignKey("achievements.id"), unique=True, nullable=False, index=True)
    sync_status = Column(Enum(SyncStatusEnum), default=SyncStatusEnum.READY, nullable=False, index=True)
    attempt_count = Column(Integer, default=0)
    last_attempt_at = Column(DateTime, nullable=True)
    external_reference_id = Column(String(100), nullable=True, index=True)
    payload = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    achievement = relationship("Achievement", back_populates="integration_event")
