use ascend_backend::config::Config;
use ascend_backend::models::{AchievementCategory, User};
use ascend_backend::services::point_engine::calculate_points;
use ascend_backend::services::verification_service::{
    evaluate_submission_for_auto_verify, verify_submission, AutoVerifyOutcome, VerifyRequest,
};
use chrono::Utc;
use sqlx::PgPool;
use uuid::Uuid;

async fn get_test_context() -> (PgPool, Config, User, AchievementCategory) {
    let config = Config::from_env();
    let pool = PgPool::connect(&config.database_url)
        .await
        .expect("Failed to connect to Postgres");

    let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = 'usr-member-1'")
        .fetch_one(&pool)
        .await
        .expect("Fetch member user");

    let cat = sqlx::query_as::<_, AchievementCategory>("SELECT * FROM achievement_categories WHERE slug = 'hackathon'")
        .fetch_one(&pool)
        .await
        .expect("Fetch hackathon category");

    (pool, config, user, cat)
}

async fn create_test_submission(
    pool: &PgPool,
    user: &User,
    category_slug: &str,
    title: &str,
    metadata: serde_json::Value,
    file_name: &str,
    file_hash: &str,
) -> (String, String) {
    let cat = sqlx::query_as::<_, AchievementCategory>(
        "SELECT * FROM achievement_categories WHERE slug = $1",
    )
    .bind(category_slug)
    .fetch_one(pool)
    .await
    .expect("Fetch category by slug");

    let ach_id = format!("ACH-AUDIT-{}", Uuid::new_v4().simple());
    let proof_id = format!("PRF-AUDIT-{}", Uuid::new_v4().simple());
    let now = Utc::now().naive_utc();

    // 1. Insert Achievement
    sqlx::query(
        r#"
        INSERT INTO achievements (
            id, user_id, team_id, category_id, title, description,
            achievement_date, metadata_json, status, created_at, updated_at
        ) VALUES (
            $1, $2, 'ASCEND', $3, $4, 'Automated Audit Test Achievement',
            '2026-09-04', $5, 'SUBMITTED', $6, $6
        )
        "#,
    )
    .bind(&ach_id)
    .bind(&user.id)
    .bind(&cat.id)
    .bind(title)
    .bind(&metadata)
    .bind(now)
    .execute(pool)
    .await
    .expect("Insert test achievement");

    // 2. Insert Proof linked to achievement
    sqlx::query(
        r#"
        INSERT INTO achievement_proofs (
            id, achievement_id, file_name, file_path, mime_type, file_size_bytes, file_hash_sha256, uploaded_at
        ) VALUES (
            $1, $2, $3, '/storage/proofs/test.pdf', 'application/pdf', 10240, $4, $5
        )
        "#,
    )
    .bind(&proof_id)
    .bind(&ach_id)
    .bind(file_name)
    .bind(file_hash)
    .bind(now)
    .execute(pool)
    .await
    .expect("Insert test proof");

    (ach_id, proof_id)
}

// -----------------------------------------------------------------------------
// CHECKPOINT 1: Random image upload -> actually rejected? (0 points, 0 penalty)
// -----------------------------------------------------------------------------
#[tokio::test]
async fn test_checkpoint_1_random_image_upload_rejected() {
    let (pool, config, user, _) = get_test_context().await;
    let hash = format!("hash-random-img-{}", Uuid::new_v4().simple());

    let (ach_id, _) = create_test_submission(
        &pool,
        &user,
        "hackathon",
        "Random Meme Post",
        serde_json::json!({ "event_name": "Internet Meme", "result": "1st Place" }),
        "random_cat_meme.png",
        &hash,
    )
    .await;

    let eval = evaluate_submission_for_auto_verify(&pool, &ach_id, &user, &config)
        .await
        .expect("Evaluate auto verify");

    assert_eq!(eval.status, "REJECTED", "Random image must be marked REJECTED");
    match eval.outcome {
        AutoVerifyOutcome::InvalidEvidence { ref reason } => {
            assert!(reason.contains("does not support"), "Reason must mention unsupported evidence");
        }
        _ => panic!("Expected InvalidEvidence outcome for random image"),
    }

    // Verify 0 points in ledger and zero deductions
    let ledger_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM point_ledger WHERE achievement_id = $1")
        .bind(&ach_id)
        .fetch_one(&pool)
        .await
        .expect("Count ledger entries");
    assert_eq!(ledger_count, 0, "Zero points must be entered into the ledger for invalid claims");
}

