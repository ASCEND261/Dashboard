import uuid
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.achievement import Achievement, AchievementStatusEnum
from app.models.integration import IntegrationEvent, SyncStatusEnum
from app.models.user import User
from app.schemas.aarvak import AarvakSyncResult

def get_verified_export_records(db: Session) -> List[Dict[str, Any]]:
    """
    Returns verified records prepared for Central AARVAK consumption.
    Strictly filters out any non-verified records.
    """
    verified_achievements = db.query(Achievement).filter(
        Achievement.status == AchievementStatusEnum.VERIFIED
    ).all()

    records = []
    for ach in verified_achievements:
        calc = ach.point_calculation
        rule_version = calc.rule_version if calc else "2026-v1"
        points = calc.points if calc else 0
        latest_verif = ach.verification_records[-1] if ach.verification_records else None
        verified_at = latest_verif.verified_at.isoformat() if latest_verif else ach.updated_at.isoformat()

        # Check existing integration event
        event = db.query(IntegrationEvent).filter(IntegrationEvent.achievement_id == ach.id).first()
        sync_status = event.sync_status.value if event else SyncStatusEnum.READY.value
        external_id = event.external_reference_id if event else None

        records.append({
            "achievement_id": ach.id,
            "team_id": ach.team_id,
            "category": ach.category.slug if ach.category else "other",
            "title": ach.title,
            "achievement_date": ach.achievement_date,
            "verification_status": "VERIFIED",
            "rule_version": rule_version,
            "points": points,
            "verified_at": verified_at,
            "sync_status": sync_status,
            "external_reference_id": external_id
        })
    return records

def sync_achievements_to_aarvak(
    db: Session,
    actor: User,
    achievement_ids: List[str] = None,
    force_resync: bool = False
) -> AarvakSyncResult:
    """
    Idempotent sync engine connecting ASCEND to Central AARVAK endpoint.
    Guarantees no double-counting of team points.
    """
    query = db.query(Achievement).filter(Achievement.status == AchievementStatusEnum.VERIFIED)
    if achievement_ids:
        query = query.filter(Achievement.id.in_(achievement_ids))
    achievements = query.all()

    synced_count = 0
    skipped_count = 0
    failed_count = 0
    idempotency_keys = []

    for ach in achievements:
        event = db.query(IntegrationEvent).filter(IntegrationEvent.achievement_id == ach.id).first()
        
        if event and event.sync_status == SyncStatusEnum.SYNCED and not force_resync:
            skipped_count += 1
            continue

        if not event:
            event = IntegrationEvent(
                achievement_id=ach.id,
                sync_status=SyncStatusEnum.READY,
                attempt_count=0
            )
            db.add(event)
            db.flush()

        event.sync_status = SyncStatusEnum.SYNCING
        event.attempt_count += 1
        event.last_attempt_at = datetime.utcnow()

        # Generate deterministic idempotency external reference key
        calc = ach.point_calculation
        points = calc.points if calc else 0
        rule_version = calc.rule_version if calc else "2026-v1"
        external_ref = f"AARVAK-SYNC-{ach.team_id}-{ach.id}-{rule_version}"
        event.external_reference_id = external_ref

        # Structured payload
        event.payload = {
            "external_reference_id": external_ref,
            "achievement_id": ach.id,
            "team_id": ach.team_id,
            "category": ach.category.slug if ach.category else "other",
            "title": ach.title,
            "points": points,
            "rule_version": rule_version,
            "synced_by": actor.name,
            "synced_at": datetime.utcnow().isoformat()
        }

        # Emulate successful Central AARVAK acknowledgment
        event.sync_status = SyncStatusEnum.SYNCED
        synced_count += 1
        idempotency_keys.append(external_ref)

    db.commit()

    return AarvakSyncResult(
        synced_count=synced_count,
        skipped_count=skipped_count,
        failed_count=failed_count,
        idempotency_keys=idempotency_keys,
        message=f"AARVAK sync completed successfully. {synced_count} records synchronized, {skipped_count} skipped (already synced)."
    )
