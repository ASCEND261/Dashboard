use ascend_backend::config::Config;
use ascend_backend::models::User;
use sqlx::PgPool;

#[tokio::test]
async fn test_db_user_query() {
    let config = Config::from_env();
    let pool = PgPool::connect(&config.database_url).await.expect("Failed to connect to Postgres");
    let user = sqlx::query_as::<_, User>("SELECT * FROM users LIMIT 1")
        .fetch_optional(&pool)
        .await;

    match user {
        Ok(Some(u)) => println!("Successfully queried user: {}", u.email),
        Ok(None) => println!("No users found"),
        Err(e) => panic!("Error querying user: {:?}", e),
    }
}
