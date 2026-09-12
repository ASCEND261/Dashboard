use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::Team;
use crate::services::team_score_service::calculate_team_score;
use crate::state::AppState;
use axum::{extract::State, Json};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct LeaderboardTeamItem {
    pub rank: String,
    pub team_id: String,
    pub name: String,
    pub points: i32,
    pub movement: String,
    pub is_user_team: bool,
}

#[derive(Debug, Serialize)]
pub struct LeaderboardResponse {
    pub leaderboard_provider: &'static str,
    pub last_sync: &'static str,
    pub teams: Vec<LeaderboardTeamItem>,
}

pub async fn get_leaderboard(
    State(state): State<AppState>,
) -> Result<Json<LeaderboardResponse>, AppError> {
    let ascend_points = calculate_team_score(&state.db, "ASCEND").await?;

    let mut teams = vec![
        LeaderboardTeamItem {
            rank: "01".to_string(),
            team_id: "ASCEND".to_string(),
            name: "ASCEND".to_string(),
            points: ascend_points,
            movement: "0".to_string(),
            is_user_team: true,
        },
    ];

    teams.sort_by(|a, b| b.points.cmp(&a.points));
    for (idx, team) in teams.iter_mut().enumerate() {
        team.rank = format!("{:02}", idx + 1);
    }

    Ok(Json(LeaderboardResponse {
        leaderboard_provider: "AARVAK Central Integration Layer",
        last_sync: "2026-09-11T23:59:00Z",
        teams,
    }))
}

#[derive(Debug, Serialize)]
pub struct MilestoneData {
    pub current_points: i32,
    pub target_points: i32,
    pub points_remaining: i32,
    pub completion_pct: f64,
}

#[derive(Debug, Serialize)]
pub struct RecentActivityItem {
    pub id: String,
    pub r#type: String,
    pub title: String,
    pub impact: String,
    pub timestamp: String,
}

#[derive(Debug, Serialize)]
pub struct TeamProgressResponse {
    pub team_id: String,
    pub team_name: String,
    pub rank: String,
    pub total_points: i32,
    pub verified_achievements: i64,
    pub this_week_gain: String,
    pub milestone: MilestoneData,
    pub recent_activity: Vec<RecentActivityItem>,
}

#[derive(sqlx::FromRow)]
struct RecentAchievementRow {
    id: String,
    title: String,
    points_awarded: Option<i32>,
    created_at: Option<chrono::NaiveDateTime>,
}

pub async fn get_team_progress(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<Json<TeamProgressResponse>, AppError> {
    let team_id = user.team_id.clone().unwrap_or_else(|| "ASCEND".to_string());

    let verified_points = calculate_team_score(&state.db, &team_id).await?;

    let verified_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM achievements WHERE team_id = $1 AND status = 'VERIFIED'",
    )
    .bind(&team_id)
    .fetch_one(&state.db)
    .await?;

    let target_milestone = if verified_points == 0 {
        500
    } else {
        ((verified_points / 500) + 1) * 500
    };
    let points_to_next = std::cmp::max(0, target_milestone - verified_points);
    let completion_pct = ((verified_points as f64 / target_milestone as f64) * 1000.0).round() / 10.0;

    let team_name = if let Some(t_id) = &user.team_id {
        sqlx::query_as::<_, Team>("SELECT * FROM teams WHERE id = $1")
            .bind(t_id)
            .fetch_optional(&state.db)
            .await?
            .map(|t| t.name)
            .unwrap_or_else(|| team_id.clone())
    } else {
        team_id.clone()
    };

    let recents = sqlx::query_as::<_, RecentAchievementRow>(
        r#"
        SELECT 
            a.id, 
            a.title, 
            COALESCE(pl.final_points, 0)::integer as points_awarded, 
            a.created_at 
        FROM achievements a 
        LEFT JOIN point_ledger pl ON pl.source_id = a.id AND pl.status = 'APPLIED' AND pl.scope = 'TEAM'
        WHERE a.team_id = $1 AND a.status = 'VERIFIED' 
        ORDER BY a.created_at DESC LIMIT 5
        "#,
    )
    .bind(&team_id)
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    let mut recent_activity = Vec::new();
    for r in recents {
        let pts = r.points_awarded.unwrap_or(0);
        recent_activity.push(RecentActivityItem {
            id: r.id,
            r#type: "VERIFICATION".to_string(),
            title: r.title,
            impact: format!("+{} pts to Team {}", pts, team_name),
            timestamp: r
                .created_at
                .map(|d| d.format("%b %d, %H:%M").to_string())
                .unwrap_or_else(|| "Recent".to_string()),
        });
    }

    let this_week_gain = if verified_points > 0 {
        format!("+{}", verified_points)
    } else {
        "+0".to_string()
    };

    Ok(Json(TeamProgressResponse {
        team_id,
        team_name,
        rank: "#01".to_string(),
        total_points: verified_points,
        verified_achievements: verified_count,
        this_week_gain,
        milestone: MilestoneData {
            current_points: verified_points,
            target_points: target_milestone,
            points_remaining: points_to_next,
            completion_pct,
        },
        recent_activity,
    }))
}