// -----------------------------------------------------------------------------
// CHECKPOINT 2: Wrong certificate -> actually detected as mismatch?
// -----------------------------------------------------------------------------
#[tokio::test]
async fn test_checkpoint_2_wrong_certificate_mismatch() {
    let (pool, config, user, _) = get_test_context().await;
    let hash = format!("hash-mismatch-cert-{}", Uuid::new_v4().simple());

    let (ach_id, _) = create_test_submission(
        &pool,
        &user,
        "hackathon",
        "National Hackathon Grand Prize",
        serde_json::json!({ "event_name": "National Hackathon", "result": "1st Place Winner" }),
        "hackathon_participation_certificate.pdf",
        &hash,
    )
    .await;

    let eval = evaluate_submission_for_auto_verify(&pool, &ach_id, &user, &config)
        .await
        .expect("Evaluate auto verify");

    assert_eq!(eval.status, "UNDER_REVIEW", "Result mismatch must route to UNDER_REVIEW");
    match eval.outcome {
        AutoVerifyOutcome::NeedsCoreReview { ref flags, .. } => {
            let found_mismatch = flags.iter().any(|f| f.contains("mismatch") || f.contains("different standing"));
            assert!(found_mismatch, "Flags must detect Claim-Evidence mismatch");
        }
        _ => panic!("Expected NeedsCoreReview for claim-evidence mismatch"),
    }
}

// -----------------------------------------------------------------------------
// CHECKPOINT 3: Correct certificate -> actually eligible for AutoVerify?
// -----------------------------------------------------------------------------
#[tokio::test]
async fn test_checkpoint_3_correct_certificate_eligible() {
    let (pool, config, user, _) = get_test_context().await;
    let hash = format!("hash-correct-cert-{}", Uuid::new_v4().simple());

    let (ach_id, _) = create_test_submission(
        &pool,
        &user,
        "hackathon",
        "Global AI Hackathon 2026",
        serde_json::json!({ "event_name": "Global AI Hackathon", "result": "1st Place Winner", "organization": "AI Org" }),
        "global_ai_hackathon_winner_certificate.pdf",
        &hash,
    )
    .await;

    let eval = evaluate_submission_for_auto_verify(&pool, &ach_id, &user, &config)
        .await
        .expect("Evaluate auto verify");

    assert_eq!(eval.status, "VERIFIED", "Legitimate certificate must be VERIFIED");
    match eval.outcome {
        AutoVerifyOutcome::AutoVerified { points, ref rule_code } => {
            assert_eq!(points, 50, "1st place hackathon must award 50 points");
            assert_eq!(rule_code, "EXTERNAL_HACKATHON_1ST");
        }
        _ => panic!("Expected AutoVerified outcome for valid certificate"),
    }

    // Verify ledger is populated immediately for TEAM scope
    let ledger_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM point_ledger WHERE achievement_id = $1")
        .bind(&ach_id)
        .fetch_one(&pool)
        .await
        .expect("Count ledger entries");
    assert_eq!(ledger_count, 1, "Hackathon AutoVerify must atomically write TEAM ledger record");

    let entry_points: i32 = sqlx::query_scalar("SELECT final_points FROM point_ledger WHERE achievement_id = $1")
        .bind(&ach_id)
        .fetch_one(&pool)
        .await
        .expect("Fetch ledger entry points");
    assert_eq!(entry_points, 50, "Awarded points must be exactly 50");
}

