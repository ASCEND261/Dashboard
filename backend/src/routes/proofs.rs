use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::{Achievement, AchievementProof};
use crate::services::proof_service::{
    generate_signed_view_token, save_proof_file, validate_and_hash_file, verify_signed_view_token,
};
use crate::state::AppState;
use axum::{
    body::Body,
    extract::{Multipart, Path, State},
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use chrono::Utc;
use serde::Serialize;
use std::path::Path as StdPath;
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct ProofUploadResponse {
    pub proof_id: String,
    pub file_name: String,
    pub mime_type: String,
    pub file_size_bytes: i32,
    pub view_token: String,
}

pub async fn upload_proof(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    mut multipart: Multipart,
) -> Result<Json<ProofUploadResponse>, AppError> {
    let mut file_data: Option<(String, String, Vec<u8>)> = None;

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| AppError::BadRequest(format!("Multipart error: {}", e)))?
    {
        let name = field.name().unwrap_or_default().to_string();
        if name == "file" {
            let filename = field
                .file_name()
                .unwrap_or("proof_document.pdf")
                .to_string();
            let content_type = field
                .content_type()
                .unwrap_or("application/pdf")
                .to_string();
            let data = field
                .bytes()
                .await
                .map_err(|e| AppError::BadRequest(format!("Failed to read file bytes: {}", e)))?
                .to_vec();
            file_data = Some((filename, content_type, data));
            break;
        }
    }

    let (filename, content_type, data) = file_data
        .ok_or_else(|| AppError::BadRequest("No file field found in request.".to_string()))?;

    if data.is_empty() {
        return Err(AppError::BadRequest("Empty file provided.".to_string()));
    }

    // 10 MB limit
    let max_size = 10 * 1024 * 1024;
    let file_hash = validate_and_hash_file(&data, &content_type, max_size)?;

    let stored_filename = format!("{}_{}", &file_hash[..12], filename.replace(' ', "_"));
    save_proof_file(
        &state.config.supabase_url,
        &state.config.supabase_key,
        &stored_filename,
        &data,
        &content_type,
    )
    .await?;

    let proof_id = format!("PRF-{}", Uuid::new_v4().simple());
    let now = Utc::now().naive_utc();
    let file_size = data.len() as i32;

    let proof = sqlx::query_as::<_, AchievementProof>(
        r#"
        INSERT INTO achievement_proofs (
            id, achievement_id, file_name, file_path, mime_type, file_size_bytes,
            file_hash_sha256, ai_extracted, duplicate_check, uploaded_at
        ) VALUES (
            $1, NULL, $2, $3, $4, $5,
            $6, NULL, NULL, $7
        )
        RETURNING *
        "#,
    )
    .bind(&proof_id)
    .bind(&filename)
    .bind(&stored_filename)
    .bind(&content_type)
    .bind(file_size)
    .bind(&file_hash)
    .bind(now)
    .fetch_one(&state.db)
    .await?;

    let view_token = generate_signed_view_token(&proof.id, &user.id, &state.config.jwt_secret);

    Ok(Json(ProofUploadResponse {
        proof_id: proof.id,
        file_name: proof.file_name,
        mime_type: proof.mime_type,
        file_size_bytes: proof.file_size_bytes,
        view_token,
    }))
}

pub async fn view_proof(
    State(state): State<AppState>,
    Path(token): Path<String>,
) -> Result<Response, AppError> {
    let proof_id = verify_signed_view_token(&token, &state.config.jwt_secret)?;

    let proof = sqlx::query_as::<_, AchievementProof>(
        "SELECT * FROM achievement_proofs WHERE id = $1",
    )
    .bind(&proof_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Proof record not found.".to_string()))?;

    Ok(axum::response::Redirect::temporary(&proof.file_path).into_response())
}

#[derive(Debug, Serialize)]
pub struct SignedTokenResponse {
    pub proof_id: String,
    pub view_token: String,
}

pub async fn get_proof_signed_token(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    Path(proof_id): Path<String>,
) -> Result<Json<SignedTokenResponse>, AppError> {
    let proof = sqlx::query_as::<_, AchievementProof>(
        "SELECT * FROM achievement_proofs WHERE id = $1",
    )
    .bind(&proof_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Proof record not found.".to_string()))?;

    // Authorization: Core Member, Admin, or the Achievement Owner
    let mut is_authorized = user.role.is_core_or_admin();
    if !is_authorized {
        if let Some(ach_id) = &proof.achievement_id {
            let ach = sqlx::query_as::<_, Achievement>("SELECT * FROM achievements WHERE id = $1")
                .bind(ach_id)
                .fetch_optional(&state.db)
                .await?;
            if let Some(a) = ach {
                if a.user_id == user.id {
                    is_authorized = true;
                }
            }
        }
    }

    if !is_authorized {
        return Err(AppError::Forbidden(
            "You are not authorized to view this proof document.".to_string(),
        ));
    }

    let token = generate_signed_view_token(&proof.id, &user.id, &state.config.jwt_secret);

    Ok(Json(SignedTokenResponse {
        proof_id: proof.id,
        view_token: token,
    }))
}

pub async fn public_view_proof(
    State(state): State<AppState>,
    Path(filename): Path<String>,
) -> Result<Response, AppError> {
    if filename.contains('/') || filename.contains('\\') || filename.contains("..") {
        return Err(AppError::BadRequest("Invalid filename".to_string()));
    }

    let url = format!("{}/storage/v1/object/public/proofs/{}", state.config.supabase_url, filename);
    Ok(axum::response::Redirect::temporary(&url).into_response())
}
