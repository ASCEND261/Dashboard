use ascend_backend::config::Config;
use ascend_backend::models::{LedgerScopeEnum, User};
use ascend_backend::services::auth_service::generate_jwt;
use ascend_backend::services::ledger_service::{
    apply_fraud_plagiarism_penalty, apply_verified_points_to_ledger, reverse_point_transaction,
};
use ascend_backend::services::point_engine::OFFICIAL_VERSION;
use sqlx::PgPool;
use uuid::Uuid;

#[tokio::test]
async fn test_dual_entry_ledger_and_scoring() {
    let config = Config::from_env();
    let pool = PgPool::connect(&config.database_url)
        .await
        .expect("Failed to connect to Postgres");

    let mut tx = pool.begin().await.expect("Begin tx");

    let test_team = "ASCEND";
    let test_member = "usr-member-1";
    let test_verifier = "usr-core-1";
    let test_ach_id = format!("ACH-TEST-{}", Uuid::new_v4().simple());

    // Insert isolated test achievement
    sqlx::query(
        r#"
        INSERT INTO achievements (
            id, user_id, team_id, category_id, title, description,
            achievement_date, metadata_json, status, created_at, updated_at
        ) VALUES (
            $1, $2, $3, 'cat-hackathon', 'Test Hackathon Achievement',
            'Test description for scoring engine verification', '2026-09-04',
            '{}', 'VERIFIED', NOW(), NOW()
        )
        "#,
    )
    .bind(&test_ach_id)
    .bind(test_member)
    .bind(test_team)
    .execute(&mut *tx)
    .await
    .expect("Insert test achievement");

    // 1. Test dual-entry ledger for INDIVIDUAL_AND_TEAM scope (+20 points)
    // Section 1 rule: Points are counted BOTH on individual scoreboard (+20) and team scoreboard (+20), NEVER averaged!
    let entries = apply_verified_points_to_ledger(
        &mut tx,
        &test_ach_id,
        test_member,
        test_team,
        "RULE-DSA-7-DAY",
        OFFICIAL_VERSION,
        20,
        "INDIVIDUAL_AND_TEAM",
        test_verifier,
    )
    .await
    .expect("Failed to apply verified points");

    assert_eq!(entries.len(), 2, "Must create exactly 2 entries (TEAM and INDIVIDUAL)");

    let team_entry = entries.iter().find(|e| e.scope == LedgerScopeEnum::Team).expect("Team entry");
    assert_eq!(team_entry.final_points, 20);
    assert_eq!(team_entry.scope, LedgerScopeEnum::Team);

    let indiv_entry = entries.iter().find(|e| e.scope == LedgerScopeEnum::Individual).expect("Individual entry");
    assert_eq!(indiv_entry.final_points, 20);
    assert_eq!(indiv_entry.scope, LedgerScopeEnum::Individual);

    // 2. Test Idempotency: Applying again for the same achievement must not duplicate entries
    let duplicate_entries = apply_verified_points_to_ledger(
        &mut tx,
        &test_ach_id,
        test_member,
        test_team,
        "RULE-DSA-7-DAY",
        OFFICIAL_VERSION,
        20,
        "INDIVIDUAL_AND_TEAM",
        test_verifier,
    )
    .await
    .expect("Idempotent apply");

    assert_eq!(duplicate_entries.len(), 2, "Must return existing entries without duplicating");

    // 3. Test Section 4 Rule: ABSOLUTELY NO POINT DEDUCTIONS
    // If fraud/plagiarism is flagged, create an auditable incident record without deducting points.
    let incident = apply_fraud_plagiarism_penalty(
        &mut tx,
        &test_ach_id,
        test_team,
        100,
        "Confirmed code duplication and fabricated certificate",
        test_verifier,
    )
    .await
    .expect("Record disciplinary incident");

    assert_eq!(incident.original_points, 100);
    assert_eq!(incident.penalty_points, 0, "Points deduction must be strictly 0 (no punitive deductions)");
    assert_eq!(incident.final_team_points, 100, "Existing team points must remain untouched (100 pts)");

    // 4. Test Compensating Point Reversal (Section 22)
    let reversals = reverse_point_transaction(
        &mut tx,
        "ACHIEVEMENT",
        &test_ach_id,
        "Verification mistake correction",
        test_verifier,
    )
    .await
    .expect("Reverse points");

    assert_eq!(reversals.len(), 2, "Must reverse both TEAM and INDIVIDUAL entries");
    for rev in reversals {
        assert_eq!(rev.final_points, -20, "Reversal must have negative points equal to original");
    }

    // Rollback test transaction so database remains pristine
    tx.rollback().await.expect("Rollback test tx");
}

#[tokio::test]
async fn test_auth_and_rbac_tokens() {
    let config = Config::from_env();
    let pool = PgPool::connect(&config.database_url)
        .await
        .expect("Failed to connect to Postgres");

    // Test member login user query
    let maya = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = 'maya@ascend.team'")
        .fetch_one(&pool)
        .await
        .expect("Maya exists");

    assert_eq!(maya.role.as_str(), "MEMBER");

    let alex = sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = 'alex@ascend.team'")
        .fetch_one(&pool)
        .await
        .expect("Alex exists");

    assert_eq!(alex.role.as_str(), "CORE_MEMBER");
    assert!(alex.role.is_core_or_admin());
    assert!(!maya.role.is_core_or_admin());

    let token = generate_jwt(&maya, &config.jwt_secret, 24).expect("Generate JWT");
    assert!(!token.is_empty());
}
