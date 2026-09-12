from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class AuditLogResponse(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    actor_id: str
    actor_name: Optional[str] = None
    actor_role: Optional[str] = None
    action: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime

    class Config:
        from_attributes = True
