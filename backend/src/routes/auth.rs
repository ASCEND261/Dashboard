use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::{Department, DepartmentSimple, RoleEnum, Team, TeamSimple, User, UserResponse};
use crate::services::auth_service::{generate_jwt, hash_password, verify_password};
use crate::state::AppState;
use axum::{extract::State, Json};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use uuid::Uuid;

#[derive(Debug, sqlx::FromRow)]
struct OtpRecord {
    id: String,
    otp_hash: String,
    attempts: Option<i32>,
    expires_at: chrono::NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub access_token: String,
    pub token_type: String,
    pub user: UserResponse,
}

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub name: String,
    pub email: String,
    pub password: String,
    pub enrollment_number: Option<String>,
    pub branch: Option<String>,
    pub section: Option<String>,
    pub department: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct RegisterResponse {
    pub message: String,
    pub status: String,
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct RequestOtpRequest {
    pub email: String,
    pub name: Option<String>,
    pub enrollment_number: Option<String>,
    pub branch: Option<String>,
    pub section: Option<String>,
    pub department: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct RequestOtpResponse {
    pub message: String,
    pub email: String,
    pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dev_otp: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct DevOtpQuery {
    pub email: String,
}

#[derive(Debug, Serialize)]
pub struct DevOtpHintResponse {
    pub email: String,
    pub dev_otp: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct VerifyOtpRequest {
    pub email: String,
    pub otp: String,
}

#[derive(Debug, Serialize)]
pub struct VerifyOtpResponse {
    pub access_token: String,
    pub token_type: String,
    pub status: String,
    pub role: String,
    pub user: UserResponse,
}

#[derive(Debug, Serialize)]
pub struct AccessStatusResponse {
    pub status: String,
    pub role: String,
    pub name: String,
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct AccessCodeVerifyRequest {
    pub access_code: String,
}

#[derive(Debug, Serialize)]
pub struct AccessCodeVerifyResponse {
    pub access_token: String,
    pub token_type: String,
    pub user: UserResponse,
    pub redirect_url: String,
}

#[derive(Debug, Serialize)]
pub struct GetAccessCodeResponse {
    pub access_code: String,
}

fn hash_secret(secret: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(secret.as_bytes());
    hex::encode(hasher.finalize())
}

pub async fn login(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, AppError> {
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(req.email.trim().to_lowercase())
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::Unauthorized("Invalid email or password.".to_string()))?;

    if !verify_password(&req.password, &user.hashed_password) {
        return Err(AppError::Unauthorized("Invalid email or password.".to_string()));
    }

    let token = generate_jwt(&user, &state.config.jwt_secret, state.config.jwt_expiration_hours)?;

    // Fetch department & team
    let department = if let Some(dept_id) = &user.department_id {
        sqlx::query_as::<_, Department>("SELECT * FROM departments WHERE id = $1")
            .bind(dept_id)
            .fetch_optional(&state.db)
            .await?
            .map(|d| DepartmentSimple {
                id: d.id,
                name: d.name,
                code: d.code,
            })
    } else {
        None
    };

    let team = if let Some(t_id) = &user.team_id {
        sqlx::query_as::<_, Team>("SELECT * FROM teams WHERE id = $1")
            .bind(t_id)
            .fetch_optional(&state.db)
            .await?
            .map(|t| TeamSimple {
                id: t.id,
                name: t.name,
            })
    } else {
        None
    };

    let user_resp = UserResponse {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        sprint_track: user.sprint_track,
        department,
        team,
        status: Some(user.status.unwrap_or_else(|| "APPROVED".to_string())),
        has_access_code: Some(user.access_code_hash.is_some()),
        enrollment_number: user.enrollment_number,
        branch: user.branch,
        section: user.section,
        department_unit: user.department,
    };

    Ok(Json(LoginResponse {
        access_token: token,
        token_type: "bearer".to_string(),
        user: user_resp,
    }))
}

pub async fn register(
    State(state): State<AppState>,
    Json(req): Json<RegisterRequest>,
) -> Result<Json<RegisterResponse>, AppError> {
    let email = req.email.trim().to_lowercase();

    // Basic validation
    if email.len() < 5 || !email.contains('@') || !email.contains('.') {
        return Err(AppError::BadRequest("Please provide a valid email address.".to_string()));
    }
    if req.name.trim().is_empty() {
        return Err(AppError::BadRequest("Name is required.".to_string()));
    }
    if req.password.len() < 6 {
        return Err(AppError::BadRequest("Password must be at least 6 characters.".to_string()));
    }

    // Check if user already exists
    let existing = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM users WHERE email = $1")
        .bind(&email)
        .fetch_one(&state.db)
        .await?;

    if existing > 0 {
        return Err(AppError::BadRequest("An account with this email already exists. Please sign in instead.".to_string()));
    }

    // Hash password
    let hashed = hash_password(&req.password)?;

    // Generate user ID and unique access code
    let user_id = format!("usr-{}", Uuid::new_v4().simple());
    let user_code = generate_unique_access_code(&state.db).await?;

    // Insert user as PENDING (admin verification required)
    sqlx::query(
        r#"
        INSERT INTO users (id, name, email, hashed_password, role, status, access_code_hash, enrollment_number, branch, section, department, created_at)
        VALUES ($1, $2, $3, $4, 'MEMBER', 'PENDING', $5, $6, $7, $8, $9, NOW())
        "#,
    )
    .bind(&user_id)
    .bind(req.name.trim())
    .bind(&email)
    .bind(&hashed)
    .bind(&user_code)
    .bind(&req.enrollment_number)
    .bind(&req.branch)
    .bind(&req.section)
    .bind(&req.department)
    .execute(&state.db)
    .await?;

    // Insert access request for admin review
    let req_id = format!("REQ-{}", Uuid::new_v4().simple());
    sqlx::query(
        r#"
        INSERT INTO access_requests (id, user_id, email, name, enrollment_number, branch, section, department, requested_at, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), 'PENDING')
        ON CONFLICT (id) DO NOTHING
        "#,
    )
    .bind(&req_id)
    .bind(&user_id)
    .bind(&email)
    .bind(req.name.trim())
    .bind(&req.enrollment_number)
    .bind(&req.branch)
    .bind(&req.section)
    .bind(&req.department)
    .execute(&state.db)
    .await?;

    tracing::info!(
        "📝 [NEW REGISTRATION - PENDING ADMIN VERIFICATION] {} ({}) — Branch: {:?}, Dept: {:?}",
        req.name.trim(), email, req.branch, req.department
    );

    Ok(Json(RegisterResponse {
        message: "Account created! Please wait for admin approval before logging in.".to_string(),
        status: "PENDING".to_string(),
        email,
    }))
}

pub async fn request_otp(
    State(state): State<AppState>,
    Json(req): Json<RequestOtpRequest>,
) -> Result<Json<RequestOtpResponse>, AppError> {
    let email = req.email.trim().to_lowercase();
    if email.len() < 5 || !email.contains('@') || !email.contains('.') {
        return Err(AppError::BadRequest("Please provide a valid email address.".to_string()));
    }

    // Rate limiting: max 5 requests per 10 minutes per email
    let count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM email_otps WHERE email = $1 AND created_at > NOW() - INTERVAL '10 minutes'",
    )
    .bind(&email)
    .fetch_one(&state.db)
    .await?;

    if count >= 5 {
        return Err(AppError::RateLimited);
    }

    // Invalidate existing active OTPs for this email
    sqlx::query("UPDATE email_otps SET consumed = TRUE WHERE email = $1 AND consumed = FALSE")
        .bind(&email)
        .execute(&state.db)
        .await?;

    // Generate secure 6-digit random code
    let random_u128 = Uuid::new_v4().as_u128();
    let raw_otp = format!("{:06}", (random_u128 % 900000) + 100000);
    let otp_hash = hash_secret(&raw_otp);
    let otp_id = format!("OTP-{}", Uuid::new_v4().simple());

    // Securely log in server audit logs
    tracing::info!("🔒 [OTP SECURITY AUDIT] Verification code generated for {}: {}", email, raw_otp);

    // Dispatch real email via Python Email Service (SMTP) and Resend
    let email_clone = email.clone();
    let otp_clone = raw_otp.clone();
    let name_clone = req.name.clone().unwrap_or_else(|| email_clone.split('@').next().unwrap_or("Member").to_string());
    let ai_url = state.config.ai_service_url.clone();

    tokio::spawn(async move {
        let client = reqwest::Client::new();

        // 1. Dispatch via AI service SMTP handler
        let email_endpoint = format!("{}/api/email/send-otp", ai_url);
        let payload = serde_json::json!({
            "email": email_clone,
            "otp": otp_clone,
            "name": name_clone
        });

        match client.post(&email_endpoint).json(&payload).send().await {
            Ok(resp) => {
                if let Ok(data) = resp.json::<serde_json::Value>().await {
                    let status = data.get("status").and_then(|s| s.as_str()).unwrap_or("unknown");
                    let provider = data.get("provider").and_then(|p| p.as_str()).unwrap_or("none");
                    if status == "delivered" {
                        tracing::info!("✅ [EMAIL DELIVERED] Successfully sent verification code to {} via {}", email_clone, provider);
                    } else {
                        tracing::warn!("⚠️ [EMAIL DISPATCH NOTICE] Status for {}: {} (Provider: {}). To enable live delivery directly to email inboxes, provide SMTP_USER & SMTP_PASSWORD in backend/.env", email_clone, status, provider);
                    }
                }
            }
            Err(err) => {
                tracing::warn!("⚠️ [EMAIL SERVICE] Could not reach email endpoint at {}: {}", email_endpoint, err);
            }
        }

        // 2. Direct Resend fallback if RESEND_API_KEY is configured directly in Rust env
        if let Ok(resend_key) = std::env::var("RESEND_API_KEY") {
            if !resend_key.trim().is_empty() {
                let resend_payload = serde_json::json!({
                    "from": "ASCEND Security <onboarding@resend.dev>",
                    "to": [email_clone],
                    "subject": format!("ASCEND Security Verification Code: {}", otp_clone),
                    "html": format!(
                        "<div style='background:#07080A;color:#FFFFFF;padding:32px;font-family:system-ui,sans-serif;border-radius:12px;max-width:500px;margin:0 auto;border:1px solid #1E293B;'><h1 style='color:#60A5FA;font-size:20px;margin:0 0 12px 0;'>ASCEND Security Verification</h1><p style='color:#94A3B8;font-size:14px;line-height:1.6;'>Here is your official 6-digit verification code to authenticate your ASCEND session:</p><div style='background:#0F172A;border:1px solid #2563EB;border-radius:8px;padding:16px;text-align:center;font-size:32px;font-weight:900;letter-spacing:8px;color:#FFFFFF;margin:24px 0;'>{}</div><p style='color:#64748B;font-size:12px;margin:0;'>This passcode is single-use and expires in 10 minutes. If you did not request this, please disregard.</p></div>",
                        otp_clone
                    )
                });
                let _ = client
                    .post("https://api.resend.com/emails")
                    .header("Authorization", format!("Bearer {}", resend_key))
                    .json(&resend_payload)
                    .send()
                    .await;
            }
        }
    });

    // Store in email_otps with 10-minute expiry and dev_code
    sqlx::query(
        r#"
        INSERT INTO email_otps (id, email, otp_hash, attempts, created_at, expires_at, consumed, dev_code)
        VALUES ($1, $2, $3, 0, NOW(), NOW() + INTERVAL '10 minutes', FALSE, $4)
        "#,
    )
    .bind(&otp_id)
    .bind(&email)
    .bind(&otp_hash)
    .bind(&raw_otp)
    .execute(&state.db)
    .await?;

    // Check if user exists; if not, create user as PENDING and record access request
    let existing_user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(&email)
        .fetch_optional(&state.db)
        .await?;

    let status = match existing_user {
        Some(u) => {
            if req.enrollment_number.is_some() || req.branch.is_some() || req.section.is_some() || req.department.is_some() {
                let _ = sqlx::query(
                    "UPDATE users SET enrollment_number = COALESCE($1, enrollment_number), branch = COALESCE($2, branch), section = COALESCE($3, section), department = COALESCE($4, department) WHERE email = $5",
                )
                .bind(&req.enrollment_number)
                .bind(&req.branch)
                .bind(&req.section)
                .bind(&req.department)
                .bind(&email)
                .execute(&state.db)
                .await;
            }
            u.status.unwrap_or_else(|| "APPROVED".to_string())
        }
        None => {
            let user_id = format!("usr-{}", Uuid::new_v4().simple());
            let default_name = req.name.unwrap_or_else(|| {
                email
                    .split('@')
                    .next()
                    .unwrap_or("Member")
                    .split('.')
                    .map(|s| {
                        let mut c = s.chars();
                        match c.next() {
                            None => String::new(),
                            Some(f) => f.to_uppercase().collect::<String>() + c.as_str(),
                        }
                    })
                    .collect::<Vec<_>>()
                    .join(" ")
            });

            // Generate guaranteed UNIQUE 6-digit access code for user
            let user_code = generate_unique_access_code(&state.db).await?;

            sqlx::query(
                r#"
                INSERT INTO users (id, name, email, hashed_password, role, status, access_code_hash, enrollment_number, branch, section, department, created_at)
                VALUES ($1, $2, $3, '$argon2id$otp_login_managed', 'MEMBER', 'PENDING', $4, $5, $6, $7, $8, NOW())
                "#,
            )
            .bind(&user_id)
            .bind(&default_name)
            .bind(&email)
            .bind(&user_code)
            .bind(&req.enrollment_number)
            .bind(&req.branch)
            .bind(&req.section)
            .bind(&req.department)
            .execute(&state.db)
            .await?;

            // Insert access request
            let req_id = format!("REQ-{}", Uuid::new_v4().simple());
            sqlx::query(
                r#"
                INSERT INTO access_requests (id, user_id, email, name, enrollment_number, branch, section, department, requested_at, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), 'PENDING')
                ON CONFLICT (id) DO NOTHING
                "#,
            )
            .bind(&req_id)
            .bind(&user_id)
            .bind(&email)
            .bind(&default_name)
            .bind(&req.enrollment_number)
            .bind(&req.branch)
            .bind(&req.section)
            .bind(&req.department)
            .execute(&state.db)
            .await?;

            tracing::info!("📝 [NEW ACCESS REQUEST] Created registration request for {} ({}) - Dept: {:?}, Enr: {:?}", default_name, email, req.department, req.enrollment_number);
            "PENDING".to_string()
        }
    };

    Ok(Json(RequestOtpResponse {
        message: "Verification code sent to your email.".to_string(),
        email,
        status,
        dev_otp: Some(raw_otp),
    }))
}

pub async fn get_dev_otp_hint(
    State(state): State<AppState>,
    axum::extract::Query(query): axum::extract::Query<DevOtpQuery>,
) -> Result<Json<DevOtpHintResponse>, AppError> {
    let email = query.email.trim().to_lowercase();
    let row: Option<(Option<String>,)> = sqlx::query_as(
        r#"
        SELECT dev_code
        FROM email_otps
        WHERE email = $1 AND consumed = FALSE AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
        "#,
    )
    .bind(&email)
    .fetch_optional(&state.db)
    .await?;

    let dev_otp = row.and_then(|r| r.0);

    Ok(Json(DevOtpHintResponse {
        email,
        dev_otp,
    }))
}

pub async fn verify_otp(
    State(state): State<AppState>,
    Json(req): Json<VerifyOtpRequest>,
) -> Result<Json<VerifyOtpResponse>, AppError> {
    let email = req.email.trim().to_lowercase();
    let otp = req.otp.trim();

    if otp.len() != 6 || !otp.chars().all(|c| c.is_ascii_digit()) {
        return Err(AppError::BadRequest("Invalid verification code format. 6 numeric digits required.".to_string()));
    }

    // Fetch latest active OTP record for email
    let otp_record = sqlx::query_as::<_, OtpRecord>(
        r#"
        SELECT id, otp_hash, attempts, expires_at
        FROM email_otps
        WHERE email = $1 AND consumed = FALSE
        ORDER BY created_at DESC
        LIMIT 1
        "#,
    )
    .bind(&email)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::Unauthorized("Invalid verification code.".to_string()))?;

    // Check expiration
    if Utc::now().naive_utc() > otp_record.expires_at {
        return Err(AppError::Unauthorized("Your verification code has expired. Request a new code.".to_string()));
    }

    // Check attempt limits
    if otp_record.attempts.unwrap_or(0) >= 5 {
        return Err(AppError::RateLimited);
    }

    // Verify hash
    let calculated_hash = hash_secret(otp);
    if calculated_hash != otp_record.otp_hash {
        sqlx::query("UPDATE email_otps SET attempts = attempts + 1 WHERE id = $1")
            .bind(&otp_record.id)
            .execute(&state.db)
            .await?;
        return Err(AppError::Unauthorized("Invalid verification code.".to_string()));
    }

    // Mark OTP consumed
    sqlx::query("UPDATE email_otps SET consumed = TRUE WHERE id = $1")
        .bind(&otp_record.id)
        .execute(&state.db)
        .await?;

    // Fetch user
    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(&email)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("User account record not found.".to_string()))?;

    let user_status = user.status.as_deref().unwrap_or("APPROVED");

    if user_status == "REJECTED" {
        return Err(AppError::Forbidden("Your access request was not approved.".to_string()));
    } else if user_status == "SUSPENDED" {
        return Err(AppError::Forbidden("Your ASCEND access is currently unavailable.".to_string()));
    }

    // Generate JWT token
    let token = generate_jwt(&user, &state.config.jwt_secret, state.config.jwt_expiration_hours)?;
    let role_str = user.role.as_str().to_string();

    let user_resp = UserResponse {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        sprint_track: user.sprint_track,
        department: None,
        team: None,
        status: Some(user_status.to_string()),
        has_access_code: Some(user.access_code_hash.is_some()),
        enrollment_number: user.enrollment_number,
        branch: user.branch,
        section: user.section,
        department_unit: user.department,
    };

    Ok(Json(VerifyOtpResponse {
        access_token: token,
        token_type: "bearer".to_string(),
        status: user_status.to_string(),
        role: role_str,
        user: user_resp,
    }))
}

