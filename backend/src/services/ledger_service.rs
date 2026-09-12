use crate::errors::AppError;
use crate::models::{PenaltyRecord, PointLedger};
use chrono::Utc;
use sqlx::{Postgres, Transaction};
use uuid::Uuid;

pub async fn apply_verified_points_to_ledger(
    tx: &mut Transaction<'_, Postgres>,
    achievement_id: &str,
    member_id: &str,
    team_id: &str,
    rule_id: &str,
    rule_version: &str,
    points: i32,
    scope: &str,
    verifier_id: &str,
) -> Result<Vec<PointLedger>, AppError> {
    // Idempotency: Check if points already applied for this achievement
    let existing = sqlx::query_as::<_, PointLedger>(
        r#"
        SELECT * FROM point_ledger 
        WHERE source_type = 'ACHIEVEMENT' 
          AND source_id = $1 
          AND status = 'APPLIED'
        "#,
    )
    .bind(achievement_id)
    .fetch_optional(&mut **tx)
    .await?;

    if existing.is_some() {
        tracing::warn!("Achievement {} already has applied ledger entries. Skipping.", achievement_id);
        let entries = sqlx::query_as::<_, PointLedger>(
            r#"
            SELECT * FROM point_ledger 
            WHERE source_type = 'ACHIEVEMENT' AND source_id = $1
            "#,
        )
        .bind(achievement_id)
        .fetch_all(&mut **tx)
        .await?;
        return Ok(entries);
    }

    let now = Utc::now().naive_utc();
    let mut applied_entries = Vec::new();

    // 1. Team Ledger Entry (Always created)
    let team_ledger_id = format!("LEDGER-TEAM-{}", Uuid::new_v4().simple());
    let team_entry = sqlx::query_as::<_, PointLedger>(
        r#"
        INSERT INTO point_ledger (
            id, achievement_id, member_id, team_id, source_type, source_id,
            rule_id, rule_version, base_points, bonus_points, penalty_points,
            final_points, scope, status, created_at, created_by
        ) VALUES (
            $1, $2, $3, $4, 'ACHIEVEMENT', $5,
            $6, $7, $8, 0, 0,
            $8, 'TEAM'::ledgerscopeenum, 'APPLIED'::ledgerstatusenum, $9, $10
        )
        RETURNING *
        "#,
    )
    .bind(&team_ledger_id)
    .bind(achievement_id)
    .bind(member_id)
    .bind(team_id)
    .bind(achievement_id)
    .bind(rule_id)
    .bind(rule_version)
    .bind(points)
    .bind(now)
    .bind(verifier_id)
    .fetch_one(&mut **tx)
    .await?;

    applied_entries.push(team_entry);

    // 2. Individual Ledger Entry (if scope is INDIVIDUAL_AND_TEAM)
    if scope == "INDIVIDUAL_AND_TEAM" && !member_id.is_empty() {
        let indiv_ledger_id = format!("LEDGER-INDIV-{}", Uuid::new_v4().simple());
        let indiv_entry = sqlx::query_as::<_, PointLedger>(
            r#"
            INSERT INTO point_ledger (
                id, achievement_id, member_id, team_id, source_type, source_id,
                rule_id, rule_version, base_points, bonus_points, penalty_points,
                final_points, scope, status, created_at, created_by
            ) VALUES (
                $1, $2, $3, $4, 'ACHIEVEMENT', $5,
                $6, $7, $8, 0, 0,
                $8, 'INDIVIDUAL'::ledgerscopeenum, 'APPLIED'::ledgerstatusenum, $9, $10
            )
            RETURNING *
            "#,
        )
        .bind(&indiv_ledger_id)
        .bind(achievement_id)
        .bind(member_id)
        .bind(team_id)
        .bind(achievement_id)
        .bind(rule_id)
        .bind(rule_version)
        .bind(points)
        .bind(now)
        .bind(verifier_id)
        .fetch_one(&mut **tx)
        .await?;

        applied_entries.push(indiv_entry);
    }

    Ok(applied_entries)
}

