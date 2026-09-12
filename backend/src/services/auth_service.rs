use crate::errors::AppError;
use crate::models::User;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub role: String,
    pub team_id: Option<String>,
    pub name: String,
    pub exp: usize,
}

pub fn verify_password(plain: &str, hashed: &str) -> bool {
    if hashed.starts_with("$argon2") {
        if let Ok(parsed_hash) = PasswordHash::new(hashed) {
            return Argon2::default()
                .verify_password(plain.as_bytes(), &parsed_hash)
                .is_ok();
        }
    } else if hashed.starts_with("$2") {
        // Bcrypt compatibility for existing seeded database users
        return bcrypt::verify(plain, hashed).unwrap_or(false);
    }
    false
}

pub fn hash_password(plain: &str) -> Result<String, AppError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    argon2
        .hash_password(plain.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|e| AppError::Internal(format!("Failed to hash password: {}", e)))
}

pub fn generate_jwt(user: &User, secret: &str, duration_hours: i64) -> Result<String, AppError> {
    let expiration = Utc::now()
        .checked_add_signed(Duration::hours(duration_hours))
        .expect("Valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: user.id.clone(),
        role: user.role.as_str().to_string(),
        team_id: user.team_id.clone(),
        name: user.name.clone(),
        exp: expiration,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| AppError::Internal(format!("JWT generation error: {}", e)))
}

pub fn verify_jwt(token: &str, secret: &str) -> Result<Claims, AppError> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| AppError::Unauthorized("Invalid or expired authorization token.".to_string()))?;

    Ok(token_data.claims)
}
