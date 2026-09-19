use reqwest::Client;
use sqlx::PgPool;
use std::time::Duration;

/// Background worker that syncs READY integration_events to Aarvak Central
/// every 30 seconds. Follows the exact protocol from ASCEND_INTEGRATION.md.
pub async fn start_central_sync_worker(pool: PgPool) {
    let central_url = std::env::var("CENTRAL_SUPABASE_URL")
        .map(|s| format!("{}/functions/v1/ingest", s))
        .unwrap_or_else(|_| "https://maekkuqaazfjujtokobl.supabase.co/functions/v1/ingest".to_string());
    
    let central_key = std::env::var("CENTRAL_ANON_KEY")
        .unwrap_or_else(|_| "sb_publishable_2pCYB_tSDWn8FXG94OHjg_1zYWSaQx".to_string());

    let central_team_id = std::env::var("CENTRAL_TEAM_ID")
        .unwrap_or_else(|_| "8f7af888-7dca-467c-86a0-f4500bc1c0ed".to_string());

    let http = Client::builder()
        .timeout(Duration::from_secs(15))
        .build()
        .expect("Failed to build reqwest client for central sync");

    tracing::info!("🔄 Central sync worker started — polling every 30s → {}", central_url);

    loop {
        tokio::time::sleep(Duration::from_secs(30)).await;

        if let Err(e) = sync_tick(&pool, &http, &central_url, &central_key, &central_team_id).await {
            tracing::error!("Central sync tick error: {}", e);
        }
    }
}

async fn sync_tick(
    pool: &PgPool,
    http: &Client,
    url: &str,
    key: &str,
    team_id: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    // Pick up to 25 READY/FAILED rows that have a resolved central code
    let rows = sqlx::query_as::<_, SyncRow>(
        r#"
        SELECT ie.id, ie.achievement_id, co.payload::text as payload_text
        FROM integration_events ie
        JOIN central_outbound co ON co.achievement_id = ie.achievement_id
        WHERE ie.sync_status IN ('READY','FAILED')
          AND ie.attempt_count < 12
          AND co.resolved_code IS NOT NULL
        ORDER BY ie.created_at
        LIMIT 25
        "#,
    )
    .fetch_all(pool)
    .await?;

    if rows.is_empty() {
        return Ok(());
    }

    tracing::info!("Central sync: processing {} row(s)", rows.len());

    for row in &rows {
        // Mark SYNCING
        sqlx::query(
            "UPDATE integration_events SET sync_status = 'SYNCING', attempt_count = attempt_count + 1, last_attempt_at = NOW() WHERE id = $1"
        )
        .bind(&row.id)
        .execute(pool)
        .await?;

        // Build the envelope central expects
        let payload: serde_json::Value = serde_json::from_str(&row.payload_text)?;
        let envelope = serde_json::json!({
            "event_id": row.id,
            "event_type": "submission.upserted",
            "occurred_at": chrono::Utc::now().to_rfc3339(),
            "team_id": team_id,
            "payload": payload
        });

        let resp = http
            .post(url)
            .header("Authorization", format!("Bearer {}", key))
            .header("Content-Type", "application/json")
            .json(&envelope)
            .send()
            .await;

        match resp {
            Ok(r) => {
                let status = r.status().as_u16();
                let body = r.text().await.unwrap_or_default();

                match status {
                    200 => {
                        // Parse resolved_activity_code from response
                        let ext_ref = serde_json::from_str::<serde_json::Value>(&body)
                            .ok()
                            .and_then(|v| v.get("resolved_activity_code").and_then(|c| c.as_str().map(String::from)))
                            // Also check inside would_store for dryrun compat
                            .or_else(|| {
                                serde_json::from_str::<serde_json::Value>(&body).ok()
                                    .and_then(|v| v.get("would_store")
                                        .and_then(|ws| ws.get("resolved_activity_code"))
                                        .and_then(|c| c.as_str().map(String::from)))
                            });

                        sqlx::query(
                            "UPDATE integration_events SET sync_status = 'SYNCED', external_reference_id = $1, error_message = NULL WHERE id = $2"
                        )
                        .bind(ext_ref)
                        .bind(&row.id)
                        .execute(pool)
                        .await?;

                        tracing::info!("✅ Synced achievement {} to central", row.achievement_id);
                    }
                    401 => {
                        // Key is wrong or revoked — stop the whole batch
                        sqlx::query(
                            "UPDATE integration_events SET sync_status = 'FAILED', error_message = $1 WHERE id = $2"
                        )
                        .bind(&body)
                        .bind(&row.id)
                        .execute(pool)
                        .await?;

                        tracing::error!("🚨 Central returned 401 — API key invalid. Stopping batch.");
                        break;
                    }
                    422 => {
                        // Data is wrong, retrying won't fix it
                        sqlx::query(
                            "UPDATE integration_events SET sync_status = 'FAILED', attempt_count = 12, error_message = $1 WHERE id = $2"
                        )
                        .bind(&body)
                        .bind(&row.id)
                        .execute(pool)
                        .await?;

                        tracing::warn!("⚠️ Central rejected achievement {} (422): {}", row.achievement_id, body);
                    }
                    429 => {
                        // Rate limited — leave as READY and back off
                        sqlx::query(
                            "UPDATE integration_events SET sync_status = 'READY', error_message = 'Rate limited by central' WHERE id = $1"
                        )
                        .bind(&row.id)
                        .execute(pool)
                        .await?;

                        tracing::warn!("⏳ Rate limited by central. Backing off.");
                        break;
                    }
                    _ => {
                        // 5xx or other — leave as READY, try again next tick
                        sqlx::query(
                            "UPDATE integration_events SET sync_status = 'READY', error_message = $1 WHERE id = $2"
                        )
                        .bind(format!("HTTP {}: {}", status, body))
                        .bind(&row.id)
                        .execute(pool)
                        .await?;

                        tracing::warn!("Central returned {} for {}. Will retry.", status, row.achievement_id);
                    }
                }
            }
            Err(e) => {
                // Network error — leave as READY
                sqlx::query(
                    "UPDATE integration_events SET sync_status = 'READY', error_message = $1 WHERE id = $2"
                )
                .bind(format!("Network error: {}", e))
                .bind(&row.id)
                .execute(pool)
                .await?;

                tracing::warn!("Network error syncing {}: {}", row.achievement_id, e);
            }
        }
    }

    Ok(())
}

#[derive(sqlx::FromRow)]
struct SyncRow {
    id: String,
    achievement_id: String,
    payload_text: String,
}