pub async fn apply_fraud_plagiarism_penalty(
    tx: &mut Transaction<'_, Postgres>,
    achievement_id: &str,
    team_id: &str,
    original_points: i32,
    reason: &str,
    verifier_id: &str,
) -> Result<PenaltyRecord, AppError> {
    // Section 4: ABSOLUTELY NO POINT DEDUCTIONS.
    // Invalid evidence results in 0 awarded points, existing points remain untouched.
    // If fraud/plagiarism is flagged, create an auditable disciplinary incident record
    // without automatically deducting existing points or creating negative ledger entries.
    let penalty_points = 0;
    let final_team_points = original_points;
    let now = Utc::now().naive_utc();

    let penalty_id = format!("INCIDENT-{}", Uuid::new_v4().simple());
    let penalty_rec = sqlx::query_as::<_, PenaltyRecord>(
        r#"
        INSERT INTO penalty_records (
            id, achievement_id, team_id, original_points, penalty_rate,
            penalty_points, final_team_points, reason, verified_by, applied_at
        ) VALUES (
            $1, $2, $3, $4, 0.00,
            $5, $6, $7, $8, $9
        )
        RETURNING *
        "#,
    )
    .bind(&penalty_id)
    .bind(achievement_id)
    .bind(team_id)
    .bind(original_points)
    .bind(penalty_points)
    .bind(final_team_points)
    .bind(reason)
    .bind(verifier_id)
    .bind(now)
    .fetch_one(&mut **tx)
    .await?;

    tracing::info!(
        "Recorded auditable disciplinary incident {} for achievement {}. Points deduction: 0 (existing points untouched).",
        penalty_id, achievement_id
    );

    Ok(penalty_rec)
}

pub async fn reverse_point_transaction(
    tx: &mut Transaction<'_, Postgres>,
    source_type: &str,
    source_id: &str,
    reason: &str,
    actor_id: &str,
) -> Result<Vec<PointLedger>, AppError> {
    // Section 22: Point Reversal / Correction.
    // Creates compensating reversal entries without mutating history.
    let original_entries = sqlx::query_as::<_, PointLedger>(
        r#"
        SELECT * FROM point_ledger 
        WHERE source_type = $1 AND source_id = $2 AND status = 'APPLIED'
        "#,
    )
    .bind(source_type)
    .bind(source_id)
    .fetch_all(&mut **tx)
    .await?;

    if original_entries.is_empty() {
        return Err(AppError::NotFound("No active ledger entries found to reverse.".to_string()));
    }

    let now = Utc::now().naive_utc();
    let mut reversals = Vec::new();

    for entry in original_entries {
        let rev_id = format!("REV-{}", Uuid::new_v4().simple());
        let reversal = sqlx::query_as::<_, PointLedger>(
            r#"
            INSERT INTO point_ledger (
                id, achievement_id, member_id, team_id, source_type, source_id,
                rule_id, rule_version, base_points, bonus_points, penalty_points,
                final_points, scope, status, created_at, created_by
            ) VALUES (
                $1, $2, $3, $4, 'REVERSAL', $5,
                $6, $7, $8, $9, $10,
                $11, $12, 'APPLIED'::ledgerstatusenum, $13, $14
            )
            RETURNING *
            "#,
        )
        .bind(&rev_id)
        .bind(&entry.achievement_id)
        .bind(&entry.member_id)
        .bind(&entry.team_id)
        .bind(format!("REV-{}", entry.id))
        .bind(&entry.rule_id)
        .bind(&entry.rule_version)
        .bind(-entry.base_points)
        .bind(-entry.bonus_points)
        .bind(-entry.penalty_points)
        .bind(-entry.final_points)
        .bind(entry.scope)
        .bind(now)
        .bind(actor_id)
        .fetch_one(&mut **tx)
        .await?;

        reversals.push(reversal);
    }

    tracing::info!("Reversed {} ledger entries for source {}/{} reason: {}", reversals.len(), source_type, source_id, reason);

    Ok(reversals)
}
