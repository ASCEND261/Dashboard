use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::AccessRequest;
use crate::services::audit_service::record_audit_event;
use crate::state::AppState;
use axum::{
    extract::{Path, State},
    Json,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct RejectRequestPayload {
    pub reason: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ActionResponse {
    pub status: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub access_code: Option<String>,
}

pub async fn list_access_requests(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<Json<Vec<AccessRequest>>, AppError> {
    if !user.role.is_core_or_admin() {
        return Err(AppError::Forbidden(
            "Only administrators and core members can review access requests.".to_string(),
        ));
    }

    let requests = sqlx::query_as::<_, AccessRequest>(
        "SELECT * FROM access_requests ORDER BY requested_at DESC",
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(requests))
}

pub async fn approve_access_request(
    State(state): State<AppState>,
    AuthUser(admin): AuthUser,
    Path(id): Path<String>,
) -> Result<Json<ActionResponse>, AppError> {
    if !admin.role.is_core_or_admin() {
        return Err(AppError::Forbidden(
            "Only administrators and core members can approve access requests.".to_string(),
        ));
    }

    let req = sqlx::query_as::<_, AccessRequest>(
        "SELECT * FROM access_requests WHERE id = $1",
    )
    .bind(&id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Access request not found.".to_string()))?;

    // Generate guaranteed UNIQUE 6-digit access code if not present
    let generated_code = crate::routes::auth::generate_unique_access_code(&state.db).await?;

    // Update user status to APPROVED
    sqlx::query(
        "UPDATE users SET status = 'APPROVED', access_code_hash = COALESCE(access_code_hash, $1) WHERE id = $2",
    )
    .bind(&generated_code)
    .bind(&req.user_id)
    .execute(&state.db)
    .await?;

    // Update access request status
    sqlx::query(
        "UPDATE access_requests SET status = 'APPROVED', reviewed_at = NOW(), reviewed_by = $1 WHERE id = $2",
    )
    .bind(&admin.id)
    .bind(&id)
    .execute(&state.db)
    .await?;

    // Record audit event
    record_audit_event(
        &state.db,
        "ACCESS_CONTROL",
        &req.user_id,
        "ACCESS_APPROVED",
        &admin.id,
        Some(&admin.name),
        Some(admin.role.as_str()),
        serde_json::json!({
            "email": req.email,
            "request_id": req.id,
            "reviewed_by": admin.id
        }),
    )
    .await?;

    tracing::info!("✅ [ACCESS APPROVED] Access request {} for user {} ({}) approved by {}", id, req.user_id, req.email, admin.email);

    let assigned_code: Option<String> = sqlx::query_scalar("SELECT access_code_hash FROM users WHERE id = $1")
        .bind(&req.user_id)
        .fetch_optional(&state.db)
        .await?;

    Ok(Json(ActionResponse {
        status: "APPROVED".to_string(),
        message: format!("Access request for {} has been approved.", req.email),
        access_code: assigned_code,
    }))
}

pub async fn reject_access_request(
    State(state): State<AppState>,
    AuthUser(admin): AuthUser,
    Path(id): Path<String>,
    Json(payload): Json<RejectRequestPayload>,
) -> Result<Json<ActionResponse>, AppError> {
    if !admin.role.is_core_or_admin() {
        return Err(AppError::Forbidden(
            "Only administrators and core members can reject access requests.".to_string(),
        ));
    }

    let req = sqlx::query_as::<_, AccessRequest>(
        "SELECT * FROM access_requests WHERE id = $1",
    )
    .bind(&id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Access request not found.".to_string()))?;

    let reason = payload.reason.unwrap_or_else(|| "Registration did not meet criteria.".to_string());

    sqlx::query("UPDATE users SET status = 'REJECTED' WHERE id = $1")
        .bind(&req.user_id)
        .execute(&state.db)
        .await?;

    sqlx::query(
        "UPDATE access_requests SET status = 'REJECTED', reviewed_at = NOW(), reviewed_by = $1, reason = $2 WHERE id = $3",
    )
    .bind(&admin.id)
    .bind(&reason)
    .bind(&id)
    .execute(&state.db)
    .await?;

    record_audit_event(
        &state.db,
        "ACCESS_CONTROL",
        &req.user_id,
        "ACCESS_REJECTED",
        &admin.id,
        Some(&admin.name),
        Some(admin.role.as_str()),
        serde_json::json!({
            "email": req.email,
            "request_id": req.id,
            "reason": reason
        }),
    )
    .await?;

    tracing::info!("❌ [ACCESS REJECTED] Access request {} for {} rejected by {}", id, req.email, admin.email);

    Ok(Json(ActionResponse {
        status: "REJECTED".to_string(),
        message: format!("Access request for {} has been rejected.", req.email),
        access_code: None,
    }))
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct TeamMemberLeaderboardEntry {
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: String,
    pub enrollment_number: Option<String>,
    pub branch: Option<String>,
    pub section: Option<String>,
    pub department: Option<String>,
    pub points: i32,
    pub verified_count: i32,
    pub total_submissions: i32,
}

pub async fn get_team_members_leaderboard(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<Json<Vec<TeamMemberLeaderboardEntry>>, AppError> {
    if !user.role.is_core_or_admin() {
        return Err(AppError::Forbidden(
            "Only administrators and core members can view team member analytics.".to_string(),
        ));
    }

    let entries = sqlx::query_as::<_, TeamMemberLeaderboardEntry>(
        r#"
        SELECT 
            u.id,
            u.name,
            u.email,
            u.role::text as role,
            u.enrollment_number,
            u.branch,
            u.section,
            u.department,
            COALESCE((
                SELECT SUM(pl.final_points)
                FROM point_ledger pl
                WHERE pl.member_id = u.id AND pl.scope = 'TEAM' AND pl.status = 'APPLIED'
            ), 0)::integer as points,
            COUNT(DISTINCT CASE WHEN a.status = 'VERIFIED' THEN a.id END)::integer as verified_count,
            COUNT(DISTINCT a.id)::integer as total_submissions
        FROM users u
        LEFT JOIN achievements a ON a.user_id = u.id
        WHERE u.email != 'autoverify@ascend.internal'
        GROUP BY u.id, u.name, u.email, u.role, u.enrollment_number, u.branch, u.section, u.department
        ORDER BY points DESC, verified_count DESC, u.name ASC
        "#,
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(entries))
}

pub async fn delete_member(
    State(state): State<AppState>,
    AuthUser(admin): AuthUser,
    Path(user_id): Path<String>,
) -> Result<Json<ActionResponse>, AppError> {
    if !admin.role.is_admin() {
        return Err(AppError::Forbidden(
            "Only administrators can remove members.".to_string(),
        ));
    }

    if admin.id == user_id {
        return Err(AppError::BadRequest("You cannot remove your own account.".to_string()));
    }

    // Prevent removing other admins
    let target: Option<(String,)> = sqlx::query_as("SELECT role::text FROM users WHERE id = $1")
        .bind(&user_id)
        .fetch_optional(&state.db)
        .await?;

    let (target_role,) = target.ok_or_else(|| AppError::NotFound("Member not found.".to_string()))?;
    if target_role.to_uppercase().contains("ADMIN") || target_role.to_uppercase().contains("SUPER") {
        return Err(AppError::Forbidden("Cannot remove administrator accounts.".to_string()));
    }

    // Clean up access requests first (FK)
    let _ = sqlx::query("DELETE FROM access_requests WHERE user_id = $1")
        .bind(&user_id)
        .execute(&state.db)
        .await;

    // Delete user (ON DELETE CASCADE handles achievements, point_ledger, etc.)
    sqlx::query("DELETE FROM users WHERE id = $1")
        .bind(&user_id)
        .execute(&state.db)
        .await?;

    record_audit_event(
        &state.db,
        "MEMBER_MANAGEMENT",
        &user_id,
        "MEMBER_REMOVED",
        &admin.id,
        Some(&admin.name),
        Some(admin.role.as_str()),
        serde_json::json!({ "removed_by": admin.id, "removed_by_name": admin.name }),
    )
    .await?;

    tracing::info!("🗑️ [MEMBER REMOVED] User {} removed by admin {} ({})", user_id, admin.name, admin.email);

    Ok(Json(ActionResponse {
        status: "REMOVED".to_string(),
        message: "Member has been removed from the platform.".to_string(),
        access_code: None,
    }))
}
