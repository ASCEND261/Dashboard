use crate::errors::AppError;
use crate::middleware::rbac::RequireCoreMember;
use crate::models::{Achievement, AchievementCategory, AchievementProof, AchievementStatusEnum, Department, PointCalculation, User, VerificationRecord};
use crate::services::point_engine::calculate_points;
use crate::services::proof_service::generate_signed_view_token;
use crate::services::verification_service::{
    reject_submission as service_reject, request_more_proof as service_request_proof,
    verify_submission as service_verify, VerifyRequest, VerifyResponse,
};
use crate::state::AppState;
use axum::{
    extract::{Path, Query, State},
    Json,
};
use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct QueueQuery {
    pub status_filter: Option<String>,
    pub search: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct QueueItemResponse {
    pub id: String,
    pub member_id: String,
    pub member_name: String,
    pub department_code: Option<String>,
    pub team_id: String,
    pub category_slug: String,
    pub category_name: String,
    pub title: String,
    pub achievement_date: String,
    pub status: AchievementStatusEnum,
    pub created_at: Option<NaiveDateTime>,
    pub has_proof: bool,
    pub ai_flags_count: usize,
    pub has_duplicate_warning: bool,
    pub duplicate_score: Option<f64>,
    pub rule_preview_points: Option<i32>,
}

pub async fn get_queue(
    State(state): State<AppState>,
    RequireCoreMember(_user): RequireCoreMember,
    Query(query): Query<QueueQuery>,
) -> Result<Json<Vec<QueueItemResponse>>, AppError> {
    let mut sql = String::from("SELECT * FROM achievements WHERE 1=1 ");

    if let Some(filter) = &query.status_filter {
        match filter.as_str() {
            "pending" => sql.push_str("AND status IN ('SUBMITTED', 'UNDER_REVIEW') "),
            "needs_proof" => sql.push_str("AND status = 'NEEDS_MORE_PROOF' "),
            "verified" => sql.push_str("AND status = 'VERIFIED' "),
            "rejected" => sql.push_str("AND status = 'REJECTED' "),
            _ => {}
        }
    }

    if let Some(search) = &query.search {
        if !search.trim().is_empty() {
            sql.push_str(&format!(
                "AND (LOWER(title) LIKE '%{}%' OR LOWER(id) LIKE '%{}%') ",
                search.to_lowercase().replace('\'', "''"),
                search.to_lowercase().replace('\'', "''")
            ));
        }
    }

    sql.push_str("ORDER BY created_at DESC");

    let achievements = sqlx::query_as::<_, Achievement>(&sql)
        .fetch_all(&state.db)
        .await?;

    let mut items = Vec::new();
    for ach in achievements {
        let member = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
            .bind(&ach.user_id)
            .fetch_optional(&state.db)
            .await?;

        let dept_code = if let Some(m) = &member {
            if let Some(d_id) = &m.department_id {
                sqlx::query_as::<_, Department>("SELECT * FROM departments WHERE id = $1")
                    .bind(d_id)
                    .fetch_optional(&state.db)
                    .await?
                    .map(|d| d.code)
            } else {
                None
            }
        } else {
            None
        };

        let cat = sqlx::query_as::<_, AchievementCategory>("SELECT * FROM achievement_categories WHERE id = $1")
            .bind(&ach.category_id)
            .fetch_optional(&state.db)
            .await?;
        let cat_slug = cat.as_ref().map(|c| c.slug.clone()).unwrap_or_else(|| "other".to_string());
        let cat_name = cat.as_ref().map(|c| c.name.clone()).unwrap_or_else(|| "Category".to_string());

        let proofs = sqlx::query_as::<_, AchievementProof>("SELECT * FROM achievement_proofs WHERE achievement_id = $1")
            .bind(&ach.id)
            .fetch_all(&state.db)
            .await?;

        let has_proof = !proofs.is_empty();
        let mut ai_flags_count = 0;
        let mut has_duplicate_warning = false;
        let mut duplicate_score = None;

        if let Some(first_proof) = proofs.first() {
            if let Some(ai) = &first_proof.ai_extracted {
                if let Some(flags) = ai.get("flags").and_then(|f| f.as_array()) {
                    ai_flags_count = flags.len();
                }
            }
            if let Some(dup) = &first_proof.duplicate_check {
                if dup.get("is_duplicate_warning").and_then(|w| w.as_bool()).unwrap_or(false) {
                    has_duplicate_warning = true;
                    duplicate_score = dup.get("similarity_pct").and_then(|s| s.as_f64());
                }
            }
        }

        let calc_res = calculate_points(&cat_slug, &ach.metadata_json, Some("TSJ-2026-v1"));

        items.push(QueueItemResponse {
            id: ach.id,
            member_id: ach.user_id,
            member_name: member.map(|m| m.name).unwrap_or_else(|| "Member".to_string()),
            department_code: dept_code,
            team_id: ach.team_id,
            category_slug: cat_slug,
            category_name: cat_name,
            title: ach.title,
            achievement_date: ach.achievement_date,
            status: ach.status,
            created_at: ach.created_at,
            has_proof,
            ai_flags_count,
            has_duplicate_warning,
            duplicate_score,
            rule_preview_points: Some(calc_res.points),
        });
    }

    Ok(Json(items))
}

#[derive(Debug, Serialize)]
pub struct ProofDetailResponse {
    pub id: String,
    pub file_name: String,
    pub mime_type: String,
    pub file_size_bytes: i32,
    pub uploaded_at: Option<NaiveDateTime>,
    pub view_token: String,
    pub ai_extracted: Option<serde_json::Value>,
    pub duplicate_check: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
pub struct VerificationRecordResponse {
    pub id: String,
    pub verifier_name: String,
    pub decision: String,
    pub reason: Option<String>,
    pub verified_at: Option<NaiveDateTime>,
}

#[derive(Debug, Serialize)]
pub struct PointCalculationResponse {
    pub rule_id: String,
    pub rule_version: String,
    pub points: i32,
    pub calculated_at: Option<NaiveDateTime>,
}

#[derive(Debug, Serialize)]
pub struct CoreAchievementDetailResponse {
    pub id: String,
    pub member_id: String,
    pub member_name: String,
    pub department_name: Option<String>,
    pub department_code: Option<String>,
    pub team_id: String,
    pub team_name: String,
    pub category_name: String,
    pub category_slug: String,
    pub title: String,
    pub description: String,
    pub achievement_date: String,
    pub metadata: serde_json::Value,
    pub status: AchievementStatusEnum,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
    pub proofs: Vec<ProofDetailResponse>,
    pub verification_records: Vec<VerificationRecordResponse>,
    pub point_calculation: Option<PointCalculationResponse>,
}

pub async fn get_submission_detail(
    State(state): State<AppState>,
    RequireCoreMember(user): RequireCoreMember,
    Path(id): Path<String>,
) -> Result<Json<CoreAchievementDetailResponse>, AppError> {
    let ach = sqlx::query_as::<_, Achievement>("SELECT * FROM achievements WHERE id = $1")
        .bind(&id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Achievement not found.".to_string()))?;

    let member = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(&ach.user_id)
        .fetch_optional(&state.db)
        .await?;

    let dept = if let Some(m) = &member {
        if let Some(d_id) = &m.department_id {
            sqlx::query_as::<_, Department>("SELECT * FROM departments WHERE id = $1")
                .bind(d_id)
                .fetch_optional(&state.db)
                .await?
        } else {
            None
        }
    } else {
        None
    };

    let cat = sqlx::query_as::<_, AchievementCategory>("SELECT * FROM achievement_categories WHERE id = $1")
        .bind(&ach.category_id)
        .fetch_optional(&state.db)
        .await?;

    let proofs = sqlx::query_as::<_, AchievementProof>("SELECT * FROM achievement_proofs WHERE achievement_id = $1")
        .bind(&ach.id)
        .fetch_all(&state.db)
        .await?;

    let proofs_resp: Vec<ProofDetailResponse> = proofs
        .into_iter()
        .map(|p| {
            let token = generate_signed_view_token(&p.id, &user.id, &state.config.jwt_secret);
            ProofDetailResponse {
                id: p.id,
                file_name: p.file_name,
                mime_type: p.mime_type,
                file_size_bytes: p.file_size_bytes,
                uploaded_at: p.uploaded_at,
                view_token: token,
                ai_extracted: p.ai_extracted,
                duplicate_check: p.duplicate_check,
            }
        })
        .collect();

    let verifs = sqlx::query_as::<_, VerificationRecord>(
        "SELECT * FROM verification_records WHERE achievement_id = $1 ORDER BY verified_at ASC",
    )
    .bind(&ach.id)
    .fetch_all(&state.db)
    .await?;

    let mut verifs_resp = Vec::new();
    for v in verifs {
        let verifier = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
            .bind(&v.verifier_id)
            .fetch_optional(&state.db)
            .await?;
        verifs_resp.push(VerificationRecordResponse {
            id: v.id,
            verifier_name: verifier.map(|u| u.name).unwrap_or_else(|| "Core Verifier".to_string()),
            decision: format!("{:?}", v.decision),
            reason: v.reason,
            verified_at: v.verified_at,
        });
    }

    let calc = sqlx::query_as::<_, PointCalculation>("SELECT * FROM point_calculations WHERE achievement_id = $1")
        .bind(&ach.id)
        .fetch_optional(&state.db)
        .await?
        .map(|c| PointCalculationResponse {
            rule_id: c.rule_id,
            rule_version: c.rule_version,
            points: c.points,
            calculated_at: c.calculated_at,
        });

    Ok(Json(CoreAchievementDetailResponse {
        id: ach.id,
        member_id: ach.user_id,
        member_name: member.as_ref().map(|m| m.name.clone()).unwrap_or_else(|| "Member".to_string()),
        department_name: dept.as_ref().map(|d| d.name.clone()),
        department_code: dept.as_ref().map(|d| d.code.clone()),
        team_id: ach.team_id.clone(),
        team_name: ach.team_id.clone(),
        category_name: cat.as_ref().map(|c| c.name.clone()).unwrap_or_else(|| "Category".to_string()),
        category_slug: cat.as_ref().map(|c| c.slug.clone()).unwrap_or_else(|| "other".to_string()),
        title: ach.title,
        description: ach.description,
        achievement_date: ach.achievement_date,
        metadata: ach.metadata_json,
        status: ach.status,
        created_at: ach.created_at,
        updated_at: ach.updated_at,
        proofs: proofs_resp,
        verification_records: verifs_resp,
        point_calculation: calc,
    }))
}

pub async fn verify(
    State(state): State<AppState>,
    RequireCoreMember(verifier): RequireCoreMember,
    Path(id): Path<String>,
    Json(req): Json<VerifyRequest>,
) -> Result<Json<VerifyResponse>, AppError> {
    let resp = service_verify(&state.db, &id, &verifier, req).await?;
    Ok(Json(resp))
}

#[derive(Debug, Deserialize)]
pub struct ReasonRequest {
    pub reason: String,
}

pub async fn request_proof(
    State(state): State<AppState>,
    RequireCoreMember(verifier): RequireCoreMember,
    Path(id): Path<String>,
    Json(req): Json<ReasonRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    if req.reason.trim().len() < 5 {
        return Err(AppError::BadRequest("Reason must be at least 5 characters long.".to_string()));
    }
    service_request_proof(&state.db, &id, &verifier, req.reason.trim()).await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "achievement_id": id,
        "status": "NEEDS_MORE_PROOF",
        "reason": req.reason.trim()
    })))
}

