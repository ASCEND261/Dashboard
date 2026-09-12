from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.achievement import AchievementStatusEnum, VerificationDecisionEnum

class CategoryResponse(BaseModel):
    id: str
    slug: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    required_fields: List[Dict[str, Any]]
    is_active: int

    class Config:
        from_attributes = True

class ProofSimpleResponse(BaseModel):
    id: str
    file_name: str
    mime_type: str
    file_size_bytes: int
    uploaded_at: datetime
    view_token: Optional[str] = None  # temporary signed token

    class Config:
        from_attributes = True

class ProofDetailResponse(ProofSimpleResponse):
    ai_extracted: Optional[Dict[str, Any]] = None
    duplicate_check: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class AchievementSubmitRequest(BaseModel):
    category_slug: str = Field(..., min_length=2)
    title: str = Field(..., min_length=4)
    description: str = Field(..., min_length=10)
    achievement_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    metadata: Dict[str, Any] = Field(...)
    proof_id: str = Field(..., min_length=5)

# Member-facing schema: NEVER exposes individual points or internal verifier identity
class MemberSubmissionResponse(BaseModel):
    id: str
    category_name: str
    category_slug: str
    title: str
    description: str
    achievement_date: str
    status: AchievementStatusEnum
    created_at: datetime
    feedback_reason: Optional[str] = None
    proofs: List[ProofSimpleResponse] = []

    class Config:
        from_attributes = True

# Core/Admin facing schema: full auditability, calculation details, verifier info, AI checks
class VerificationRecordResponse(BaseModel):
    id: str
    verifier_name: Optional[str] = None
    decision: VerificationDecisionEnum
    reason: Optional[str] = None
    verified_at: datetime

    class Config:
        from_attributes = True

class PointCalculationResponse(BaseModel):
    rule_id: str
    rule_version: str
    points: int
    calculated_at: datetime

    class Config:
        from_attributes = True

class CoreAchievementDetailResponse(BaseModel):
    id: str
    member_id: str
    member_name: str
    department_name: Optional[str] = None
    department_code: Optional[str] = None
    team_id: str
    team_name: str
    category_name: str
    category_slug: str
    title: str
    description: str
    achievement_date: str
    metadata: Dict[str, Any]
    status: AchievementStatusEnum
    created_at: datetime
    updated_at: datetime
    proofs: List[ProofDetailResponse] = []
    verification_records: List[VerificationRecordResponse] = []
    point_calculation: Optional[PointCalculationResponse] = None

    class Config:
        from_attributes = True
