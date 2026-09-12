use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "achievementstatusenum", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum AchievementStatusEnum {
    Submitted,
    UnderReview,
    NeedsMoreProof,
    Verified,
    Rejected,
}

impl AchievementStatusEnum {
    pub fn as_str(&self) -> &'static str {
        match self {
            AchievementStatusEnum::Submitted => "SUBMITTED",
            AchievementStatusEnum::UnderReview => "UNDER_REVIEW",
            AchievementStatusEnum::NeedsMoreProof => "NEEDS_MORE_PROOF",
            AchievementStatusEnum::Verified => "VERIFIED",
            AchievementStatusEnum::Rejected => "REJECTED",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "verificationdecisionenum", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum VerificationDecisionEnum {
    Verified,
    NeedsMoreProof,
    Rejected,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AchievementCategory {
    pub id: String,
    pub slug: String,
    pub name: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub required_fields: serde_json::Value,
    pub is_active: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Achievement {
    pub id: String,
    pub user_id: String,
    pub team_id: String,
    pub category_id: String,
    pub title: String,
    pub description: String,
    pub achievement_date: String,
    pub metadata_json: serde_json::Value,
    pub status: AchievementStatusEnum,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct VerificationRecord {
    pub id: String,
    pub achievement_id: String,
    pub verifier_id: String,
    pub decision: VerificationDecisionEnum,
    pub reason: Option<String>,
    pub rule_id_applied: Option<String>,
    pub verified_at: Option<NaiveDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct PointCalculation {
    pub id: String,
    pub achievement_id: String,
    pub rule_id: String,
    pub rule_version: String,
    pub points: i32,
    pub calculated_at: Option<NaiveDateTime>,
}
