use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct MeetupAttendance {
    pub id: String,
    pub meetup_id: String,
    pub team_id: String,
    pub member_id: String,
    pub meetup_date: String,
    pub verified_by: String,
    pub verified_at: Option<NaiveDateTime>,
}
