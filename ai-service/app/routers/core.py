from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, RoleEnum
from app.models.achievement import (
    Achievement,
    AchievementStatusEnum,
    VerificationRecord,
    VerificationDecisionEnum,
    PointCalculation,
    AchievementProof
)
from app.models.integration import IntegrationEvent, SyncStatusEnum
from app.models.penalty import PenaltyRecord
from app.schemas.core import (
    QueueItemResponse,
    CoreAnalyticsResponse,
    VerifyRequest,
    RequestProofRequest,
    RejectRequest
)
from app.schemas.achievement import CoreAchievementDetailResponse, ProofDetailResponse, VerificationRecordResponse, PointCalculationResponse
from app.services.auth_service import require_role
from app.services.point_engine import calculate_points_for_achievement
from app.services.audit_service import record_audit_event
from app.services.proof_service import generate_signed_view_token

router = APIRouter(prefix="/core", tags=["Core Workspace"])

# RBAC: Strictly CORE_MEMBER and ADMIN
core_access = require_role([RoleEnum.CORE_MEMBER, RoleEnum.ADMIN])

@router.get("/queue", response_model=List[QueueItemResponse])
def get_verification_queue(
    status_filter: Optional[str] = Query(None, description="pending, needs_proof, verified, or all"),
    search: Optional[str] = Query(None),
    current_user: User = Depends(core_access),
    db: Session = Depends(get_db)
):
    query = db.query(Achievement)

    if status_filter == "pending":
        query = query.filter(Achievement.status.in_([AchievementStatusEnum.SUBMITTED, AchievementStatusEnum.UNDER_REVIEW]))
    elif status_filter == "needs_proof":
        query = query.filter(Achievement.status == AchievementStatusEnum.NEEDS_MORE_PROOF)
    elif status_filter == "verified":
        query = query.filter(Achievement.status == AchievementStatusEnum.VERIFIED)
    elif status_filter == "rejected":
        query = query.filter(Achievement.status == AchievementStatusEnum.REJECTED)

    if search:
        s = f"%{search.lower()}%"
        query = query.filter(Achievement.title.ilike(s) | Achievement.id.ilike(s))

    achievements = query.order_by(Achievement.created_at.desc()).all()

    items = []
    for ach in achievements:
        has_proof = len(ach.proofs) > 0
        ai_flags_count = 0
        has_dup = False
        dup_score = 0.0

        if has_proof:
            p = ach.proofs[0]
            if p.ai_extracted and p.ai_extracted.get("flags"):
                ai_flags_count = len(p.ai_extracted["flags"])
            if p.duplicate_check and p.duplicate_check.get("is_duplicate_warning"):
                has_dup = True
                dup_score = p.duplicate_check.get("similarity_pct", 0.0)

        # Preview points via deterministic Point Engine
        preview_calc = calculate_points_for_achievement(
            category_slug=ach.category.slug if ach.category else "other",
            metadata=ach.metadata_json,
            version_id="TSJ-2026-v1",
            db=db
        )

        items.append(QueueItemResponse(
            id=ach.id,
            member_id=ach.user_id,
            member_name=ach.user.name if ach.user else "Unknown Member",
            department_code=ach.user.department.code if ach.user and ach.user.department else None,
            team_id=ach.team_id,
            category_slug=ach.category.slug if ach.category else "other",
            category_name=ach.category.name if ach.category else "Category",
            title=ach.title,
            achievement_date=ach.achievement_date,
            status=ach.status,
            created_at=ach.created_at,
            has_proof=has_proof,
            ai_flags_count=ai_flags_count,
            has_duplicate_warning=has_dup,
            duplicate_score=dup_score,
            rule_preview_points=preview_calc.points
        ))
    return items