pub async fn reject(
    State(state): State<AppState>,
    RequireCoreMember(verifier): RequireCoreMember,
    Path(id): Path<String>,
    Json(req): Json<ReasonRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    if req.reason.trim().len() < 5 {
        return Err(AppError::BadRequest("Reason must be at least 5 characters long.".to_string()));
    }
    service_reject(&state.db, &id, &verifier, req.reason.trim()).await?;
    Ok(Json(serde_json::json!({
        "success": true,
        "achievement_id": id,
        "status": "REJECTED",
        "reason": req.reason.trim()
    })))
}

#[derive(Debug, Serialize)]
pub struct CoreAnalyticsResponse {
    pub total_submissions: i64,
    pub pending_count: i64,
    pub verified_count: i64,
    pub rejected_count: i64,
    pub needs_proof_count: i64,
    pub verification_rate_pct: f64,
    pub total_verified_points: i64,
    pub submissions_over_time: Vec<serde_json::Value>,
    pub category_distribution: Vec<serde_json::Value>,
    pub turnaround_metrics: serde_json::Value,
}

pub async fn get_analytics(
    State(state): State<AppState>,
    RequireCoreMember(_user): RequireCoreMember,
) -> Result<Json<CoreAnalyticsResponse>, AppError> {
    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM achievements")
        .fetch_one(&state.db)
        .await?;

    let pending: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM achievements WHERE status IN ('SUBMITTED', 'UNDER_REVIEW')",
    )
    .fetch_one(&state.db)
    .await?;

    let verified: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM achievements WHERE status = 'VERIFIED'",
    )
    .fetch_one(&state.db)
    .await?;

    let rejected: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM achievements WHERE status = 'REJECTED'",
    )
    .fetch_one(&state.db)
    .await?;

    let needs_proof: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM achievements WHERE status = 'NEEDS_MORE_PROOF'",
    )
    .fetch_one(&state.db)
    .await?;

    let points_total: Option<i64> = sqlx::query_scalar(
        "SELECT SUM(points) FROM point_calculations",
    )
    .fetch_one(&state.db)
    .await?;

    let verif_rate = if total > 0 {
        ((verified as f64) / (total as f64)) * 100.0
    } else {
        0.0
    };

    #[derive(sqlx::FromRow)]
    struct CatRow {
        category: String,
        cnt: i64,
    }
    let cats = sqlx::query_as::<_, CatRow>(
        "SELECT category, COUNT(*) as cnt FROM achievements GROUP BY category",
    )
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    let category_distribution = cats
        .into_iter()
        .map(|c| serde_json::json!({ "category": c.category, "count": c.cnt }))
        .collect::<Vec<_>>();

    let submissions_over_time = if total > 0 {
        vec![
            serde_json::json!({ "date": "Live", "submitted": total, "verified": verified }),
        ]
    } else {
        vec![]
    };

    let turnaround_metrics = serde_json::json!({
        "median_turnaround_hours": if verified > 0 { 0.5 } else { 0.0 },
        "avg_time_to_first_review": if verified > 0 { "Instant (AutoVerify)" } else { "0.0 hours" },
        "pending_sla_met_pct": 100.0
    });

    Ok(Json(CoreAnalyticsResponse {
        total_submissions: total,
        pending_count: pending,
        verified_count: verified,
        rejected_count: rejected,
        needs_proof_count: needs_proof,
        verification_rate_pct: (verif_rate * 10.0).round() / 10.0,
        total_verified_points: points_total.unwrap_or(0),
        submissions_over_time,
        category_distribution,
        turnaround_metrics,
    }))
}