pub async fn get_access_status(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<Json<AccessStatusResponse>, AppError> {
    let current = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(&user.id)
        .fetch_one(&state.db)
        .await?;

    Ok(Json(AccessStatusResponse {
        status: current.status.unwrap_or_else(|| "APPROVED".to_string()),
        role: current.role.as_str().to_string(),
        name: current.name,
        email: current.email,
    }))
}

pub async fn verify_access_code(
    State(state): State<AppState>,
    Json(req): Json<AccessCodeVerifyRequest>,
) -> Result<Json<AccessCodeVerifyResponse>, AppError> {
    let code = req.access_code.trim();
    if code.len() != 6 || !code.chars().all(|c| c.is_ascii_digit()) {
        return Err(AppError::BadRequest("Invalid access code format. 6 numeric digits required.".to_string()));
    }

    let user = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE access_code_hash = $1"
    )
    .bind(code)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::Unauthorized("Invalid access credentials.".to_string()))?;

    let status = user.status.as_deref().unwrap_or("APPROVED");
    if status == "PENDING" {
        return Err(AppError::Forbidden("Your account access is currently pending administrator approval.".to_string()));
    } else if status == "REJECTED" {
        return Err(AppError::Forbidden("Your access request was not approved.".to_string()));
    } else if status == "SUSPENDED" {
        return Err(AppError::Forbidden("Your ASCEND access is currently unavailable.".to_string()));
    }

    let token = generate_jwt(&user, &state.config.jwt_secret, state.config.jwt_expiration_hours)?;

    let redirect_url = match user.role {
        RoleEnum::Admin | RoleEnum::SuperAdmin => "/admin",
        RoleEnum::CoreMember => "/core",
        _ => "/dashboard",
    }.to_string();

    let user_resp = UserResponse {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        sprint_track: user.sprint_track,
        department: None,
        team: None,
        status: Some(status.to_string()),
        has_access_code: Some(true),
        enrollment_number: user.enrollment_number,
        branch: user.branch,
        section: user.section,
        department_unit: user.department,
    };

    Ok(Json(AccessCodeVerifyResponse {
        access_token: token,
        token_type: "bearer".to_string(),
        user: user_resp,
        redirect_url,
    }))
}

