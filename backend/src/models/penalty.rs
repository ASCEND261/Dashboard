use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct PenaltyRecord {
    pub id: String,
    pub achievement_id: String,
    pub team_id: String,
    pub original_points: i32,
    pub penalty_rate: f64,
    pub penalty_points: i32,
    pub final_team_points: i32,
    pub reason: String,
    pub verified_by: String,
    pub applied_at: Option<NaiveDateTime>,
}
