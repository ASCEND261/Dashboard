from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, RoleEnum
from app.schemas.aarvak import (
    AarvakIntegrationSummary,
    AarvakSyncRequest,
    AarvakSyncResult
)
from app.services.auth_service import require_role
from app.services.aarvak_service import get_verified_export_records, sync_achievements_to_aarvak
from app.services.audit_service import record_audit_event

router = APIRouter(prefix="/integration", tags=["Central AARVAK Integration"])

core_or_admin = require_role([RoleEnum.CORE_MEMBER, RoleEnum.ADMIN])

@router.get("/verified-achievements")
def get_verified_achievements_for_aarvak(
    current_user: User = Depends(core_or_admin),
    db: Session = Depends(get_db)
):
    """
    Export endpoint for Central AARVAK.
    Strictly returns verified records calculated deterministically.
    """
    records = get_verified_export_records(db)
    synced_count = sum(1 for r in records if r["sync_status"] == "SYNCED")
    pending_sync = sum(1 for r in records if r["sync_status"] == "READY")

    return {
        "provider": "ASCEND Integration Adapter",
        "protocol_version": "AARVAK-SYNC-v2",
        "total_verified_eligible": len(records),
        "synced_count": synced_count,
        "pending_sync_count": pending_sync,
        "records": records
    }

@router.post("/sync", response_model=AarvakSyncResult)
def trigger_aarvak_sync(
    req: AarvakSyncRequest,
    current_user: User = Depends(core_or_admin),
    db: Session = Depends(get_db)
):
    """
    Idempotent synchronization push to Central AARVAK API.
    Prevents duplicate points if called multiple times.
    """
    result = sync_achievements_to_aarvak(
        db=db,
        actor=current_user,
        achievement_ids=req.achievement_ids,
        force_resync=req.force_resync
    )

    record_audit_event(
        db=db,
        entity_type="INTEGRATION",
        entity_id="AARVAK-CENTRAL",
        action="SYNC_EXECUTED",
        actor=current_user,
        details={
            "synced_count": result.synced_count,
            "skipped_count": result.skipped_count,
            "idempotency_keys": result.idempotency_keys[:5]
        }
    )

    return result
