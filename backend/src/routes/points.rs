use crate::errors::AppError;
use crate::middleware::rbac::{RequireAdmin, RequireCoreMember};
use crate::models::{
    Achievement, AchievementCategory, PenaltyRecord, PointLedger, PointRule,
    PointRuleVersion,
};
use crate::services::audit_service::record_audit_event;
use crate::services::ledger_service::{apply_fraud_plagiarism_penalty, reverse_point_transaction};
use crate::services::point_engine::{calculate_points, OFFICIAL_VERSION};
use crate::services::team_score_service::calculate_team_score;
use crate::state::AppState;
use axum::{
    extract::{Path, Query, State},
    Json,
};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct RulesQuery {
    pub version_id: Option<String>,
    pub category: Option<String>,
}

pub async fn list_rules(
    State(state): State<AppState>,
    Query(query): Query<RulesQuery>,
) -> Result<Json<Vec<PointRule>>, AppError> {
    let version = query.version_id.as_deref().unwrap_or(OFFICIAL_VERSION);

    let rules = if let Some(cat) = &query.category {
        sqlx::query_as::<_, PointRule>(
            "SELECT * FROM point_rules WHERE version_id = $1 AND category_slug = $2 AND is_active = true ORDER BY points DESC",
        )
        .bind(version)
        .bind(cat)
        .fetch_all(&state.db)
        .await?
    } else {
        sqlx::query_as::<_, PointRule>(
            "SELECT * FROM point_rules WHERE version_id = $1 AND is_active = true ORDER BY category_slug, points DESC",
        )
        .bind(version)
        .fetch_all(&state.db)
        .await?
    };

    Ok(Json(rules))
}

pub async fn list_rule_versions(
    State(state): State<AppState>,
) -> Result<Json<Vec<PointRuleVersion>>, AppError> {
    let versions = sqlx::query_as::<_, PointRuleVersion>(
        "SELECT * FROM point_rule_versions ORDER BY created_at DESC",
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(versions))
}

#[derive(Debug, Deserialize)]
pub struct CreateRuleRequest {
    pub rule_code: String,
    pub version_id: String,
    pub category_slug: String,
    pub condition_key: String,
    pub condition_val: String,
    pub points: i32,
    pub scope: String,
    pub activity_type: String,
    pub description: Option<String>,
}

pub async fn create_rule(
    State(state): State<AppState>,
    RequireAdmin(admin): RequireAdmin,
    Json(req): Json<CreateRuleRequest>,
) -> Result<Json<PointRule>, AppError> {
    let id = format!("RULE-{}", Uuid::new_v4().simple());
    let now = Utc::now().naive_utc();

    let rule = sqlx::query_as::<_, PointRule>(
        r#"
        INSERT INTO point_rules (
            id, rule_code, version_id, category_slug, condition_key, condition_val,
            points, scope, activity_type, description, is_active, created_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, true, $11
        )
        RETURNING *
        "#,
    )
    .bind(&id)
    .bind(&req.rule_code)
    .bind(&req.version_id)
    .bind(&req.category_slug)
    .bind(&req.condition_key)
    .bind(&req.condition_val)
    .bind(req.points)
    .bind(&req.scope)
    .bind(&req.activity_type)
    .bind(&req.description)
    .bind(now)
    .fetch_one(&state.db)
    .await?;

    record_audit_event(
        &state.db,
        "POINT_RULE",
        &rule.id,
        "CREATED",
        &admin.id,
        Some(&admin.name),
        Some(admin.role.as_str()),
        serde_json::json!({ "rule_code": rule.rule_code, "points": rule.points }),
    )
    .await?;

    Ok(Json(rule))
}

#[derive(Debug, Serialize)]
pub struct ScoreExplanationResponse {
    pub achievement_id: String,
    pub category_slug: String,
    pub rule_id: String,
    pub rule_code: String,
    pub rule_version: String,
    pub base_points: i32,
    pub bonus_points: i32,
    pub penalty_points: i32,
    pub final_points: i32,
    pub scope: String,
    pub condition_matched: String,
    pub calculation_formula: String,
    pub official_reference: String,
}

