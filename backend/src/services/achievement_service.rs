use crate::config::Config;
use crate::errors::AppError;
use crate::models::{Achievement, AchievementCategory, AchievementProof, AchievementStatusEnum, User};
use crate::services::audit_service::record_audit_event;
use crate::services::verification_service::evaluate_submission_for_auto_verify;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct AchievementSubmitRequest {
    pub category_slug: String,
    pub title: String,
    pub description: String,
    pub achievement_date: String,
    pub metadata: serde_json::Value,
    pub proof_id: String,
}

#[derive(Debug, Serialize)]
pub struct ProofSimpleResponse {
    pub id: String,
    pub file_name: String,
    pub mime_type: String,
    pub file_size_bytes: i32,
    pub uploaded_at: Option<chrono::NaiveDateTime>,
    pub view_token: String,
}

#[derive(Debug, Serialize)]
pub struct MemberSubmissionResponse {
    pub id: String,
    pub category_name: String,
    pub category_slug: String,
    pub title: String,
    pub description: String,
    pub achievement_date: String,
    pub status: AchievementStatusEnum,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub feedback_reason: Option<String>,
    pub proofs: Vec<ProofSimpleResponse>,
}

pub async fn submit_achievement(
    pool: &PgPool,
    user: &User,
    req: AchievementSubmitRequest,
    config: &Config,
) -> Result<MemberSubmissionResponse, AppError> {
    // 1. Verify Category
    let category = sqlx::query_as::<_, AchievementCategory>(
        "SELECT * FROM achievement_categories WHERE slug = $1 AND is_active = 1",
    )
    .bind(&req.category_slug)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::BadRequest(format!("Invalid achievement category: {}", req.category_slug)))?;

    // 1.1 Substance Validation: Prevent blank, spam, or gibberish claims
    let trimmed_title = req.title.trim();
    let trimmed_desc = req.description.trim();

    if trimmed_title.len() < 5 {
        return Err(AppError::Unprocessable(
            "Achievement title must be at least 5 characters describing the achievement.".to_string(),
        ));
    }

    if trimmed_desc.len() < 10 {
        return Err(AppError::Unprocessable(
            "Achievement description must be at least 10 characters providing verifiable context.".to_string(),
        ));
    }

    let vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
    let lower_title = trimmed_title.to_lowercase();
    let has_vowel = lower_title.chars().any(|c| vowels.contains(&c));
    let is_spam = lower_title == "asdfg"
        || lower_title == "test"
        || lower_title == "testing"
        || lower_title == "gjhy"
        || lower_title == "qwerty"
        || lower_title.chars().all(|c| c == lower_title.chars().next().unwrap_or(' '));

    if !has_vowel || is_spam {
        return Err(AppError::Unprocessable(
            "Invalid achievement title. Please provide a substantive, recognizable title describing your achievement.".to_string(),
        ));
    }

    // 2. Vague submission prevention: check required fields
    if let Some(req_fields) = category.required_fields.as_array() {
        let mut missing_fields = Vec::new();
        for field in req_fields {
            if field.get("required").and_then(|r| r.as_bool()).unwrap_or(false) {
                if let Some(name) = field.get("name").and_then(|n| n.as_str()) {
                    let has_val = req
                        .metadata
                        .get(name)
                        .map(|v| !v.is_null() && !v.as_str().unwrap_or("").trim().is_empty())
                        .unwrap_or(false);
                    if !has_val {
                        let label = field.get("label").and_then(|l| l.as_str()).unwrap_or(name);
                        missing_fields.push(label.to_string());
                    }
                }
            }
        }

        if !missing_fields.is_empty() {
            return Err(AppError::Unprocessable(format!(
                "Incomplete submission. The following required fields for {} are missing: {}",
                category.name,
                missing_fields.join(", ")
            )));
        }
    }

    // 3. Verify Proof
    let proof = sqlx::query_as::<_, AchievementProof>(
        "SELECT * FROM achievement_proofs WHERE id = $1",
    )
    .bind(&req.proof_id)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| {
        AppError::BadRequest(
            "A verified proof document is mandatory. Please upload a certificate or document before submitting.".to_string(),
        )
    })?;

    // 4. Generate structured ID: ACH-2026-XXXXX
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM achievements")
        .fetch_one(pool)
        .await?;
    let ach_id = format!("ACH-2026-{:04}-{}", (count + 1) % 10000, &Uuid::new_v4().simple().to_string()[..8]);

    let now = Utc::now().naive_utc();
    let team_id = user.team_id.as_deref().unwrap_or("ASCEND");

    let mut tx = pool.begin().await?;

    // 5. Insert Achievement (Zero points field accepted from client!)
    let achievement = sqlx::query_as::<_, Achievement>(
        r#"
        INSERT INTO achievements (
            id, user_id, team_id, category_id, title, description,
            achievement_date, metadata_json, status, created_at, updated_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, 'SUBMITTED', $9, $9
        )
        RETURNING *
        "#,
    )
    .bind(&ach_id)
    .bind(&user.id)
    .bind(team_id)
    .bind(&category.id)
    .bind(req.title.trim())
    .bind(req.description.trim())
    .bind(&req.achievement_date)
    .bind(&req.metadata)
    .bind(now)
    .fetch_one(&mut *tx)
    .await?;

    // 6. Link Proof to Achievement
    sqlx::query("UPDATE achievement_proofs SET achievement_id = $1 WHERE id = $2")
        .bind(&achievement.id)
        .bind(&proof.id)
        .execute(&mut *tx)
        .await?;

    // 7. Record Audit Log
    record_audit_event(
        &mut *tx,
        "ACHIEVEMENT",
        &achievement.id,
        "SUBMITTED",
        &user.id,
        Some(&user.name),
        Some(user.role.as_str()),
        serde_json::json!({
            "category": category.slug,
            "title": achievement.title,
            "team": team_id,
            "proof_hash": proof.file_hash_sha256,
        }),
    )
    .await?;

    tx.commit().await?;

    // 8. Execute Universal AutoVerify & Evidence Gate
    let autoverify_eval = evaluate_submission_for_auto_verify(
        pool,
        &achievement.id,
        user,
        config,
    )
    .await?;

    let final_status = match autoverify_eval.status.as_str() {
        "VERIFIED" => AchievementStatusEnum::Verified,
        "REJECTED" => AchievementStatusEnum::Rejected,
        _ => AchievementStatusEnum::UnderReview,
    };

    let feedback_reason = match &autoverify_eval.outcome {
        crate::services::verification_service::AutoVerifyOutcome::InvalidEvidence { reason } => Some(reason.clone()),
        crate::services::verification_service::AutoVerifyOutcome::NeedsCoreReview { reason, .. } => Some(reason.clone()),
        _ => None,
    };

    let view_token = crate::services::proof_service::generate_signed_view_token(&proof.id, &user.id, &config.jwt_secret);

    Ok(MemberSubmissionResponse {
        id: achievement.id,
        category_name: category.name,
        category_slug: category.slug,
        title: achievement.title,
        description: achievement.description,
        achievement_date: achievement.achievement_date,
        status: final_status,
        created_at: achievement.created_at,
        feedback_reason,
        proofs: vec![ProofSimpleResponse {
            id: proof.id,
            file_name: proof.file_name,
            mime_type: proof.mime_type,
            file_size_bytes: proof.file_size_bytes,
            uploaded_at: proof.uploaded_at,
            view_token,
        }],
    })
}
