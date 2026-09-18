pub mod achievements;
pub mod admin;
pub mod ai_compat;
pub mod audit;
pub mod auth;
pub mod integration;
pub mod leaderboard;
pub mod points;
pub mod proofs;
pub mod verification;

use crate::state::AppState;
use axum::{
    routing::{get, post},
    Json, Router,
};

pub async fn health_check() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "healthy",
        "service": "ASCEND Authoritative Scoring & Verification Engine",
        "backend": "Rust (Axum 0.7 + Tokio + SQLx)",
        "database": "PostgreSQL",
        "official_ruleset": "TSJ-2026-v1",
        "version": "1.0.0"
    }))
}

pub fn create_api_router() -> Router<AppState> {
    Router::new()
        // Auth & Access Control
        .route("/auth/register", post(auth::register))
        .route("/auth/login", post(auth::login))
        .route("/auth/me", get(auth::get_me))
        .route("/auth/demo-accounts", get(auth::get_demo_accounts))
        .route("/auth/request-otp", post(auth::request_otp))
        .route("/auth/dev-otp-hint", get(auth::get_dev_otp_hint))
        .route("/auth/verify-otp", post(auth::verify_otp))
        .route("/auth/access-status", get(auth::get_access_status))
        .route("/auth/access-code/verify", post(auth::verify_access_code))
        .route("/auth/access-code", get(auth::get_my_access_code))
        // Admin Access Control Queue & Member Leaderboard
        .route("/admin/access-requests", get(admin::list_access_requests))
        .route("/admin/access-requests/:id/approve", post(admin::approve_access_request))
        .route("/admin/access-requests/:id/reject", post(admin::reject_access_request))
        .route("/admin/members-leaderboard", get(admin::get_team_members_leaderboard))
        .route("/admin/members/:id", axum::routing::delete(admin::delete_member))
        // Achievements
        .route("/achievements/categories", get(achievements::list_categories))
        .route("/achievements/submit", post(achievements::submit_achievement))
        .route("/achievements/my", get(achievements::get_my_submissions))
        // Verification & Core Workspace
        .route("/core/queue", get(verification::get_queue))
        .route("/core/submissions/:id", get(verification::get_submission_detail))
        .route("/core/submissions/:id/verify", post(verification::verify))
        .route("/core/submissions/:id/request-proof", post(verification::request_proof))
        .route("/core/submissions/:id/reject", post(verification::reject))
        .route("/core/analytics", get(verification::get_analytics))
        // Points & Rules
        .route("/rules", get(points::list_rules).post(points::create_rule))
        .route("/rules/versions", get(points::list_rule_versions))
        .route("/core/submissions/:id/score-explanation", get(points::get_score_explanation))
        .route("/core/submissions/:id/penalty", post(points::apply_penalty))
        .route("/core/meetup-attendance", post(points::record_meetup_attendance))
        .route("/core/ledger/reverse", post(points::reverse_ledger))
        // Leaderboard & Team Progress
        .route("/leaderboard", get(leaderboard::get_leaderboard))
        .route("/team/progress", get(leaderboard::get_team_progress))
        // Proofs
        .route("/proofs/upload", post(proofs::upload_proof))
        .route("/proofs/view/:token", get(proofs::view_proof))
        .route("/proofs/public/:filename", get(proofs::public_view_proof))
        .route("/proofs/:id/signed-token", get(proofs::get_proof_signed_token))
        // Audit Logs
        .route("/audit-logs", get(audit::list_audit_logs))
        // Central AARVAK Integration
        .route("/integration/verified-achievements", get(integration::get_verified_achievements))
        .route("/integration/sync", post(integration::trigger_aarvak_sync))
        // AI Assistant
        .route("/ai/chat", post(ai_compat::chat_with_guide))
        .route("/ai/format-achievement", post(ai_compat::format_achievement_draft))
}

pub fn create_router(state: AppState) -> Router {
    let api_router = create_api_router();

    Router::new()
        .route("/health", get(health_check))
        .route("/api/health", get(health_check))
        .nest("/api", api_router.clone())
        .nest("/api/v1", api_router)
        .with_state(state)
}