pub async fn get_score_explanation(
    State(state): State<AppState>,
    RequireCoreMember(_user): RequireCoreMember,
    Path(id): Path<String>,
) -> Result<Json<ScoreExplanationResponse>, AppError> {
    let ach = sqlx::query_as::<_, Achievement>("SELECT * FROM achievements WHERE id = $1")
        .bind(&id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Achievement not found.".to_string()))?;

    let cat = sqlx::query_as::<_, AchievementCategory>("SELECT * FROM achievement_categories WHERE id = $1")
        .bind(&ach.category_id)
        .fetch_optional(&state.db)
        .await?;
    let cat_slug = cat.map(|c| c.slug).unwrap_or_else(|| "other".to_string());

    let calc_res = calculate_points(&cat_slug, &ach.metadata_json, Some(OFFICIAL_VERSION));

    let formula = format!(
        "Points = Base ({}) [Scope: {}] - Deterministic evaluation from Tech Sprint Journey 2026 ruleset",
        calc_res.points, calc_res.scope
    );

    Ok(Json(ScoreExplanationResponse {
        achievement_id: ach.id,
        category_slug: cat_slug,
        rule_id: calc_res.rule_id,
        rule_code: calc_res.rule_code,
        rule_version: calc_res.rule_version,
        base_points: calc_res.points,
        bonus_points: 0,
        penalty_points: 0,
        final_points: calc_res.points,
        scope: calc_res.scope,
        condition_matched: calc_res.condition_matched,
        calculation_formula: formula,
        official_reference: "Tech Sprint Journey 2026 — Official Points & Scoring System (TSJ-2026-v1)".to_string(),
    }))
}

#[derive(Debug, Deserialize)]
pub struct PenaltyRequest {
    pub reason: String,
}

#[derive(Debug, Serialize)]
pub struct PenaltyResponse {
    pub success: bool,
    pub penalty: PenaltyRecord,
    pub previous_team_score: i32,
    pub new_team_score: i32,
}

pub async fn apply_penalty(
    State(state): State<AppState>,
    RequireCoreMember(verifier): RequireCoreMember,
    Path(id): Path<String>,
    Json(req): Json<PenaltyRequest>,
) -> Result<Json<PenaltyResponse>, AppError> {
    let ach = sqlx::query_as::<_, Achievement>("SELECT * FROM achievements WHERE id = $1")
        .bind(&id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Achievement not found.".to_string()))?;

    let points: i32 = sqlx::query_scalar(
        "SELECT points FROM point_calculations WHERE achievement_id = $1",
    )
    .bind(&ach.id)
    .fetch_optional(&state.db)
    .await?
    .unwrap_or(0);

    if points == 0 {
        return Err(AppError::BadRequest(
            "Cannot apply plagiarism penalty to an achievement with 0 points.".to_string(),
        ));
    }

    let prev_score = calculate_team_score(&state.db, &ach.team_id).await?;

    let mut tx = state.db.begin().await?;

    let penalty_rec = apply_fraud_plagiarism_penalty(
        &mut tx,
        &ach.id,
        &ach.team_id,
        points,
        &req.reason,
        &verifier.id,
    )
    .await?;

    record_audit_event(
        &mut *tx,
        "PENALTY",
        &penalty_rec.id,
        "APPLIED",
        &verifier.id,
        Some(&verifier.name),
        Some(verifier.role.as_str()),
        serde_json::json!({
            "achievement_id": ach.id,
            "original_points": points,
            "penalty_points": penalty_rec.penalty_points,
            "reason": req.reason,
        }),
    )
    .await?;

    tx.commit().await?;

    let new_score = calculate_team_score(&state.db, &ach.team_id).await?;

    Ok(Json(PenaltyResponse {
        success: true,
        penalty: penalty_rec,
        previous_team_score: prev_score,
        new_team_score: new_score,
    }))
}

#[derive(Debug, Deserialize)]
pub struct MeetupAttendanceRequest {
    pub meetup_id: String,
    pub meetup_date: String,
    pub team_id: String,
    pub present_member_ids: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct MeetupAttendanceResponse {
    pub success: bool,
    pub meetup_id: String,
    pub total_points_awarded: i32,
    pub members_credited: usize,
    pub duplicates_skipped: usize,
}

pub async fn record_meetup_attendance(
    State(state): State<AppState>,
    RequireCoreMember(verifier): RequireCoreMember,
    Json(req): Json<MeetupAttendanceRequest>,
) -> Result<Json<MeetupAttendanceResponse>, AppError> {
    // Official Rule 12: Meetup Attendance
    // 5 points per member present credited to TEAM and INDIVIDUAL
    // Strict duplicate check per (team_id, meetup_id, member_id)
    let mut tx = state.db.begin().await?;
    let now = Utc::now().naive_utc();

    let mut members_credited = 0;
    let mut duplicates_skipped = 0;

    for member_id in req.present_member_ids {
        // Check duplicate
        let existing = sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*) FROM meetup_attendance 
            WHERE team_id = $1 AND meetup_id = $2 AND member_id = $3
            "#,
        )
        .bind(&req.team_id)
        .bind(&req.meetup_id)
        .bind(&member_id)
        .fetch_one(&mut *tx)
        .await?;

        if existing > 0 {
            duplicates_skipped += 1;
            continue;
        }

        let att_id = format!("ATT-{}", Uuid::new_v4().simple());
        sqlx::query(
            r#"
            INSERT INTO meetup_attendance (id, meetup_id, team_id, member_id, meetup_date, verified_by, verified_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            "#,
        )
        .bind(&att_id)
        .bind(&req.meetup_id)
        .bind(&req.team_id)
        .bind(&member_id)
        .bind(&req.meetup_date)
        .bind(&verifier.id)
        .bind(now)
        .execute(&mut *tx)
        .await?;

        // 1. Team Ledger Entry (+5)
        let team_lid = format!("LEDGER-TEAM-{}", Uuid::new_v4().simple());
        sqlx::query(
            r#"
            INSERT INTO point_ledger (
                id, achievement_id, member_id, team_id, source_type, source_id,
                rule_id, rule_version, base_points, bonus_points, penalty_points,
                final_points, scope, status, created_at, created_by
            ) VALUES (
                $1, NULL, $2, $3, 'MEETUP_ATTENDANCE', $4,
                'RULE-MEETUP-ATTENDANCE', $5, 5, 0, 0,
                5, 'TEAM'::ledgerscopeenum, 'APPLIED'::ledgerstatusenum, $6, $7
            )
            "#,
        )
        .bind(&team_lid)
        .bind(&member_id)
        .bind(&req.team_id)
        .bind(format!("{}:{}", req.meetup_id, member_id))
        .bind(OFFICIAL_VERSION)
        .bind(now)
        .bind(&verifier.id)
        .execute(&mut *tx)
        .await?;

        // 2. Individual Ledger Entry (+5)
        let ind_lid = format!("LEDGER-INDIV-{}", Uuid::new_v4().simple());
        sqlx::query(
            r#"
            INSERT INTO point_ledger (
                id, achievement_id, member_id, team_id, source_type, source_id,
                rule_id, rule_version, base_points, bonus_points, penalty_points,
                final_points, scope, status, created_at, created_by
            ) VALUES (
                $1, NULL, $2, $3, 'MEETUP_ATTENDANCE', $4,
                'RULE-MEETUP-ATTENDANCE', $5, 5, 0, 0,
                5, 'INDIVIDUAL'::ledgerscopeenum, 'APPLIED'::ledgerstatusenum, $6, $7
            )
            "#,
        )
        .bind(&ind_lid)
        .bind(&member_id)
        .bind(&req.team_id)
        .bind(format!("{}:{}", req.meetup_id, member_id))
        .bind(OFFICIAL_VERSION)
        .bind(now)
        .bind(&verifier.id)
        .execute(&mut *tx)
        .await?;

        members_credited += 1;
    }

    record_audit_event(
        &mut *tx,
        "MEETUP",
        &req.meetup_id,
        "ATTENDANCE_RECORDED",
        &verifier.id,
        Some(&verifier.name),
        Some(verifier.role.as_str()),
        serde_json::json!({
            "team_id": req.team_id,
            "credited": members_credited,
            "skipped": duplicates_skipped,
        }),
    )
    .await?;

    tx.commit().await?;

    Ok(Json(MeetupAttendanceResponse {
        success: true,
        meetup_id: req.meetup_id,
        total_points_awarded: (members_credited * 5) as i32,
        members_credited,
        duplicates_skipped,
    }))
}

#[derive(Debug, Deserialize)]
pub struct ReverseLedgerRequest {
    pub source_type: String,
    pub source_id: String,
    pub reason: String,
}

#[derive(Debug, Serialize)]
pub struct ReverseLedgerResponse {
    pub success: bool,
    pub reversed_count: usize,
    pub reversals: Vec<PointLedger>,
}

pub async fn reverse_ledger(
    State(state): State<AppState>,
    RequireAdmin(admin): RequireAdmin,
    Json(req): Json<ReverseLedgerRequest>,
) -> Result<Json<ReverseLedgerResponse>, AppError> {
    let mut tx = state.db.begin().await?;

    let reversals = reverse_point_transaction(
        &mut tx,
        &req.source_type,
        &req.source_id,
        &req.reason,
        &admin.id,
    )
    .await?;

    record_audit_event(
        &mut *tx,
        "POINT_LEDGER",
        &req.source_id,
        "REVERSED",
        &admin.id,
        Some(&admin.name),
        Some(admin.role.as_str()),
        serde_json::json!({
            "source_type": req.source_type,
            "reversals_count": reversals.len(),
            "reason": req.reason,
        }),
    )
    .await?;

    tx.commit().await?;

    Ok(Json(ReverseLedgerResponse {
        success: true,
        reversed_count: reversals.len(),
        reversals,
    }))
}
