use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "roleenum", rename_all = "SCREAMING_SNAKE_CASE")]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum RoleEnum {
    #[serde(alias = "Member", alias = "member")]
    Member,
    #[serde(alias = "CoreMember", alias = "core_member")]
    CoreMember,
    #[serde(alias = "Admin", alias = "admin")]
    Admin,
    #[serde(alias = "SuperAdmin", alias = "super_admin")]
    SuperAdmin,
}

impl RoleEnum {
    pub fn as_str(&self) -> &'static str {
        match self {
            RoleEnum::Member => "MEMBER",
            RoleEnum::CoreMember => "CORE_MEMBER",
            RoleEnum::Admin => "ADMIN",
            RoleEnum::SuperAdmin => "SUPER_ADMIN",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s.to_uppercase().as_str() {
            "CORE_MEMBER" => RoleEnum::CoreMember,
            "ADMIN" => RoleEnum::Admin,
            "SUPER_ADMIN" => RoleEnum::SuperAdmin,
            _ => RoleEnum::Member,
        }
    }

    pub fn is_core_or_admin(&self) -> bool {
        matches!(self, RoleEnum::CoreMember | RoleEnum::Admin | RoleEnum::SuperAdmin)
    }

    pub fn is_admin(&self) -> bool {
        matches!(self, RoleEnum::Admin | RoleEnum::SuperAdmin)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "sprinttrackenum", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SprintTrackEnum {
    CodeTrack,
    OpenSourceTrack,
    BuildTrack,
    PitchTrack,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Department {
    pub id: String,
    pub name: String,
    pub code: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: String,
    pub name: String,
    pub email: String,
    #[serde(skip_serializing)]
    pub hashed_password: String,
    pub role: RoleEnum,
    pub sprint_track: Option<SprintTrackEnum>,
    pub department_id: Option<String>,
    pub team_id: Option<String>,
    pub created_at: Option<NaiveDateTime>,
    pub status: Option<String>,
    #[serde(skip_serializing)]
    pub access_code_hash: Option<String>,
    pub enrollment_number: Option<String>,
    pub branch: Option<String>,
    pub section: Option<String>,
    pub department: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DepartmentSimple {
    pub id: String,
    pub name: String,
    pub code: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TeamSimple {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserResponse {
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: RoleEnum,
    pub sprint_track: Option<SprintTrackEnum>,
    pub department: Option<DepartmentSimple>,
    pub team: Option<TeamSimple>,
    pub status: Option<String>,
    pub has_access_code: Option<bool>,
    pub enrollment_number: Option<String>,
    pub branch: Option<String>,
    pub section: Option<String>,
    pub department_unit: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AccessRequest {
    pub id: String,
    pub user_id: String,
    pub email: String,
    pub name: String,
    pub requested_at: Option<NaiveDateTime>,
    pub reviewed_at: Option<NaiveDateTime>,
    pub reviewed_by: Option<String>,
    pub status: String,
    pub reason: Option<String>,
    pub enrollment_number: Option<String>,
    pub branch: Option<String>,
    pub section: Option<String>,
    pub department: Option<String>,
}