// -----------------------------------------------------------------------------
// CHECKPOINT 4: DSA profile -> streak claim NOT incorrectly verified from total count
// -----------------------------------------------------------------------------
#[tokio::test]
async fn test_checkpoint_4_dsa_profile_streak_claim_blocked() {
    let (pool, config, user, _) = get_test_context().await;
    let hash = format!("hash-dsa-profile-{}", Uuid::new_v4().simple());

    let (ach_id, _) = create_test_submission(
        &pool,
        &user,
        "dsa",
        "7-Day Consecutive Problem Solving Streak",
        serde_json::json!({ "streak_days": "7", "platform": "LeetCode", "total_problems_solved": "500" }),
        "leetcode_profile_summary_500_solved.png",
        &hash,
    )
    .await;

    let eval = evaluate_submission_for_auto_verify(&pool, &ach_id, &user, &config)
        .await
        .expect("Evaluate auto verify");

    assert_eq!(eval.status, "UNDER_REVIEW", "Profile summary without streak calendar must route to UNDER_REVIEW");
    match eval.outcome {
        AutoVerifyOutcome::NeedsCoreReview { ref flags, .. } => {
            let found = flags.iter().any(|f| f.contains("consecutive") || f.contains("streak") || f.contains("problem count"));
            assert!(found, "Must flag insufficient evidence for streak calendar");
        }
        _ => panic!("Expected NeedsCoreReview for DSA profile screenshot"),
    }
}

// -----------------------------------------------------------------------------
// CHECKPOINT 5: Open-source PR -> actual PR evidence/API check?
// -----------------------------------------------------------------------------
#[tokio::test]
async fn test_checkpoint_5_open_source_unmerged_pr_blocked() {
    let (pool, config, user, _) = get_test_context().await;
    let hash = format!("hash-os-unmerged-{}", Uuid::new_v4().simple());

    let (ach_id, _) = create_test_submission(
        &pool,
        &user,
        "open_source",
        "Contributed to Rust Compiler",
        serde_json::json!({ "repo": "rust-lang/rust", "pr_title": "Fix typo", "status": "draft" }),
        "local_terminal_diff.png",
        &hash,
    )
    .await;

    let eval = evaluate_submission_for_auto_verify(&pool, &ach_id, &user, &config)
        .await
        .expect("Evaluate auto verify");

    assert_eq!(eval.status, "UNDER_REVIEW", "Unverified open source PR must route to UNDER_REVIEW");
    match eval.outcome {
        AutoVerifyOutcome::NeedsCoreReview { ref flags, .. } => {
            let found = flags.iter().any(|f| f.contains("merged state") || f.contains("public repository") || f.contains("Open source PR") || f.contains("author confirmation"));
            assert!(found, "Must flag missing verified merged state link");
        }
        _ => panic!("Expected NeedsCoreReview for unmerged open source PR"),
    }
}

// -----------------------------------------------------------------------------
// CHECKPOINT 6: Duplicate proof -> blocked across cohort?
// -----------------------------------------------------------------------------
#[tokio::test]
async fn test_checkpoint_6_duplicate_proof_blocked() {
    let (pool, config, user, _) = get_test_context().await;
    let duplicate_hash = format!("shared-identical-hash-{}", Uuid::new_v4().simple());

    // First submission with hash
    let (_ach_1, _) = create_test_submission(
        &pool,
        &user,
        "hackathon",
        "Team A Hackathon",
        serde_json::json!({ "event_name": "Hackathon 2026", "result": "1st Place" }),
        "hackathon_cert_original.pdf",
        &duplicate_hash,
    )
    .await;

    // Second submission attempting to reuse the same file hash
    let (ach_2, _) = create_test_submission(
        &pool,
        &user,
        "hackathon",
        "Team B Hackathon Duplication Claim",
        serde_json::json!({ "event_name": "Hackathon 2026", "result": "1st Place" }),
        "hackathon_cert_copy.pdf",
        &duplicate_hash,
    )
    .await;

    let eval = evaluate_submission_for_auto_verify(&pool, &ach_2, &user, &config)
        .await
        .expect("Evaluate auto verify");

    assert_eq!(eval.status, "UNDER_REVIEW", "Duplicate proof hash must be routed to UNDER_REVIEW");
    match eval.outcome {
        AutoVerifyOutcome::NeedsCoreReview { ref reason, .. } => {
            assert!(reason.contains("duplicate proof document SHA-256 hash"), "Must flag duplicate proof hash collision");
        }
        _ => panic!("Expected duplicate proof to trigger NeedsCoreReview"),
    }
}

