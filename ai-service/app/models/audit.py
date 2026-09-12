import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, Text
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_type = Column(String(50), nullable=False, index=True)  # e.g., "ACHIEVEMENT", "RULE", "VERIFICATION"
    entity_id = Column(String(50), nullable=False, index=True)
    actor_id = Column(String(50), nullable=False, index=True)
    actor_name = Column(String(100), nullable=True)
    actor_role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False, index=True)  # e.g., "SUBMITTED", "PROOF_ANALYZED", "VERIFIED"
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
