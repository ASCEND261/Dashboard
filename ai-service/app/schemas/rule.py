from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class PointRuleBase(BaseModel):
    category_slug: str
    condition_key: str
    condition_val: str
    points: int
    description: Optional[str] = None
    is_active: bool = True

class PointRuleCreate(PointRuleBase):
    version_id: str

class PointRuleResponse(PointRuleBase):
    id: str
    version_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class PointRuleVersionBase(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    is_active: bool = True

class PointRuleVersionResponse(PointRuleVersionBase):
    effective_from: datetime
    effective_to: Optional[datetime] = None
    created_at: datetime
    rules: List[PointRuleResponse] = []

    class Config:
        from_attributes = True
