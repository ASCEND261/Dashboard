from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, RoleEnum
from app.schemas.auth import LoginRequest, Token, UserResponse
from app.services.auth_service import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    access_token = create_access_token(data={
        "sub": user.id,
        "role": user.role.value,
        "team_id": user.team_id,
        "name": user.name
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/demo-accounts")
def get_demo_accounts(db: Session = Depends(get_db)):
    """
    Returns preset demo accounts for easy role-switching during evaluation.
    """
    demo_users = db.query(User).all()
    accounts = []
    for u in demo_users:
        token = create_access_token(data={
            "sub": u.id,
            "role": u.role.value,
            "team_id": u.team_id,
            "name": u.name
        })
        accounts.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role.value,
            "team_id": u.team_id,
            "department_code": u.department.code if u.department else None,
            "access_token": token
        })
    return accounts
