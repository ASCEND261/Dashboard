use crate::errors::AppError;
use hmac::{Hmac, Mac};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::Path;

type HmacSha256 = Hmac<Sha256>;

pub fn validate_and_hash_file(
    data: &[u8],
    content_type: &str,
    max_size: usize,
) -> Result<String, AppError> {
    if data.len() > max_size {
        return Err(AppError::BadRequest(format!(
            "File exceeds maximum allowed size of {} MB.",
            max_size / (1024 * 1024)
        )));
    }

    let valid_mimes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if !valid_mimes.contains(&content_type) {
        return Err(AppError::BadRequest(
            "Unsupported document type. Only PDF, PNG, and JPG documents are accepted.".to_string(),
        ));
    }

    let mut hasher = Sha256::new();
    hasher.update(data);
    let hash = hex::encode(hasher.finalize());

    Ok(hash)
}

pub async fn save_proof_file(
    supabase_url: &str,
    supabase_key: &str,
    filename: &str,
    data: &[u8],
    mime_type: &str,
) -> Result<String, AppError> {
    let client = reqwest::Client::new();
    let url = format!("{}/storage/v1/object/proofs/{}", supabase_url, filename);

    let res = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", mime_type)
        .body(data.to_vec())
        .send()
        .await
        .map_err(|e| AppError::Internal(format!("Failed to connect to Supabase: {}", e)))?;

    if !res.status().is_success() {
        let err_text = res.text().await.unwrap_or_default();
        return Err(AppError::Internal(format!("Failed to upload to Supabase: {}", err_text)));
    }

    Ok(filename.to_string())
}

pub fn generate_signed_view_token(proof_id: &str, user_id: &str, secret: &str) -> String {
    let raw = format!("{}:{}:{}", proof_id, user_id, chrono::Utc::now().timestamp());
    let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).expect("Valid key length");
    mac.update(raw.as_bytes());
    let signature = hex::encode(mac.finalize().into_bytes());

    format!("{}.{}", hex::encode(raw.as_bytes()), signature)
}

pub fn verify_signed_view_token(token: &str, secret: &str) -> Result<String, AppError> {
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 2 {
        return Err(AppError::Unauthorized("Invalid signed proof token format.".to_string()));
    }

    let raw_bytes = hex::decode(parts[0])
        .map_err(|_| AppError::Unauthorized("Malformed proof token payload.".to_string()))?;
    let raw_str = String::from_utf8(raw_bytes)
        .map_err(|_| AppError::Unauthorized("Invalid proof token encoding.".to_string()))?;

    let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).expect("Valid key length");
    mac.update(raw_str.as_bytes());

    let expected_sig = hex::encode(mac.finalize().into_bytes());
    if expected_sig != parts[1] {
        return Err(AppError::Unauthorized("Tampered or invalid proof token signature.".to_string()));
    }

    // Extract proof_id from "proof_id:user_id:timestamp"
    let sub_parts: Vec<&str> = raw_str.split(':').collect();
    if sub_parts.is_empty() {
        return Err(AppError::Unauthorized("Invalid proof token claims.".to_string()));
    }

    Ok(sub_parts[0].to_string())
}
