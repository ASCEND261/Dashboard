from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class AIChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=2)
    history: Optional[List[AIChatMessage]] = []

class AIChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = []
    knowledge_references: Optional[List[str]] = []

class FormatAchievementRequest(BaseModel):
    raw_text: str = Field(..., min_length=5, description="Member's unformatted raw description")
    category_hint: Optional[str] = None

class FormattedDraftField(BaseModel):
    category_slug: str
    title: str
    description: str
    achievement_date: str
    metadata: Dict[str, Any]
    confidence: float
    notes: Optional[str] = None

class FormatAchievementResponse(BaseModel):
    success: bool
    draft: FormattedDraftField
    message: str
