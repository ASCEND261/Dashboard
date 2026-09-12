from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, RoleEnum
from app.models.rule import PointRule, PointRuleVersion
from app.schemas.rule import PointRuleResponse, PointRuleVersionResponse, PointRuleCreate
from app.services.auth_service import require_role
from app.services.audit_service import record_audit_event

router = APIRouter(prefix="/rules", tags=["Point Rules Engine"])

admin_access = require_role([RoleEnum.ADMIN])

@router.get("", response_model=List[PointRuleResponse])
def get_rules(version_id: Optional[str] = "TSJ-2026-v1", db: Session = Depends(get_db)):
    query = db.query(PointRule)
    if version_id in ["2026-v1", "TSJ-2026-v1"]:
        version_id = "TSJ-2026-v1"
    if version_id:
        query = query.filter(PointRule.version_id == version_id)
    return query.filter(PointRule.is_active == True).order_by(PointRule.category_slug, PointRule.points.desc()).all()

@router.get("/versions", response_model=List[PointRuleVersionResponse])
def get_rule_versions(db: Session = Depends(get_db)):
    return db.query(PointRuleVersion).order_by(PointRuleVersion.created_at.desc()).all()

@router.post("", response_model=PointRuleResponse)
def create_or_update_rule(
    req: PointRuleCreate,
    current_user: User = Depends(admin_access),
    db: Session = Depends(get_db)
):
    version = db.query(PointRuleVersion).filter(PointRuleVersion.id == req.version_id).first()
    if not version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Version {req.version_id} not found.")

    rule = PointRule(
        version_id=req.version_id,
        category_slug=req.category_slug,
        condition_key=req.condition_key,
        condition_val=req.condition_val,
        points=req.points,
        description=req.description,
        is_active=req.is_active
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)

    record_audit_event(
        db=db,
        entity_type="RULE",
        entity_id=rule.id,
        action="RULE_CREATED",
        actor=current_user,
        details={
            "category": rule.category_slug,
            "condition": f"{rule.condition_key} = {rule.condition_val}",
            "points": rule.points,
            "version": rule.version_id
        }
    )

    return rule
