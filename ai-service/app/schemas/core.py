from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.achievement import AchievementStatusEnum

class VerifyRequest(BaseModel):
    rule_version: Optional[str] = "TSJ-2026-v1"
    override_reason: Optional[str] = None

class RequestProofRequest(BaseModel):
    reason: str = Field(..., min_length=5, description="Specific feedback to member explaining what proof is missing or unreadable")

class RejectRequest(BaseModel):
    reason: str = Field(..., min_length=5, description="Clear justification for rejection")

class QueueItemResponse(BaseModel):
    id: str
    member_id: str
    member_name: str
    department_code: Optional[str] = None
    team_id: str
    category_slug: str
    category_name: str
    title: str
    achievement_date: str
    status: AchievementStatusEnum
    created_at: datetime
    has_proof: bool
    ai_flags_count: int
    has_duplicate_warning: bool
    duplicate_score: Optional[float] = None
    rule_preview_points: Optional[int] = None

    class Config:
        from_attributes = True

class CoreAnalyticsResponse(BaseModel):
    total_submissions: int
    pending_count: int
    verified_count: int
    rejected_count: int
    needs_proof_count: int
    verification_rate_pct: float
    total_verified_points: int
    submissions_over_time: List[Dict[str, Any]]
    category_distribution: List[Dict[str, Any]]
    turnaround_metrics: Dict[str, Any]