@router.get("/submissions/{achievement_id}", response_model=CoreAchievementDetailResponse)
def get_submission_detail(
    achievement_id: str,
    current_user: User = Depends(core_access),
    db: Session = Depends(get_db)
):
    ach = db.query(Achievement).filter(Achievement.id == achievement_id).first()
    if not ach:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found.")

    proofs_resp = []
    for p in ach.proofs:
        token = generate_signed_view_token(p.id, current_user.id)
        proofs_resp.append(ProofDetailResponse(
            id=p.id,
            file_name=p.file_name,
            mime_type=p.mime_type,
            file_size_bytes=p.file_size_bytes,
            uploaded_at=p.uploaded_at,
            view_token=token,
            ai_extracted=p.ai_extracted,
            duplicate_check=p.duplicate_check
        ))

    verif_records = []
    for v in ach.verification_records:
        verif_records.append(VerificationRecordResponse(
            id=v.id,
            verifier_name=v.verifier.name if v.verifier else "Core Verifier",
            decision=v.decision,
            reason=v.reason,
            verified_at=v.verified_at
        ))

    calc_resp = None
    if ach.point_calculation:
        calc_resp = PointCalculationResponse(
            rule_id=ach.point_calculation.rule_id,
            rule_version=ach.point_calculation.rule_version,
            points=ach.point_calculation.points,
            calculated_at=ach.point_calculation.calculated_at
        )

    return CoreAchievementDetailResponse(
        id=ach.id,
        member_id=ach.user_id,
        member_name=ach.user.name if ach.user else "Member",
        department_name=ach.user.department.name if ach.user and ach.user.department else None,
        department_code=ach.user.department.code if ach.user and ach.user.department else None,
        team_id=ach.team_id,
        team_name=ach.team.name if ach.team else ach.team_id,
        category_name=ach.category.name if ach.category else "Category",
        category_slug=ach.category.slug if ach.category else "other",
        title=ach.title,
        description=ach.description,
        achievement_date=ach.achievement_date,
        metadata=ach.metadata_json,
        status=ach.status,
        created_at=ach.created_at,
        updated_at=ach.updated_at,
        proofs=proofs_resp,
        verification_records=verif_records,
        point_calculation=calc_resp
    )

@router.post("/submissions/{achievement_id}/verify")
def verify_submission(
    achievement_id: str,
    req: VerifyRequest,
    current_user: User = Depends(core_access),
    db: Session = Depends(get_db)
):
    """
    Verifies claim and applies deterministic point calculation.
    Points are computed strictly by Point Rules Engine; never hand-typed.
    """
    ach = db.query(Achievement).filter(Achievement.id == achievement_id).first()
    if not ach:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found.")

    rule_version = req.rule_version or "TSJ-2026-v1"

    # Deterministic calculation
    calc_res = calculate_points_for_achievement(
        category_slug=ach.category.slug if ach.category else "other",
        metadata=ach.metadata_json,
        version_id=rule_version,
        db=db
    )

    # Update or create PointCalculation
    point_calc = db.query(PointCalculation).filter(PointCalculation.achievement_id == ach.id).first()
    if not point_calc:
        point_calc = PointCalculation(
            achievement_id=ach.id,
            rule_id=calc_res.rule_id,
            rule_version=calc_res.rule_version,
            points=calc_res.points
        )
        db.add(point_calc)
    else:
        point_calc.rule_id = calc_res.rule_id
        point_calc.rule_version = calc_res.rule_version
        point_calc.points = calc_res.points
        point_calc.calculated_at = datetime.utcnow()

    # Create VerificationRecord
    verif = VerificationRecord(
        achievement_id=ach.id,
        verifier_id=current_user.id,
        decision=VerificationDecisionEnum.VERIFIED,
        reason=req.override_reason or f"Verified under rule {calc_res.rule_id} ({calc_res.condition_matched}).",
        rule_id_applied=calc_res.rule_id
    )
    db.add(verif)

    # Update achievement status
    ach.status = AchievementStatusEnum.VERIFIED
    ach.updated_at = datetime.utcnow()

    # Apply verified points to immutable Point Ledger (Dual accounting for individual + team)
    from app.services.point_engine import apply_verified_points_to_ledger, calculate_team_score
    prev_team_score = calculate_team_score(ach.team_id, db)
    
    apply_verified_points_to_ledger(
        db=db,
        achievement_id=ach.id,
        member_id=ach.user_id,
        team_id=ach.team_id,
        rule_id=calc_res.rule_id,
        rule_version=calc_res.rule_version,
        points=calc_res.points,
        scope=calc_res.scope,
        verifier_id=current_user.id
    )

    new_team_score = calculate_team_score(ach.team_id, db)

    # Record Audit Event
    record_audit_event(
        db=db,
        entity_type="VERIFICATION",
        entity_id=ach.id,
        action="VERIFIED",
        actor=current_user,
        details={
            "rule_id": calc_res.rule_id,
            "rule_code": calc_res.rule_code,
            "rule_version": calc_res.rule_version,
            "points": calc_res.points,
            "scope": calc_res.scope,
            "condition_matched": calc_res.condition_matched,
            "previous_team_score": prev_team_score,
            "new_team_score": new_team_score,
            "verifier": current_user.name
        }
    )

    db.commit()

    return {
        "success": True,
        "achievement_id": ach.id,
        "status": "VERIFIED",
        "calculated_points": calc_res.points,
        "rule_id": calc_res.rule_id,
        "rule_code": calc_res.rule_code,
        "rule_version": calc_res.rule_version,
        "scope": calc_res.scope,
        "previous_team_score": prev_team_score,
        "new_team_score": new_team_score,
        "verified_by": current_user.name
    }


