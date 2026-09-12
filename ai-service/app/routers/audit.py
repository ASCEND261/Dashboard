from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, RoleEnum
from app.models.audit import AuditLog
from app.schemas.audit import AuditLogResponse
from app.services.auth_service import require_role

router = APIRouter(prefix="/audit-logs", tags=["Audit Log"])

core_or_admin = require_role([RoleEnum.CORE_MEMBER, RoleEnum.ADMIN])

@router.get("", response_model=List[AuditLogResponse])
def list_audit_logs(
    entity_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    current_user: User = Depends(core_or_admin),
    db: Session = Depends(get_db)
):
    """
    Append-only audit trail. Restricted to Core Members and Admins.
    """
    query = db.query(AuditLog)
    if entity_id:
        query = query.filter(AuditLog.entity_id == entity_id)
    if action:
        query = query.filter(AuditLog.action == action)
    return query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
