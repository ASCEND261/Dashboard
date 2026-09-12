use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AchievementProof {
    pub id: String,
    pub achievement_id: Option<String>,
    pub file_name: String,
    pub file_path: String,
    pub mime_type: String,
    pub file_size_bytes: i32,
    pub file_hash_sha256: String,
    pub ai_extracted: Option<serde_json::Value>,
    pub duplicate_check: Option<serde_json::Value>,
    pub uploaded_at: Option<NaiveDateTime>,
}