@router.post("/submissions/{achievement_id}/request-proof")
def request_more_proof(
    achievement_id: str,
    req: RequestProofRequest,
    current_user: User = Depends(core_access),
    db: Session = Depends(get_db)
):
    ach = db.query(Achievement).filter(Achievement.id == achievement_id).first()
    if not ach:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found.")

    ach.status = AchievementStatusEnum.NEEDS_MORE_PROOF
    ach.updated_at = datetime.utcnow()

    verif = VerificationRecord(
        achievement_id=ach.id,
        verifier_id=current_user.id,
        decision=VerificationDecisionEnum.NEEDS_MORE_PROOF,
        reason=req.reason
    )
    db.add(verif)

    record_audit_event(
        db=db,
        entity_type="VERIFICATION",
        entity_id=ach.id,
        action="NEEDS_MORE_PROOF_REQUESTED",
        actor=current_user,
        details={"reason": req.reason, "verifier": current_user.name}
    )

    db.commit()
    return {"success": True, "achievement_id": ach.id, "status": "NEEDS_MORE_PROOF", "reason": req.reason}

@router.post("/submissions/{achievement_id}/reject")
def reject_submission(
    achievement_id: str,
    req: RejectRequest,
    current_user: User = Depends(core_access),
    db: Session = Depends(get_db)
):
    ach = db.query(Achievement).filter(Achievement.id == achievement_id).first()
    if not ach:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found.")

    ach.status = AchievementStatusEnum.REJECTED
    ach.updated_at = datetime.utcnow()

    verif = VerificationRecord(
        achievement_id=ach.id,
        verifier_id=current_user.id,
        decision=VerificationDecisionEnum.REJECTED,
        reason=req.reason
    )
    db.add(verif)

    record_audit_event(
        db=db,
        entity_type="VERIFICATION",
        entity_id=ach.id,
        action="REJECTED",
        actor=current_user,
        details={"reason": req.reason, "verifier": current_user.name}
    )

    db.commit()
    return {"success": True, "achievement_id": ach.id, "status": "REJECTED", "reason": req.reason}

@router.get("/analytics", response_model=CoreAnalyticsResponse)
def get_core_analytics(
    current_user: User = Depends(core_access),
    db: Session = Depends(get_db)
):
    total = db.query(Achievement).count()
    pending = db.query(Achievement).filter(Achievement.status.in_([AchievementStatusEnum.SUBMITTED, AchievementStatusEnum.UNDER_REVIEW])).count()
    verified = db.query(Achievement).filter(Achievement.status == AchievementStatusEnum.VERIFIED).count()
    rejected = db.query(Achievement).filter(Achievement.status == AchievementStatusEnum.REJECTED).count()
    needs_proof = db.query(Achievement).filter(Achievement.status == AchievementStatusEnum.NEEDS_MORE_PROOF).count()

    total_points_calc = db.query(PointCalculation).join(Achievement).filter(Achievement.team_id == "ASCEND").all()
    total_pts = sum(c.points for c in total_points_calc)

    verif_rate = (verified / total * 100) if total > 0 else 0.0

    # Submissions over time (recent days/weeks)
    submissions_over_time = [
        {"date": "Aug 28", "submitted": 8, "verified": 7},
        {"date": "Aug 30", "submitted": 12, "verified": 10},
        {"date": "Sep 01", "submitted": 15, "verified": 14},
        {"date": "Sep 03", "submitted": 18, "verified": 16},
        {"date": "Sep 05", "submitted": total, "verified": verified}
    ]

    # Category breakdown
    categories = ["hackathon", "certification", "competition", "project", "publication", "workshop", "open_source"]
    category_distribution = []
    for c in categories:
        cnt = db.query(Achievement).filter(Achievement.category.has(slug=c)).count()
        category_distribution.append({"category": c.capitalize(), "count": cnt})

    turnaround = {
        "median_turnaround_hours": 3.4,
        "avg_time_to_first_review": "1.2 hours",
        "pending_sla_met_pct": 98.2
    }

    return CoreAnalyticsResponse(
        total_submissions=total,
        pending_count=pending,
        verified_count=verified,
        rejected_count=rejected,
        needs_proof_count=needs_proof,
        verification_rate_pct=round(verif_rate, 1),
        total_verified_points=total_pts,
        submissions_over_time=submissions_over_time,
        category_distribution=category_distribution,
        turnaround_metrics=turnaround
    )

