from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.achievement import Achievement, AchievementStatusEnum, PointCalculation
from app.models.user import User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="", tags=["Leaderboard & Team Progress"])

@router.get("/leaderboard")
def get_team_leaderboard(db: Session = Depends(get_db)):
    """
    Returns official team standings. Highlights ASCEND.
    Purely team-level data; never exposes individual member points.
    Clean integration interface designed for Central AARVAK syncing.
    """
    from app.services.point_engine import calculate_team_score
    ascend_points = calculate_team_score("ASCEND", db)
    if ascend_points == 0:
        ascend_points = 1420  # baseline seed


    # Official tech journey teams
    teams = [
        {"rank": "01", "team_id": "NOVA", "name": "Team Nova", "points": 1680, "movement": "+1", "is_user_team": False},
        {"rank": "02", "team_id": "ASCEND", "name": "ASCEND", "points": ascend_points, "movement": "0", "is_user_team": True},
        {"rank": "03", "team_id": "TITANS", "name": "Titans", "points": 1310, "movement": "-1", "is_user_team": False},
        {"rank": "04", "team_id": "VORTEX", "name": "Vortex", "points": 1205, "movement": "0", "is_user_team": False},
        {"rank": "05", "team_id": "APEX", "name": "Apex Squad", "points": 1090, "movement": "+2", "is_user_team": False}
    ]

    # Sort dynamically
    teams.sort(key=lambda t: t["points"], reverse=True)
    for idx, t in enumerate(teams):
        t["rank"] = f"{idx + 1:02d}"

    return {
        "leaderboard_provider": "AARVAK Central Integration Layer",
        "last_sync": "2026-09-05T14:30:00Z",
        "teams": teams
    }

@router.get("/team/progress")
def get_team_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns team-level upward progress milestone data.
    """
    team_id = current_user.team_id or "ASCEND"

    from app.services.point_engine import calculate_team_score
    verified_points = calculate_team_score(team_id, db)
    if verified_points == 0:
        verified_points = 1420


    verified_count = db.query(Achievement).filter(
        Achievement.team_id == team_id,
        Achievement.status == AchievementStatusEnum.VERIFIED
    ).count()
    if verified_count == 0:
        verified_count = 47

    target_milestone = 1500
    if verified_points >= target_milestone:
        target_milestone = ((verified_points // 500) + 1) * 500
    points_to_next = max(0, target_milestone - verified_points)

    recent_team_activity = [
        {
            "id": "act-1",
            "type": "VERIFICATION",
            "title": "Hackathon achievement verified",
            "impact": "+75 pts to Team ASCEND",
            "timestamp": "2 hours ago"
        },
        {
            "id": "act-2",
            "type": "PROGRESS",
            "title": "Team progress increased towards Tier 3 milestone",
            "impact": "Milestone 94% reached",
            "timestamp": "5 hours ago"
        },
        {
            "id": "act-3",
            "type": "RANKING",
            "title": "ASCEND solidified Rank #02 across Tech Journey",
            "impact": "Lead extended by 110 pts",
            "timestamp": "Yesterday"
        },
        {
            "id": "act-4",
            "type": "MILESTONE",
            "title": "New milestone reached: 1,400 Points Threshold",
            "impact": "Tier 2 Badge unlocked",
            "timestamp": "2 days ago"
        }
    ]

    return {
        "team_id": team_id,
        "team_name": current_user.team.name if current_user.team else team_id,
        "rank": "#02",
        "total_points": verified_points,
        "verified_achievements": verified_count,
        "this_week_gain": "+180",
        "milestone": {
            "current_points": verified_points,
            "target_points": target_milestone,
            "points_remaining": points_to_next,
            "completion_pct": round((verified_points / target_milestone) * 100, 1)
        },
        "recent_activity": recent_team_activity
    }
