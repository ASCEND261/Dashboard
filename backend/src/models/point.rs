use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "ledgerscopeenum", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum LedgerScopeEnum {
    Team,
    Individual,
}

impl LedgerScopeEnum {
    pub fn as_str(&self) -> &'static str {
        match self {
            LedgerScopeEnum::Team => "TEAM",
            LedgerScopeEnum::Individual => "INDIVIDUAL",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "ledgerstatusenum", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum LedgerStatusEnum {
    Applied,
    Reversed,
}

impl LedgerStatusEnum {
    pub fn as_str(&self) -> &'static str {
        match self {
            LedgerStatusEnum::Applied => "APPLIED",
            LedgerStatusEnum::Reversed => "REVERSED",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct PointLedger {
    pub id: String,
    pub achievement_id: Option<String>,
    pub member_id: Option<String>,
    pub team_id: String,
    pub source_type: String,
    pub source_id: String,
    pub rule_id: String,
    pub rule_version: String,
    pub base_points: i32,
    pub bonus_points: i32,
    pub penalty_points: i32,
    pub final_points: i32,
    pub scope: LedgerScopeEnum,
    pub status: LedgerStatusEnum,
    pub created_at: Option<NaiveDateTime>,
    pub created_by: String,
}
