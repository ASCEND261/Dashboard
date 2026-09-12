use crate::errors::AppError;
use crate::middleware::rbac::RequireCoreMember;
use crate::models::{Achievement, AchievementCategory, PointCalculation, VerificationRecord};
use crate::services::audit_service::record_audit_event;
use crate::state::AppState;
use axum::{extract::State, Json};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct AarvakExportRecord {
    pub achievement_id: String,
    pub team_id: String,
    pub category: String,
    pub title: String,
    pub achievement_date: String,
    pub verification_status: &'static str,
    pub rule_version: String,
    pub points: i32,
    pub verified_at: Option<String>,
    pub sync_status: String,
    pub external_reference_id: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct AarvakExportResponse {
    pub provider: &'static str,
    pub protocol_version: &'static str,
    pub total_verified_eligible: usize,
    pub synced_count: usize,
    pub pending_sync_count: usize,
    pub records: Vec<AarvakExportRecord>,
}

pub async fn get_verified_achievements(
    State(state): State<AppState>,
    RequireCoreMember(_user): RequireCoreMember,
) -> Result<Json<AarvakExportResponse>, AppError> {
    let achievements = sqlx::query_as::<_, Achievement>(
        "SELECT * FROM achievements WHERE status = 'VERIFIED' ORDER BY created_at DESC",
    )
    .fetch_all(&state.db)
    .await?;

    let mut records = Vec::new();
    let mut synced_count = 0;
    let mut pending_sync_count = 0;

    for ach in achievements {
        let cat = sqlx::query_as::<_, AchievementCategory>(
            "SELECT * FROM achievement_categories WHERE id = $1",
        )
        .bind(&ach.category_id)
        .fetch_optional(&state.db)
        .await?;
        let cat_slug = cat.map(|c| c.slug).unwrap_or_else(|| "other".to_string());

        let calc = sqlx::query_as::<_, PointCalculation>(
            "SELECT * FROM point_calculations WHERE achievement_id = $1",
        )
        .bind(&ach.id)
        .fetch_optional(&state.db)
        .await?;

        let rule_version = calc.as_ref().map(|c| c.rule_version.clone()).unwrap_or_else(|| "TSJ-2026-v1".to_string());
        let points = calc.as_ref().map(|c| c.points).unwrap_or(0);

        let verif = sqlx::query_as::<_, VerificationRecord>(
            "SELECT * FROM verification_records WHERE achievement_id = $1 ORDER BY verified_at DESC LIMIT 1",
        )
        .bind(&ach.id)
        .fetch_optional(&state.db)
        .await?;

        let verified_at = verif
            .and_then(|v| v.verified_at)
            .map(|d| d.format("%Y-%m-%dT%H:%M:%SZ").to_string());

        // Check integration event
        let event: Option<(String, Option<String>)> = sqlx::query_as(
            "SELECT sync_status::text, external_reference_id FROM integration_events WHERE achievement_id = $1",
        )
        .bind(&ach.id)
        .fetch_optional(&state.db)
        .await?;

        let (sync_status, ext_ref) = match event {
            Some((s, r)) => (s, r),
            None => ("READY".to_string(), None),
        };

        if sync_status == "SYNCED" {
            synced_count += 1;
        } else {
            pending_sync_count += 1;
        }

        records.push(AarvakExportRecord {
            achievement_id: ach.id,
            team_id: ach.team_id,
            category: cat_slug,
            title: ach.title,
            achievement_date: ach.achievement_date,
            verification_status: "VERIFIED",
            rule_version,
            points,
            verified_at,
            sync_status,
            external_reference_id: ext_ref,
        });
    }

    Ok(Json(AarvakExportResponse {
        provider: "ASCEND Integration Adapter",
        protocol_version: "AARVAK-SYNC-v2",
        total_verified_eligible: records.len(),
        synced_count,
        pending_sync_count,
        records,
    }))
}

#[derive(Debug, Deserialize)]
pub struct AarvakSyncRequest {
    pub achievement_ids: Option<Vec<String>>,
    pub force_resync: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct AarvakSyncResult {
    pub success: bool,
    pub synced_count: usize,
    pub skipped_count: usize,
    pub failed_count: usize,
    pub idempotency_keys: Vec<String>,
    pub timestamp: String,
}

pub async fn trigger_aarvak_sync(
    State(state): State<AppState>,
    RequireCoreMember(user): RequireCoreMember,
    Json(req): Json<AarvakSyncRequest>,
) -> Result<Json<AarvakSyncResult>, AppError> {
    let force_resync = req.force_resync.unwrap_or(false);

    let achievements = if let Some(ids) = &req.achievement_ids {
        if ids.is_empty() {
            vec![]
        } else {
            let placeholders: Vec<String> = ids.iter().enumerate().map(|(i, _)| format!("${}", i + 1)).collect();
            let sql = format!(
                "SELECT * FROM achievements WHERE status = 'VERIFIED' AND id IN ({})",
                placeholders.join(", ")
            );
            let mut q = sqlx::query_as::<_, Achievement>(&sql);
            for id in ids {
                q = q.bind(id);
            }
            q.fetch_all(&state.db).await?
        }
    } else {
        sqlx::query_as::<_, Achievement>(
            "SELECT * FROM achievements WHERE status = 'VERIFIED' ORDER BY created_at DESC",
        )
        .fetch_all(&state.db)
        .await?
    };

    let mut synced_count = 0;
    let mut skipped_count = 0;
    let mut idempotency_keys = Vec::new();
    let now = Utc::now().naive_utc();

    for ach in achievements {
        let existing_status: Option<String> = sqlx::query_scalar(
            "SELECT sync_status::text FROM integration_events WHERE achievement_id = $1",
        )
        .bind(&ach.id)
        .fetch_optional(&state.db)
        .await?;

        if let Some(status) = &existing_status {
            if status == "SYNCED" && !force_resync {
                skipped_count += 1;
                continue;
            }
        }

        let calc = sqlx::query_as::<_, PointCalculation>(
            "SELECT * FROM point_calculations WHERE achievement_id = $1",
        )
        .bind(&ach.id)
        .fetch_optional(&state.db)
        .await?;

        let rule_version = calc.as_ref().map(|c| c.rule_version.as_str()).unwrap_or("TSJ-2026-v1");
        let points = calc.as_ref().map(|c| c.points).unwrap_or(0);
        let external_ref = format!("AARVAK-SYNC-{}-{}-{}", ach.team_id, ach.id, rule_version);

        let payload = serde_json::json!({
            "external_reference_id": external_ref,
            "achievement_id": ach.id,
            "team_id": ach.team_id,
            "title": ach.title,
            "points": points,
            "rule_version": rule_version,
            "sync_time": now.format("%Y-%m-%dT%H:%M:%SZ").to_string(),
        });

        let event_id = format!("EVT-{}", Uuid::new_v4().simple());

        sqlx::query(
            r#"
            INSERT INTO integration_events (
                id, achievement_id, sync_status, attempt_count, last_attempt_at,
                external_reference_id, payload, error_message, created_at
            ) VALUES (
                $1, $2, 'SYNCED', 1, $3,
                $4, $5, NULL, $3
            )
            ON CONFLICT (achievement_id) DO UPDATE 
            SET sync_status = 'SYNCED', attempt_count = integration_events.attempt_count + 1,
                last_attempt_at = EXCLUDED.last_attempt_at,
                external_reference_id = EXCLUDED.external_reference_id,
                payload = EXCLUDED.payload,
                error_message = NULL
            "#,
        )
        .bind(&event_id)
        .bind(&ach.id)
        .bind(now)
        .bind(&external_ref)
        .bind(&payload)
        .execute(&state.db)
        .await?;

        synced_count += 1;
        idempotency_keys.push(external_ref);
    }

    record_audit_event(
        &state.db,
        "INTEGRATION",
        "AARVAK-CENTRAL",
        "SYNC_EXECUTED",
        &user.id,
        Some(&user.name),
        Some(user.role.as_str()),
        serde_json::json!({
            "synced_count": synced_count,
            "skipped_count": skipped_count,
            "idempotency_keys_sample": idempotency_keys.iter().take(5).collect::<Vec<_>>(),
        }),
    )
    .await?;

    Ok(Json(AarvakSyncResult {
        success: true,
        synced_count,
        skipped_count,
        failed_count: 0,
        idempotency_keys,
        timestamp: Utc::now().to_rfc3339(),
    }))
}
