import os
import hashlib
import time
from typing import Tuple
from fastapi import HTTPException, UploadFile, status
from jose import jwt, JWTError
from app.config import settings

os.makedirs(settings.STORAGE_DIR, exist_ok=True)

# Magic bytes for server-side verification
MAGIC_BYTES = {
    "application/pdf": b"%PDF-",
    "image/png": b"\x89PNG\r\n\x1a\n",
    "image/jpeg": b"\xff\xd8\xff",
    "image/jpg": b"\xff\xd8\xff"
}

def validate_file_content(content: bytes, filename: str) -> str:
    """
    Verify actual file content, size, and magic bytes. Never trust extensions alone.
    """
    if len(content) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_BYTES / (1024*1024):.0f}MB."
        )

    # Check magic bytes
    detected_mime = None
    for mime, magic in MAGIC_BYTES.items():
        if content.startswith(magic):
            detected_mime = mime
            break

    if not detected_mime:
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        if ext in ["png", "jpg", "jpeg", "pdf"]:
            # Some PDFs have slight preambles, check within first 1024 bytes
            if b"%PDF-" in content[:1024]:
                detected_mime = "application/pdf"

    if not detected_mime:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format or corrupted file. Only valid PDF, PNG, and JPEG documents are permitted."
        )

    return detected_mime

def save_proof_file(content: bytes, original_filename: str) -> Tuple[str, str, str, int]:
    """
    Saves file to private storage, returning (file_path, file_hash, mime_type, size)
    """
    mime_type = validate_file_content(content, original_filename)
    file_hash = hashlib.sha256(content).hexdigest()
    
    # Store using hash to avoid collision & path traversal
    ext = original_filename.split(".")[-1].lower() if "." in original_filename else "bin"
    stored_filename = f"{file_hash[:16]}_{int(time.time())}.{ext}"
    full_path = os.path.join(settings.STORAGE_DIR, stored_filename)

    with open(full_path, "wb") as f:
        f.write(content)

    return stored_filename, file_hash, mime_type, len(content)

def generate_signed_view_token(proof_id: str, user_id: str, expires_minutes: int = 30) -> str:
    """
    Generates a cryptographically signed temporary token for private proof viewing.
    """
    payload = {
        "proof_id": proof_id,
        "authorized_viewer": user_id,
        "exp": int(time.time()) + (expires_minutes * 60)
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_signed_view_token(token: str) -> str:
    """
    Validates token and returns proof_id. Raises 401/403 if invalid or expired.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        proof_id = payload.get("proof_id")
        if not proof_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token payload.")
        return proof_id
    except JWTError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Signed access token has expired or is invalid.")