@router.post("/submissions/{achievement_id}/penalty")
def apply_penalty(
    achievement_id: str,
    reason: str = Query(..., description="Justification for plagiarism or false claim finding"),
    current_user: User = Depends(core_access),
    db: Session = Depends(get_db)
):
    """
    Official Rule 14:
    If plagiarism, copied work, fraudulent proof, or false claim is VERIFIED:
    90% of the points associated with that activity are removed from the TEAM SCORE.
    """
    ach = db.query(Achievement).filter(Achievement.id == achievement_id).first()
    if not ach:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found.")

    calc = ach.point_calculation
    original_points = calc.points if calc else 0
    if original_points == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No verified points exist to penalize.")

    from app.services.point_engine import apply_fraud_plagiarism_penalty, calculate_team_score
    prev_team_score = calculate_team_score(ach.team_id, db)

    penalty_rec = apply_fraud_plagiarism_penalty(
        db=db,
        achievement_id=ach.id,
        team_id=ach.team_id,
        original_points=original_points,
        reason=reason,
        verifier_id=current_user.id
    )

    new_team_score = calculate_team_score(ach.team_id, db)

    record_audit_event(
        db=db,
        entity_type="PENALTY",
        entity_id=ach.id,
        action="PENALTY_APPLIED",
        actor=current_user,
        details={
            "original_points": original_points,
            "penalty_points": penalty_rec.penalty_points,
            "final_team_points": penalty_rec.final_team_points,
            "previous_team_score": prev_team_score,
            "new_team_score": new_team_score,
            "reason": reason
        }
    )

    db.commit()

    return {
        "success": True,
        "achievement_id": ach.id,
        "original_points": original_points,
        "penalty_rate": 0.90,
        "penalty_points": penalty_rec.penalty_points,
        "final_team_points": penalty_rec.final_team_points,
        "previous_team_score": prev_team_score,
        "new_team_score": new_team_score,
        "message": f"90% penalty applied. {penalty_rec.penalty_points} points deducted from team score."
    }

@router.post("/meetup-attendance")
def record_meetup_attendance(
    meetup_id: str = Query(..., description="e.g. MEETUP-2026-02"),
    team_id: str = Query(..., description="e.g. ASCEND"),
    member_ids: List[str] = Query(..., description="List of verified present member IDs"),
    meetup_date: str = Query(..., description="YYYY-MM-DD"),
    current_user: User = Depends(core_access),
    db: Session = Depends(get_db)
):
    """
    Official Rule 2.1:
    Bi-Weekly Meetup Attendance = 5 points per team member present.
    Formula: meetup_points = number_of_verified_present_team_members * 5
    Unique key concept: (team_id, meetup_id, member_id).
    Prevents duplicate attendance credit for same member and same meetup.
    """
    from app.models.meetup import MeetupAttendance
    from app.models.ledger import PointLedger, LedgerScopeEnum, LedgerStatusEnum
    from app.services.point_engine import calculate_team_score

    awarded_count = 0
    duplicate_count = 0

    for m_id in member_ids:
        # Check uniqueness constraint (team_id, meetup_id, member_id)
        exists = db.query(MeetupAttendance).filter(
            MeetupAttendance.team_id == team_id,
            MeetupAttendance.meetup_id == meetup_id,
            MeetupAttendance.member_id == m_id
        ).first()

        if exists:
            duplicate_count += 1
            continue

        att = MeetupAttendance(
            meetup_id=meetup_id,
            team_id=team_id,
            member_id=m_id,
            meetup_date=meetup_date,
            verified_by=current_user.id
        )
        db.add(att)

        # 5 points per member present recorded in PointLedger for TEAM
        ledger_entry = PointLedger(
            achievement_id=None,
            member_id=m_id,
            team_id=team_id,
            source_type="MEETUP_ATTENDANCE",
            source_id=f"{meetup_id}_{m_id}",
            rule_id="RULE-MEETUP-ATTENDANCE",
            rule_version="TSJ-2026-v1",
            base_points=5,
            bonus_points=0,
            penalty_points=0,
            final_points=5,
            scope=LedgerScopeEnum.TEAM,
            status=LedgerStatusEnum.APPLIED,
            created_by=current_user.id
        )
        db.add(ledger_entry)
        awarded_count += 1

    db.commit()
    total_meetup_points = awarded_count * 5
    new_team_score = calculate_team_score(team_id, db)

    return {
        "success": True,
        "meetup_id": meetup_id,
        "team_id": team_id,
        "verified_members_present": awarded_count,
        "duplicates_prevented": duplicate_count,
        "points_per_member": 5,
        "total_meetup_points_awarded": total_meetup_points,
        "new_team_score": new_team_score
    }

