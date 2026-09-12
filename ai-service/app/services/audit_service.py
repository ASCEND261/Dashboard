from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit import AuditLog
from app.models.user import User

def record_audit_event(
    db: Session,
    entity_type: str,
    entity_id: str,
    action: str,
    actor: User,
    details: Optional[Dict[str, Any]] = None
) -> AuditLog:
    """
    Records an append-only audit event.
    """
    audit = AuditLog(
        entity_type=entity_type,
        entity_id=entity_id,
        actor_id=actor.id,
        actor_name=actor.name,
        actor_role=actor.role.value,
        action=action,
        details=details or {}
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit
