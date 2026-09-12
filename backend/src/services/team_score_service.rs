use crate::errors::AppError;
use sqlx::PgPool;

pub async fn calculate_team_score(pool: &PgPool, team_id: &str) -> Result<i32, AppError> {
    // Official Formula (Section 1):
    // TEAM SCORE = sum(all applied TEAM-scope final_points in point_ledger)
    let score: Option<i64> = sqlx::query_scalar(
        r#"
        SELECT SUM(final_points) 
        FROM point_ledger 
        WHERE team_id = $1 
          AND scope = 'TEAM' 
          AND status = 'APPLIED'
        "#,
    )
    .bind(team_id)
    .fetch_one(pool)
    .await?;

    Ok(score.unwrap_or(0) as i32)
}

pub async fn calculate_member_contribution_score(
    pool: &PgPool,
    member_id: &str,
) -> Result<i32, AppError> {
    // Section 25:
    // INDIVIDUAL SCORE = sum(all applied INDIVIDUAL-scope final_points in point_ledger)
    let score: Option<i64> = sqlx::query_scalar(
        r#"
        SELECT SUM(final_points) 
        FROM point_ledger 
        WHERE member_id = $1 
          AND scope = 'INDIVIDUAL' 
          AND status = 'APPLIED'
        "#,
    )
    .bind(member_id)
    .fetch_one(pool)
    .await?;

    Ok(score.unwrap_or(0) as i32)
}
