use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AuditLog {
    pub id: String,
    pub entity_type: String,
    pub entity_id: String,
    pub actor_id: String,
    pub actor_name: Option<String>,
    pub actor_role: Option<String>,
    pub action: String,
    pub details: Option<serde_json::Value>,
    pub timestamp: Option<NaiveDateTime>,
}