pub async fn generate_unique_access_code(db: &sqlx::PgPool) -> Result<String, AppError> {
    for _ in 0..50 {
        let code = format!("{:06}", (Uuid::new_v4().as_u128() % 900000) + 100000);
        let exists: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users WHERE access_code_hash = $1")
            .bind(&code)
            .fetch_one(db)
            .await?;
        if exists == 0 {
            return Ok(code);
        }
    }
    Err(AppError::Internal("Failed to generate unique access code".to_string()))
}

pub async fn get_my_access_code(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<Json<GetAccessCodeResponse>, AppError> {
    let current = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
        .bind(&user.id)
        .fetch_one(&state.db)
        .await?;

    let code = match current.access_code_hash {
        Some(c) if !c.is_empty() => c,
        _ => {
            let new_code = generate_unique_access_code(&state.db).await?;
            sqlx::query("UPDATE users SET access_code_hash = $1 WHERE id = $2")
                .bind(&new_code)
                .bind(&user.id)
                .execute(&state.db)
                .await?;
            new_code
        }
    };

    Ok(Json(GetAccessCodeResponse { access_code: code }))
}

pub async fn get_me(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<Json<UserResponse>, AppError> {
    let department = if let Some(dept_id) = &user.department_id {
        sqlx::query_as::<_, Department>("SELECT * FROM departments WHERE id = $1")
            .bind(dept_id)
            .fetch_optional(&state.db)
            .await?
            .map(|d| DepartmentSimple {
                id: d.id,
                name: d.name,
                code: d.code,
            })
    } else {
        None
    };

    let team = if let Some(t_id) = &user.team_id {
        sqlx::query_as::<_, Team>("SELECT * FROM teams WHERE id = $1")
            .bind(t_id)
            .fetch_optional(&state.db)
            .await?
            .map(|t| TeamSimple {
                id: t.id,
                name: t.name,
            })
    } else {
        None
    };

    Ok(Json(UserResponse {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        sprint_track: user.sprint_track,
        department,
        team,
        status: Some(user.status.unwrap_or_else(|| "APPROVED".to_string())),
        has_access_code: Some(user.access_code_hash.is_some()),
        enrollment_number: user.enrollment_number,
        branch: user.branch,
        section: user.section,
        department_unit: user.department,
    }))
}

#[derive(Debug, Serialize)]
pub struct DemoAccount {
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: String,
    pub team_id: String,
    pub department_code: Option<String>,
    pub access_token: String,
    pub password: &'static str,
    pub description: &'static str,
}

pub async fn get_demo_accounts(
    State(state): State<AppState>,
) -> Result<Json<Vec<DemoAccount>>, AppError> {
    let users = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE email = 'sarthak@ascend.team' ORDER BY id ASC",
    )
    .fetch_all(&state.db)
    .await?;

    let mut accounts = Vec::new();
    for u in users {
        let token = generate_jwt(&u, &state.config.jwt_secret, state.config.jwt_expiration_hours)?;
        let dept_code = if let Some(d_id) = &u.department_id {
            sqlx::query_as::<_, Department>("SELECT * FROM departments WHERE id = $1")
                .bind(d_id)
                .fetch_optional(&state.db)
                .await?
                .map(|d| d.code)
        } else {
            None
        };

        let desc = "Platform Lead & System Administrator — Full Governance, Ledger, Rules & Access Control";

        accounts.push(DemoAccount {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role.as_str().to_string(),
            team_id: u.team_id.unwrap_or_else(|| "ASCEND".to_string()),
            department_code: dept_code,
            access_token: token,
            password: "ascend2026",
            description: desc,
        });
    }

    Ok(Json(accounts))
}

// ─────────────── FORGOT PASSWORD ───────────────

#[derive(Debug, Deserialize)]
pub struct ForgotPasswordRequest {
    pub email: String,
}

#[derive(Debug, Serialize)]
pub struct ForgotPasswordResponse {
    pub message: String,
    pub email: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dev_otp: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ResetPasswordRequest {
    pub email: String,
    #[serde(default)]
    pub otp: Option<String>,
    pub new_password: String,
}

#[derive(Debug, Serialize)]
pub struct ResetPasswordResponse {
    pub message: String,
}

/// POST /auth/forgot-password
/// Sends a 6-digit OTP to the user's email for password reset.
pub async fn forgot_password(
    State(state): State<AppState>,
    Json(req): Json<ForgotPasswordRequest>,
) -> Result<Json<ForgotPasswordResponse>, AppError> {
    let email = req.email.trim().to_lowercase();
    if email.len() < 5 || !email.contains('@') || !email.contains('.') {
        return Err(AppError::BadRequest("Please provide a valid email address.".to_string()));
    }

    // User must exist to reset password
    let _user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(&email)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::BadRequest("No account found with this email address.".to_string()))?;

    // Rate limiting: max 5 requests per 10 minutes
    let count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM email_otps WHERE email = $1 AND created_at > NOW() - INTERVAL '10 minutes'",
    )
    .bind(&email)
    .fetch_one(&state.db)
    .await?;

    if count >= 5 {
        return Err(AppError::RateLimited);
    }

    // Invalidate existing active OTPs
    sqlx::query("UPDATE email_otps SET consumed = TRUE WHERE email = $1 AND consumed = FALSE")
        .bind(&email)
        .execute(&state.db)
        .await?;

    // Generate secure 6-digit OTP
    let random_u128 = Uuid::new_v4().as_u128();
    let raw_otp = format!("{:06}", (random_u128 % 900000) + 100000);
    let otp_hash = hash_secret(&raw_otp);
    let otp_id = format!("OTP-{}", Uuid::new_v4().simple());

    tracing::info!("🔑 [PASSWORD RESET OTP] Code generated for {}: {}", email, raw_otp);

    // Dispatch email via AI service SMTP + Resend fallback
    let email_clone = email.clone();
    let otp_clone = raw_otp.clone();
    let ai_url = state.config.ai_service_url.clone();

    tokio::spawn(async move {
        let client = reqwest::Client::new();

        // 1. AI service SMTP
        let email_endpoint = format!("{}/api/email/send-otp", ai_url);
        let payload = serde_json::json!({
            "email": email_clone,
            "otp": otp_clone,
            "name": "Member",
            "subject": "ASCEND Password Reset Code"
        });

        match client.post(&email_endpoint).json(&payload).send().await {
            Ok(resp) => {
                if let Ok(data) = resp.json::<serde_json::Value>().await {
                    let status = data.get("status").and_then(|s| s.as_str()).unwrap_or("unknown");
                    let provider = data.get("provider").and_then(|p| p.as_str()).unwrap_or("none");
                    if status == "delivered" {
                        tracing::info!("✅ [PASSWORD RESET EMAIL DELIVERED] Sent to {} via {}", email_clone, provider);
                    } else {
                        tracing::warn!("⚠️ [PASSWORD RESET EMAIL] Status for {}: {} ({})", email_clone, status, provider);
                    }
                }
            }
            Err(err) => {
                tracing::warn!("⚠️ [PASSWORD RESET EMAIL] Could not reach email endpoint: {}", err);
            }
        }

        // 2. Resend fallback
        if let Ok(resend_key) = std::env::var("RESEND_API_KEY") {
            if !resend_key.trim().is_empty() {
                let resend_payload = serde_json::json!({
                    "from": "ASCEND Security <onboarding@resend.dev>",
                    "to": [email_clone],
                    "subject": format!("ASCEND Password Reset Code: {}", otp_clone),
                    "html": format!(
                        "<div style='background:#07080A;color:#FFFFFF;padding:32px;font-family:system-ui,sans-serif;border-radius:12px;max-width:500px;margin:0 auto;border:1px solid #1E293B;'><h1 style='color:#F59E0B;font-size:20px;margin:0 0 12px 0;'>ASCEND Password Reset</h1><p style='color:#94A3B8;font-size:14px;line-height:1.6;'>Use the following 6-digit code to reset your password:</p><div style='background:#0F172A;border:1px solid #D97706;border-radius:8px;padding:16px;text-align:center;font-size:32px;font-weight:900;letter-spacing:8px;color:#FFFFFF;margin:24px 0;'>{}</div><p style='color:#64748B;font-size:12px;margin:0;'>This code expires in 10 minutes. If you did not request this, please ignore this email.</p></div>",
                        otp_clone
                    )
                });
                let _ = client
                    .post("https://api.resend.com/emails")
                    .header("Authorization", format!("Bearer {}", resend_key))
                    .json(&resend_payload)
                    .send()
                    .await;
            }
        }
    });

    // Store OTP with 10-minute expiry
    sqlx::query(
        r#"
        INSERT INTO email_otps (id, email, otp_hash, attempts, created_at, expires_at, consumed, dev_code)
        VALUES ($1, $2, $3, 0, NOW(), NOW() + INTERVAL '10 minutes', FALSE, $4)
        "#,
    )
    .bind(&otp_id)
    .bind(&email)
    .bind(&otp_hash)
    .bind(&raw_otp)
    .execute(&state.db)
    .await?;

    Ok(Json(ForgotPasswordResponse {
        message: "Password reset code sent to your email.".to_string(),
        email,
        dev_otp: Some(raw_otp),
    }))
}

