from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import RoleEnum

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenPayload(BaseModel):
    sub: str
    role: str
    team_id: Optional[str] = None
    name: Optional[str] = None

class DepartmentSimple(BaseModel):
    id: str
    name: str
    code: str

    class Config:
        from_attributes = True

class TeamSimple(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: RoleEnum
    department: Optional[DepartmentSimple] = None
    team: Optional[TeamSimple] = None

    class Config:
        from_attributes = True

Token.update_forward_refs()
