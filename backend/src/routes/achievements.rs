use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::{Achievement, AchievementCategory, AchievementProof};
use crate::services::achievement_service::{
    submit_achievement as service_submit, AchievementSubmitRequest, MemberSubmissionResponse,
    ProofSimpleResponse,
};
use crate::services::proof_service::generate_signed_view_token;
use crate::state::AppState;
use axum::{extract::State, Json};

pub async fn list_categories(
    State(state): State<AppState>,
) -> Result<Json<Vec<AchievementCategory>>, AppError> {
    let categories = sqlx::query_as::<_, AchievementCategory>(
        "SELECT * FROM achievement_categories WHERE is_active = 1 ORDER BY id ASC",
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(categories))
}

pub async fn submit_achievement(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    Json(req): Json<AchievementSubmitRequest>,
) -> Result<Json<MemberSubmissionResponse>, AppError> {
    let resp = service_submit(&state.db, &user, req, &state.config).await?;
    Ok(Json(resp))
}

pub async fn get_my_submissions(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<Json<Vec<MemberSubmissionResponse>>, AppError> {
    // Member privacy requirement: NO individual points exposed!
    let achievements = sqlx::query_as::<_, Achievement>(
        r#"
        SELECT * FROM achievements 
        WHERE user_id = $1 
        ORDER BY created_at DESC
        "#,
    )
    .bind(&user.id)
    .fetch_all(&state.db)
    .await?;

    let mut result = Vec::new();
    for ach in achievements {
        let cat = sqlx::query_as::<_, AchievementCategory>(
            "SELECT * FROM achievement_categories WHERE id = $1",
        )
        .bind(&ach.category_id)
        .fetch_optional(&state.db)
        .await?;

        let proofs = sqlx::query_as::<_, AchievementProof>(
            "SELECT * FROM achievement_proofs WHERE achievement_id = $1",
        )
        .bind(&ach.id)
        .fetch_all(&state.db)
        .await?;

        let proofs_resp = proofs
            .into_iter()
            .map(|p| {
                let token = generate_signed_view_token(&p.id, &user.id, &state.config.jwt_secret);
                ProofSimpleResponse {
                    id: p.id,
                    file_name: p.file_name,
                    mime_type: p.mime_type,
                    file_size_bytes: p.file_size_bytes,
                    uploaded_at: p.uploaded_at,
                    view_token: token,
                }
            })
            .collect();

        let feedback_reason: Option<String> = sqlx::query_scalar(
            "SELECT reason FROM verification_records WHERE achievement_id = $1 ORDER BY verified_at DESC LIMIT 1",
        )
        .bind(&ach.id)
        .fetch_optional(&state.db)
        .await?;

        result.push(MemberSubmissionResponse {
            id: ach.id,
            category_name: cat.as_ref().map(|c| c.name.clone()).unwrap_or_else(|| "Category".to_string()),
            category_slug: cat.as_ref().map(|c| c.slug.clone()).unwrap_or_else(|| "other".to_string()),
            title: ach.title,
            description: ach.description,
            achievement_date: ach.achievement_date,
            status: ach.status,
            created_at: ach.created_at,
            feedback_reason,
            proofs: proofs_resp,
        });
    }

    Ok(Json(result))
}