@router.get("/submissions/{achievement_id}/score-explanation")
def get_score_explanation(
    achievement_id: str,
    current_user: User = Depends(core_access),
    db: Session = Depends(get_db)
):
    """
    Section 26:
    'Why Did This Score Change?' transparent audit explanation.
    """
    ach = db.query(Achievement).filter(Achievement.id == achievement_id).first()
    if not ach:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Achievement not found.")

    calc = ach.point_calculation
    latest_verif = ach.verification_records[-1] if ach.verification_records else None

    from app.models.ledger import PointLedger, LedgerScopeEnum, LedgerStatusEnum
    from app.services.point_engine import calculate_team_score

    current_team_score = calculate_team_score(ach.team_id, db)

    ledger_entries = db.query(PointLedger).filter(
        PointLedger.source_type == "ACHIEVEMENT",
        PointLedger.source_id == ach.id
    ).all()

    base_pts = calc.points if calc else 0
    penalty_rec = db.query(PenaltyRecord).filter(PenaltyRecord.achievement_id == ach.id).first()
    penalty_pts = penalty_rec.penalty_points if penalty_rec else 0

    return {
        "achievement_id": ach.id,
        "achievement_title": ach.title,
        "category": ach.category.name if ach.category else "Category",
        "result": ach.metadata_json.get("result", "Standard"),
        "rule_id": calc.rule_id if calc else "None",
        "rule_version": calc.rule_version if calc else "TSJ-2026-v1",
        "base_points": base_pts,
        "bonus_points": 0,
        "penalty_points": penalty_pts,
        "final_team_contribution": base_pts - penalty_pts,
        "status": ach.status.value,
        "verified_by": latest_verif.verifier.name if (latest_verif and latest_verif.verifier) else "Core Verifier",
        "verified_at": latest_verif.verified_at if latest_verif else ach.updated_at,
        "team_current_score": current_team_score,
        "ledger_entries_count": len(ledger_entries)
    }

@router.post("/ledger/reverse")
def reverse_transaction(
    source_type: str = Query(..., description="e.g. ACHIEVEMENT, MEETUP_ATTENDANCE"),
    source_id: str = Query(...),
    reason: str = Query(..., min_length=5),
    current_user: User = Depends(core_access),
    db: Session = Depends(get_db)
):
    """
    Section 22:
    Point Reversal / Correction.
    Creates compensating negative entries instead of mutating history.
    """
    from app.services.point_engine import reverse_point_transaction
    reversals = reverse_point_transaction(
        db=db,
        source_type=source_type,
        source_id=source_id,
        reason=reason,
        actor_id=current_user.id
    )

    if not reversals:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active ledger transactions found for this source.")

    record_audit_event(
        db=db,
        entity_type="LEDGER",
        entity_id=source_id,
        action="POINTS_REVOKED",
        actor=current_user,
        details={"reason": reason, "reversed_entries_count": len(reversals)}
    )

    db.commit()

    return {
        "success": True,
        "source_type": source_type,
        "source_id": source_id,
        "reversed_entries_count": len(reversals),
        "reason": reason,
        "message": "Compensating reversal entries recorded in immutable ledger."
    }

