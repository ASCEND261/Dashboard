import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from app.database import Base

class MeetupAttendance(Base):
    __tablename__ = "meetup_attendance"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    meetup_id = Column(String(50), nullable=False, index=True)  # e.g. "MEETUP-2026-01"
    team_id = Column(String(50), ForeignKey("teams.id"), nullable=False, index=True)
    member_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    meetup_date = Column(String(50), nullable=False)
    verified_by = Column(String(50), ForeignKey("users.id"), nullable=False)
    verified_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("team_id", "meetup_id", "member_id", name="uq_team_meetup_member"),
    )
