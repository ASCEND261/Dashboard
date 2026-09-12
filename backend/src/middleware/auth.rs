use crate::errors::AppError;
use crate::models::User;
use crate::services::auth_service::verify_jwt;
use crate::state::AppState;
use axum::{
    async_trait,
    extract::FromRequestParts,
    http::request::Parts,
};

pub struct AuthUser(pub User);

#[async_trait]
impl FromRequestParts<AppState> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get("Authorization")
            .and_then(|h| h.to_str().ok())
            .ok_or_else(|| AppError::Unauthorized("Missing Authorization header.".to_string()))?;

        if !auth_header.starts_with("Bearer ") {
            return Err(AppError::Unauthorized(
                "Invalid Authorization scheme. Bearer token required.".to_string(),
            ));
        }

        let token = &auth_header[7..];
        let claims = verify_jwt(token, &state.config.jwt_secret)?;

        let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
            .bind(&claims.sub)
            .fetch_optional(&state.db)
            .await?
            .ok_or_else(|| AppError::Unauthorized("User account not found or deactivated.".to_string()))?;

        let path = parts.uri.path();
        let status = user.status.as_deref().unwrap_or("APPROVED");
        if status == "REJECTED" || status == "SUSPENDED" {
            return Err(AppError::Forbidden("Your ASCEND access is unavailable.".to_string()));
        }
        if status == "PENDING" && !path.ends_with("/auth/access-status") && !path.ends_with("/auth/me") {
            return Err(AppError::Forbidden("Your account access is currently pending administrator approval.".to_string()));
        }

        Ok(AuthUser(user))
    }
}
