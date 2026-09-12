use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct PointRuleVersion {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub effective_from: Option<NaiveDateTime>,
    pub effective_to: Option<NaiveDateTime>,
    pub is_active: Option<bool>,
    pub created_at: Option<NaiveDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct PointRule {
    pub id: String,
    pub rule_code: String,
    pub version_id: String,
    pub category_slug: String,
    pub condition_key: String,
    pub condition_val: String,
    pub points: i32,
    pub scope: String,
    pub activity_type: String,
    pub description: Option<String>,
    pub is_active: Option<bool>,
    pub created_at: Option<NaiveDateTime>,
}
