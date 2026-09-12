use crate::errors::AppError;
use crate::middleware::rbac::RequireCoreMember;
use crate::models::AuditLog;
use crate::state::AppState;
use axum::{
    extract::{Query, State},
    Json,
};
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct AuditLogsQuery {
    pub entity_id: Option<String>,
    pub action: Option<String>,
    pub limit: Option<i64>,
}

pub async fn list_audit_logs(
    State(state): State<AppState>,
    RequireCoreMember(_user): RequireCoreMember,
    Query(query): Query<AuditLogsQuery>,
) -> Result<Json<Vec<AuditLog>>, AppError> {
    let limit = query.limit.unwrap_or(50).clamp(1, 100);

    let mut sql = String::from("SELECT * FROM audit_logs WHERE 1=1 ");

    if let Some(entity_id) = &query.entity_id {
        if !entity_id.trim().is_empty() {
            sql.push_str(&format!(
                "AND entity_id = '{}' ",
                entity_id.trim().replace('\'', "''")
            ));
        }
    }

    if let Some(action) = &query.action {
        if !action.trim().is_empty() {
            sql.push_str(&format!(
                "AND action = '{}' ",
                action.trim().replace('\'', "''")
            ));
        }
    }

    sql.push_str(&format!("ORDER BY timestamp DESC LIMIT {}", limit));

    let logs = sqlx::query_as::<_, AuditLog>(&sql)
        .fetch_all(&state.db)
        .await?;

    Ok(Json(logs))
}
