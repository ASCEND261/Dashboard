use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::User;
use crate::state::AppState;
use axum::{
    async_trait,
    extract::FromRequestParts,
    http::request::Parts,
};

pub struct RequireCoreMember(pub User);

#[async_trait]
impl FromRequestParts<AppState> for RequireCoreMember {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let AuthUser(user) = AuthUser::from_request_parts(parts, state).await?;

        if !user.role.is_core_or_admin() {
            return Err(AppError::Forbidden(
                "Access denied. Core Member or Administrator privileges required.".to_string(),
            ));
        }

        Ok(RequireCoreMember(user))
    }
}

pub struct RequireAdmin(pub User);

#[async_trait]
impl FromRequestParts<AppState> for RequireAdmin {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let AuthUser(user) = AuthUser::from_request_parts(parts, state).await?;

        if !user.role.is_admin() {
            return Err(AppError::Forbidden(
                "Access denied. Administrator privileges required.".to_string(),
            ));
        }

        Ok(RequireAdmin(user))
    }
}
