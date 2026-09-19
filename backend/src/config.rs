use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub port: u16,
    pub jwt_secret: String,
    pub jwt_expiration_hours: i64,
    pub storage_dir: String,
    pub max_file_size_bytes: usize,
    pub cors_origins: Vec<String>,
    pub ai_service_url: String,
    pub supabase_url: String,
    pub supabase_key: String,
}

impl Config {
    pub fn from_env() -> Self {
        let _ = dotenvy::dotenv();

        let database_url = env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgres://yogayjain@localhost:5432/ascend".to_string());
        
        let port = env::var("PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(8000);

        let ai_service_url = env::var("AI_SERVICE_URL")
            .unwrap_or_else(|_| "http://127.0.0.1:8001".to_string());

        let jwt_secret = env::var("JWT_SECRET")
            .unwrap_or_else(|_| "ascend-secret-jwt-key-production-strength-2026-v1".to_string());

        let jwt_expiration_hours = env::var("JWT_EXPIRATION_HOURS")
            .ok()
            .and_then(|h| h.parse().ok())
            .unwrap_or(24);

        let storage_dir = env::var("STORAGE_DIR")
            .unwrap_or_else(|_| "./storage/proofs".to_string());

        let max_file_size_bytes = env::var("MAX_FILE_SIZE_BYTES")
            .ok()
            .and_then(|m| m.parse().ok())
            .unwrap_or(10 * 1024 * 1024); // 10MB

        let cors_origins = vec![
            "http://localhost:3000".to_string(),
            "http://127.0.0.1:3000".to_string(),
            "http://localhost:3001".to_string(),
            "http://127.0.0.1:3001".to_string(),
        ];

        let supabase_url = env::var("SUPABASE_URL")
            .unwrap_or_else(|_| "https://rgcxulamrmfypswxibdp.supabase.co".to_string());

        let supabase_key = env::var("SUPABASE_KEY")
            .unwrap_or_else(|_| "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnY3h1bGFtcm1meXBzd3hpYmRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTc5ODEzMSwiZXhwIjoyMTA1Mzc0MTMxfQ.mJP_yssY40n2XOZZ6qLjKbdVStsZGmya8lTo9jAZfj8".to_string());

        Self {
            database_url,
            port,
            jwt_secret,
            jwt_expiration_hours,
            storage_dir,
            max_file_size_bytes,
            cors_origins,
            ai_service_url,
            supabase_url,
            supabase_key,
        }
    }
}
