from fastapi import APIRouter, Depends
from app.models.user import User
from app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    FormatAchievementRequest,
    FormatAchievementResponse
)
from app.services.auth_service import get_current_user
from app.services.ai_guide_service import generate_ai_guide_response, parse_rough_achievement_draft

router = APIRouter(prefix="/ai", tags=["AI Assistant (ASCEND Guide)"])

@router.post("/chat", response_model=AIChatResponse)
def chat_with_guide(
    req: AIChatRequest,
    current_user: User = Depends(get_current_user)
):
    """
    ASCEND Guide conversational assistant.
    Grounded in official rules, workflows, and platform navigation.
    Enforces strict safety boundaries.
    """
    return generate_ai_guide_response(req.message)

from pydantic import BaseModel
from typing import Dict, Any
from app.services.proof_intelligence import analyze_document_intelligence

class EvidenceAnalysisRequest(BaseModel):
    file_name: str
    mime_type: str = "application/pdf"
    member_name: str
    category_slug: str
    claim_title: str
    metadata: Dict[str, Any] = {}

@router.post("/analyze-evidence")
def analyze_evidence(req: EvidenceAnalysisRequest):
    """
    Universal Evidence Intelligence API:
    Inspects claim vs uploaded proof facts and returns structured dimension checks.
    AI NEVER awards points; Rust backend enforces official rules.
    """
    return analyze_document_intelligence(
        file_name=req.file_name,
        mime_type=req.mime_type,
        file_bytes=b"sample-bytes-for-ocr",
        member_name=req.member_name,
        category_slug=req.category_slug,
        claim_title=req.claim_title,
        metadata=req.metadata
    )
