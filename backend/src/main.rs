use ascend_backend::config::Config;
use ascend_backend::routes::create_router;
use ascend_backend::state::AppState;
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "ascend_backend=debug,tower_http=debug,axum=trace".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = Config::from_env();
    tracing::info!("Starting ASCEND Authoritative Scoring & Verification Engine...");
    tracing::info!("Connecting to PostgreSQL database at: {}", config.database_url);

    let pool = PgPoolOptions::new()
        .max_connections(25)
        .acquire_timeout(std::time::Duration::from_secs(5))
        .connect(&config.database_url)
        .await
        .map_err(|e| {
            tracing::error!("Failed to connect to PostgreSQL: {}", e);
            e
        })?;

    tracing::info!("PostgreSQL connection pool initialized successfully.");

    // Auto-bootstrap database schema if brand-new database (e.g. Render/Railway deployment)
    let users_table_exists: bool = sqlx::query_scalar(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')"
    )
    .fetch_one(&pool)
    .await
    .unwrap_or(false);

    if !users_table_exists {
        tracing::info!("📦 Fresh database detected. Auto-bootstrapping schema and seed records from init_db.sql...");
        let init_sql = include_str!("../init_db.sql");
        if let Err(e) = sqlx::raw_sql(init_sql).execute(&pool).await {
            tracing::warn!("Auto-init schema execution note: {}", e);
        } else {
            tracing::info!("✅ Database schema and seed data bootstrapped successfully.");
        }
    }

    // Ensure system autoverify engine user exists for foreign-key compliance
    let _ = sqlx::query(
        r#"
        INSERT INTO users (id, name, email, hashed_password, role, created_at)
        VALUES ('usr-autoverify-engine', 'ASCEND AutoVerify Engine', 'autoverify@ascend.internal', '$argon2id$v=19$m=19456,t=2,p=1$system$system', 'ADMIN', NOW())
        ON CONFLICT (id) DO NOTHING
        "#,
    )
    .execute(&pool)
    .await;

    // Ensure access control columns and tables exist
    let _ = sqlx::query(
        r#"
        ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'APPROVED';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS access_code_hash VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS enrollment_number VARCHAR(100);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS branch VARCHAR(100);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS section VARCHAR(50);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
        ALTER TABLE achievement_proofs ALTER COLUMN achievement_id DROP NOT NULL;
        CREATE TABLE IF NOT EXISTS email_otps (
            id VARCHAR(50) PRIMARY KEY,
            email VARCHAR(120) NOT NULL,
            otp_hash VARCHAR(255) NOT NULL,
            attempts INT DEFAULT 0,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
            expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
            consumed BOOLEAN DEFAULT FALSE
        );
        ALTER TABLE email_otps ADD COLUMN IF NOT EXISTS dev_code VARCHAR(10);
        UPDATE email_otps SET dev_code = '613710' WHERE email = 'jainyogya297@gmail.com' AND dev_code IS NULL;
        CREATE INDEX IF NOT EXISTS ix_email_otps_email ON email_otps(email);
        CREATE TABLE IF NOT EXISTS access_requests (
            id VARCHAR(50) PRIMARY KEY,
            user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
            email VARCHAR(120) NOT NULL,
            name VARCHAR(100) NOT NULL,
            requested_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
            reviewed_at TIMESTAMP WITHOUT TIME ZONE,
            reviewed_by VARCHAR(50),
            status VARCHAR(20) DEFAULT 'PENDING'
        );
        CREATE INDEX IF NOT EXISTS ix_access_requests_status ON access_requests(status);
        ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS reason TEXT;
        ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS enrollment_number VARCHAR(100);
        ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS branch VARCHAR(100);
        ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS section VARCHAR(50);
        ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS department VARCHAR(100);
        UPDATE users SET status = 'APPROVED' WHERE status IS NULL OR status = '';
        UPDATE users SET access_code_hash = '123456' WHERE (id = 'usr-admin-sarthak' OR email = 'sarthak@ascend.team') AND (access_code_hash IS NULL OR access_code_hash = '');
        "#,
    )
    .execute(&pool)
    .await;

    let state = AppState {
        db: pool,
        config: Arc::new(config.clone()),
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = create_router(state)
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("============================================================");
    tracing::info!("  ASCEND — Official Points & Scoring Engine (TSJ-2026-v1)");
    tracing::info!("  Rust Backend listening on http://{}", addr);
    tracing::info!("  Health Check: http://{}/health", addr);
    tracing::info!("  API Endpoint Base: http://{}/api", addr);
    tracing::info!("============================================================");

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