// -----------------------------------------------------------------------------
// CHECKPOINT 7: Identity mismatch -> blocked?
// -----------------------------------------------------------------------------
#[tokio::test]
async fn test_checkpoint_7_identity_mismatch_blocked() {
    let (pool, config, user, _) = get_test_context().await;
    let hash = format!("hash-identity-mismatch-{}", Uuid::new_v4().simple());

    let (ach_id, _) = create_test_submission(
        &pool,
        &user,
        "hackathon",
        "Award Certificate",
        serde_json::json!({ "event_name": "Hackathon 2026", "result": "1st Place", "extracted_name": "Other Person" }),
        "certificate_john_doe.pdf",
        &hash,
    )
    .await;

    let eval = evaluate_submission_for_auto_verify(&pool, &ach_id, &user, &config)
        .await
        .expect("Evaluate auto verify");

    assert_eq!(eval.status, "UNDER_REVIEW", "Identity mismatch must route to UNDER_REVIEW");
    match eval.outcome {
        AutoVerifyOutcome::NeedsCoreReview { ref flags, .. } => {
            let found = flags.iter().any(|f| f.contains("Identity mismatch"));
            assert!(found, "Must flag identity mismatch between proof and account name");
        }
        _ => panic!("Expected identity mismatch to require Core Review"),
    }
}

// -----------------------------------------------------------------------------
// CHECKPOINT 8: AI unavailable -> Core Review fallback without crashing?
// -----------------------------------------------------------------------------
#[tokio::test]
async fn test_checkpoint_8_ai_unavailable_fallback_core_review() {
    let (pool, mut config, user, _) = get_test_context().await;
    // Set AI service URL to an unreachable port
    config.ai_service_url = "http://127.0.0.1:59999".to_string();
    let hash = format!("hash-offline-ai-{}", Uuid::new_v4().simple());

    let (ach_id, _) = create_test_submission(
        &pool,
        &user,
        "hackathon",
        "Offline Test Submission",
        serde_json::json!({ "event_name": "Hackathon 2026", "result": "1st Place" }),
        "genuine_winner_cert.pdf",
        &hash,
    )
    .await;

    // Must NOT panic or fail with 500
    let eval = evaluate_submission_for_auto_verify(&pool, &ach_id, &user, &config)
        .await
        .expect("Must gracefully handle unreachable AI service");

    assert_eq!(eval.status, "UNDER_REVIEW", "Unreachable AI must fall back to UNDER_REVIEW");
    match eval.outcome {
        AutoVerifyOutcome::NeedsCoreReview { ref reason, .. } => {
            assert!(reason.contains("AI service unavailable"), "Reason must note resilient AI fallback to Core Review");
        }
        _ => panic!("Expected AI unavailable to fall back to Core Review"),
    }
}

// -----------------------------------------------------------------------------
// CHECKPOINT 9: AI high confidence vs Deterministic Rule -> Rust enforces authority
// -----------------------------------------------------------------------------
#[tokio::test]
async fn test_checkpoint_9_deterministic_rule_blocks_ai_overreach() {
    let (pool, config, user, _) = get_test_context().await;
    let hash = format!("hash-rule-failure-{}", Uuid::new_v4().simple());

    // Submit with invalid result condition yielding 0 points / disqualified
    let (ach_id, _) = create_test_submission(
        &pool,
        &user,
        "hackathon",
        "Disqualified Hackathon Entry",
        serde_json::json!({ "event_name": "Hackathon 2026", "result": "disqualified", "disqualified": "true" }),
        "genuine_hackathon_winner_cert.pdf",
        &hash,
    )
    .await;

    // Verify point engine returns 0 points and eligible: false
    let calc = calculate_points("hackathon", &serde_json::json!({ "disqualified": "true" }), None);
    assert_eq!(calc.points, 0, "Deterministic rules must yield 0 points for disqualified entries");
    assert!(!calc.eligible, "Disqualified entry must not be eligible");

    let eval = evaluate_submission_for_auto_verify(&pool, &ach_id, &user, &config)
        .await
        .expect("Evaluate auto verify");

    assert_eq!(eval.status, "UNDER_REVIEW", "Rust must block AutoVerify when deterministic rule criteria fail");
    match eval.outcome {
        AutoVerifyOutcome::NeedsCoreReview { ref reason, .. } => {
            assert!(reason.contains("Deterministic scoring rule"), "Must route to Core Review on deterministic rule failure");
        }
        _ => panic!("Expected NeedsCoreReview when deterministic rule requirements are not satisfied"),
    }
}

