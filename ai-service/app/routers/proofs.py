import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.user import User, RoleEnum
from app.models.achievement import AchievementProof, Achievement
from app.services.auth_service import get_current_user
from app.services.proof_service import (
    save_proof_file,
    generate_signed_view_token,
    verify_signed_view_token
)

router = APIRouter(prefix="/proofs", tags=["Proofs"])

@router.post("/upload")
async def upload_proof(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Uploads a proof document to private object storage.
    Validates file integrity, magic bytes, and MIME type.
    """
    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file provided.")

    stored_filename, file_hash, mime_type, file_size = save_proof_file(content, file.filename)

    proof = AchievementProof(
        id=f"PRF-{uuid.uuid4().hex[:10]}",
        achievement_id="",  # Linked upon achievement submission
        file_name=file.filename,
        file_path=stored_filename,
        mime_type=mime_type,
        file_size_bytes=file_size,
        file_hash_sha256=file_hash
    )
    db.add(proof)
    db.commit()
    db.refresh(proof)

    view_token = generate_signed_view_token(proof.id, current_user.id)

    return {
        "proof_id": proof.id,
        "file_name": proof.file_name,
        "mime_type": proof.mime_type,
        "file_size_bytes": proof.file_size_bytes,
        "view_token": view_token
    }

@router.get("/view/{token}")
def view_proof(token: str, db: Session = Depends(get_db)):
    """
    Securely serves private proof documents using an authorized temporary signed token.
    Direct public access without a valid token is impossible.
    """
    proof_id = verify_signed_view_token(token)
    proof = db.query(AchievementProof).filter(AchievementProof.id == proof_id).first()
    if not proof:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proof record not found.")

    full_path = os.path.join(settings.STORAGE_DIR, proof.file_path)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proof file does not exist on storage.")

    return FileResponse(
        path=full_path,
        media_type=proof.mime_type,
        filename=proof.file_name
    )

@router.get("/{proof_id}/signed-token")
def get_proof_signed_token(
    proof_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates a fresh signed view token for authorized Core Members, Admins,
    or the Member who owns this proof record.
    """
    proof = db.query(AchievementProof).filter(AchievementProof.id == proof_id).first()
    if not proof:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proof not found.")

    # Authorization Check
    is_authorized = False
    if current_user.role in [RoleEnum.CORE_MEMBER, RoleEnum.ADMIN]:
        is_authorized = True
    elif proof.achievement and proof.achievement.user_id == current_user.id:
        is_authorized = True

    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this proof document."
        )

    token = generate_signed_view_token(proof.id, current_user.id)
    return {"proof_id": proof.id, "view_token": token, "expires_in_minutes": 30}
