import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, RoleEnum
from app.models.achievement import Achievement, AchievementCategory, AchievementProof, AchievementStatusEnum
from app.schemas.achievement import (
    CategoryResponse,
    AchievementSubmitRequest,
    MemberSubmissionResponse,
    ProofSimpleResponse
)
from app.services.auth_service import get_current_user, require_role
from app.services.proof_intelligence import analyze_document_intelligence, check_duplicate_submission
from app.services.audit_service import record_audit_event
from app.services.proof_service import generate_signed_view_token

router = APIRouter(prefix="/achievements", tags=["Achievements"])

@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.query(AchievementCategory).filter(AchievementCategory.is_active == 1).all()

@router.post("/submit", response_model=MemberSubmissionResponse)
def submit_achievement(
    req: AchievementSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Lookup Category
    category = db.query(AchievementCategory).filter(AchievementCategory.slug == req.category_slug).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid achievement category: {req.category_slug}"
        )

    # 2. Vague submission prevention: check required fields defined in category schema
    required_field_keys = [f["name"] for f in category.required_fields if f.get("required", False)]
    missing_fields = []
    for f in required_field_keys:
        val = req.metadata.get(f)
        if not val or (isinstance(val, str) and len(val.strip()) == 0):
            missing_fields.append(f)

    if missing_fields:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Incomplete submission. The following required fields for {category.name} are missing: {', '.join(missing_fields)}"
        )

    # 3. Verify Proof
    proof = db.query(AchievementProof).filter(AchievementProof.id == req.proof_id).first()
    if not proof:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A verified proof document is mandatory. Please upload a certificate or document before submitting."
        )

    # 4. Generate structured Achievement ID: ACH-2026-XXXXX
    count = db.query(Achievement).count() + 1
    ach_id = f"ACH-2026-{count:05d}"

    # 5. Create Achievement (Identity strictly derived from authenticated user)
    achievement = Achievement(
        id=ach_id,
        user_id=current_user.id,
        team_id=current_user.team_id,
        category_id=category.id,
        title=req.title.strip(),
        description=req.description.strip(),
        achievement_date=req.achievement_date,
        metadata_json=req.metadata,
        status=AchievementStatusEnum.SUBMITTED
    )
    db.add(achievement)
    db.flush()

    # 6. Associate Proof with Achievement
    proof.achievement_id = achievement.id

    # 7. Run Proof Intelligence & Duplicate Check
    ai_intel = analyze_document_intelligence(
        file_name=proof.file_name,
        mime_type=proof.mime_type,
        file_bytes=b"dummy-bytes",
        member_name=current_user.name,
        metadata=req.metadata
    )
    proof.ai_extracted = ai_intel

    duplicate_result = check_duplicate_submission(
        current_user_id=current_user.id,
        category_slug=req.category_slug,
        title=req.title,
        file_hash=proof.file_hash_sha256,
        metadata=req.metadata,
        db=db,
        exclude_achievement_id=achievement.id
    )
    proof.duplicate_check = duplicate_result

    # 8. Append-only Audit Log
    record_audit_event(
        db=db,
        entity_type="ACHIEVEMENT",
        entity_id=achievement.id,
        action="SUBMITTED",
        actor=current_user,
        details={
            "category": category.slug,
            "title": achievement.title,
            "team": current_user.team_id,
            "proof_hash": proof.file_hash_sha256
        }
    )

    db.commit()
    db.refresh(achievement)

    # Return Member response (Zero points exposed!)
    view_token = generate_signed_view_token(proof.id, current_user.id)
    return MemberSubmissionResponse(
        id=achievement.id,
        category_name=category.name,
        category_slug=category.slug,
        title=achievement.title,
        description=achievement.description,
        achievement_date=achievement.achievement_date,
        status=achievement.status,
        created_at=achievement.created_at,
        feedback_reason=None,
        proofs=[ProofSimpleResponse(
            id=proof.id,
            file_name=proof.file_name,
            mime_type=proof.mime_type,
            file_size_bytes=proof.file_size_bytes,
            uploaded_at=proof.uploaded_at,
            view_token=view_token
        )]
    )

@router.get("/my", response_model=List[MemberSubmissionResponse])
def get_my_submissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns only the authenticated member's achievements.
    Strictly isolated: does NOT reveal individual point values or other members' records!
    """
    achievements = db.query(Achievement).filter(
        Achievement.user_id == current_user.id
    ).order_by(Achievement.created_at.desc()).all()

    result = []
    for ach in achievements:
        latest_verif = ach.verification_records[-1] if ach.verification_records else None
        feedback = latest_verif.reason if (latest_verif and ach.status == AchievementStatusEnum.NEEDS_MORE_PROOF) else None
        
        proofs_list = []
        for p in ach.proofs:
            token = generate_signed_view_token(p.id, current_user.id)
            proofs_list.append(ProofSimpleResponse(
                id=p.id,
                file_name=p.file_name,
                mime_type=p.mime_type,
                file_size_bytes=p.file_size_bytes,
                uploaded_at=p.uploaded_at,
                view_token=token
            ))

        result.append(MemberSubmissionResponse(
            id=ach.id,
            category_name=ach.category.name if ach.category else "Category",
            category_slug=ach.category.slug if ach.category else "other",
            title=ach.title,
            description=ach.description,
            achievement_date=ach.achievement_date,
            status=ach.status,
            created_at=ach.created_at,
            feedback_reason=feedback,
            proofs=proofs_list
        ))
    return result