// -----------------------------------------------------------------------------
// CHECKPOINT 10: Points verification sequence -> ledger written strictly on verification
// -----------------------------------------------------------------------------
#[tokio::test]
async fn test_checkpoint_10_points_enter_ledger_strictly_after_verification() {
    let (pool, _config, user, _) = get_test_context().await;
    let hash = format!("hash-ledger-seq-{}", Uuid::new_v4().simple());

    // 1. Create DSA streak submission (scope: INDIVIDUAL_AND_TEAM, 20 points) initially placed in UNDER_REVIEW
    let (ach_id, _) = create_test_submission(
        &pool,
        &user,
        "dsa",
        "7-Day Consecutive Problem Solving Streak",
        serde_json::json!({ "streak_days": "7", "platform": "LeetCode" }),
        "dsa_calendar_proof.pdf",
        &hash,
    )
    .await;

    sqlx::query("UPDATE achievements SET status = 'UNDER_REVIEW' WHERE id = $1")
        .bind(&ach_id)
        .execute(&pool)
        .await
        .expect("Set UNDER_REVIEW");

    // 2. Prior to verification: Verify EXACTLY 0 entries in point_ledger
    let pre_ledger_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM point_ledger WHERE achievement_id = $1")
        .bind(&ach_id)
        .fetch_one(&pool)
        .await
        .expect("Count pre ledger");
    assert_eq!(pre_ledger_count, 0, "No points may enter the ledger while submission is unverified / UNDER_REVIEW");

    // 3. Core Member verifies the submission
    let core_verifier = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = 'usr-core-1'")
        .fetch_one(&pool)
        .await
        .expect("Fetch core member");

    let verify_res = verify_submission(
        &pool,
        &ach_id,
        &core_verifier,
        VerifyRequest {
            rule_version: Some("TSJ-2026-v1".to_string()),
            override_reason: Some("Verified by Core Member after manual document inspection".to_string()),
        },
    )
    .await
    .expect("Core verification succeeds");

    assert_eq!(verify_res.status, "VERIFIED");
    assert_eq!(verify_res.calculated_points, 20);

    // 4. After verification: Verify EXACTLY 2 entries (TEAM and INDIVIDUAL) in point_ledger for INDIVIDUAL_AND_TEAM scope
    let post_ledger_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM point_ledger WHERE achievement_id = $1")
        .bind(&ach_id)
        .fetch_one(&pool)
        .await
        .expect("Count post ledger");
    assert_eq!(post_ledger_count, 2, "Points must enter the ledger strictly upon authoritative verification");
}

// -----------------------------------------------------------------------------
// CHECKPOINT 11: Fake / Gibberish submission -> blocked & rejected (0 points, 0 ledger entries)
// -----------------------------------------------------------------------------
#[tokio::test]
async fn test_checkpoint_11_fake_gibberish_submission_rejected_zero_points() {
    let (pool, config, user, _) = get_test_context().await;
    let hash = format!("hash-fake-gibberish-{}", Uuid::new_v4().simple());

    let (ach_id, _) = create_test_submission(
        &pool,
        &user,
        "dsa",
        "gjhy",
        serde_json::json!({ "streak_days": "7", "platform": "LeetCode" }),
        "10.1177_14713012231186837.pdf",
        &hash,
    )
    .await;

    let eval = evaluate_submission_for_auto_verify(&pool, &ach_id, &user, &config)
        .await
        .expect("Evaluate auto verify");

    assert_eq!(eval.status, "REJECTED", "Fake / gibberish submission must be immediately REJECTED");
    match eval.outcome {
        AutoVerifyOutcome::InvalidEvidence { ref reason } => {
            assert!(reason.contains("does not support") || reason.contains("unrelated"), "Reason must clearly state unsupported evidence");
        }
        _ => panic!("Expected InvalidEvidence outcome for fake / gibberish submission"),
    }

    // Verify exactly 0 points in ledger
    let ledger_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM point_ledger WHERE achievement_id = $1")
        .bind(&ach_id)
        .fetch_one(&pool)
        .await
        .expect("Count ledger entries");
    assert_eq!(ledger_count, 0, "Zero points must be entered into the ledger for fake submissions");
}

