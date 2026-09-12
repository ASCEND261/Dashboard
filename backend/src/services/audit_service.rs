use crate::errors::AppError;
use chrono::Utc;
use sqlx::{Executor, Postgres};
use uuid::Uuid;

pub async fn record_audit_event<'e, 'c: 'e, E>(
    executor: E,
    entity_type: &str,
    entity_id: &str,
    action: &str,
    actor_id: &str,
    actor_name: Option<&str>,
    actor_role: Option<&str>,
    details: serde_json::Value,
) -> Result<(), AppError>
where
    E: Executor<'c, Database = Postgres>,
{
    let audit_id = format!("AUD-{}", Uuid::new_v4().simple());
    let now = Utc::now().naive_utc();

    sqlx::query(
        r#"
        INSERT INTO audit_logs (
            id, entity_type, entity_id, action, actor_id, actor_name, actor_role, details, timestamp
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
        "#,
    )
    .bind(&audit_id)
    .bind(entity_type)
    .bind(entity_id)
    .bind(action)
    .bind(actor_id)
    .bind(actor_name)
    .bind(actor_role)
    .bind(details)
    .bind(now)
    .execute(executor)
    .await?;

    Ok(())
}