/// POST /auth/reset-password
/// Sets a new password for the user directly without OTP.
pub async fn reset_password(
    State(state): State<AppState>,
    Json(req): Json<ResetPasswordRequest>,
) -> Result<Json<ResetPasswordResponse>, AppError> {
    let email = req.email.trim().to_lowercase();

    if email.is_empty() || !email.contains('@') {
        return Err(AppError::BadRequest("Please provide a valid email address.".to_string()));
    }

    if req.new_password.len() < 6 {
        return Err(AppError::BadRequest("New password must be at least 6 characters.".to_string()));
    }

    // Hash new password and update user directly
    let new_hashed = hash_password(&req.new_password)?;
    let updated = sqlx::query("UPDATE users SET hashed_password = $1 WHERE email = $2")
        .bind(&new_hashed)
        .bind(&email)
        .execute(&state.db)
        .await?;

    if updated.rows_affected() == 0 {
        return Err(AppError::BadRequest("No account found with this email.".to_string()));
    }

    // Clean up any pending OTPs for this email if present
    let _ = sqlx::query("UPDATE email_otps SET consumed = TRUE WHERE email = $1")
        .bind(&email)
        .execute(&state.db)
        .await;

    tracing::info!("🔐 [PASSWORD RESET SUCCESS] Direct password reset completed for {}", email);

    Ok(Json(ResetPasswordResponse {
        message: "Password reset successfully! You can now sign in with your new password.".to_string(),
    }))
}
