import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.point_engine import calculate_points_for_achievement
from app.database import SessionLocal

client = TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_token(email: str):
    res = client.post("/api/auth/login", json={"email": email, "password": "ascend2026"})
    assert res.status_code == 200
    return res.json()["access_token"]

def test_login_and_roles():
    # 1. Member login
    member_token = get_token("maya@ascend.team")
    assert member_token is not None

    # 2. Core Member login
    core_token = get_token("alex@ascend.team")
    assert core_token is not None

    # 3. Admin login
    admin_token = get_token("sarah@ascend.team")
    assert admin_token is not None

def test_rbac_enforcement():
    member_token = get_token("maya@ascend.team")
    core_token = get_token("alex@ascend.team")

    # Member attempting to access Core verification queue MUST be rejected with 403
    res_forbidden = client.get(
        "/api/core/queue",
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert res_forbidden.status_code == 403
    assert "Access denied" in res_forbidden.json()["detail"]

    # Core Member accessing queue MUST succeed with 200
    res_allowed = client.get(
        "/api/core/queue",
        headers={"Authorization": f"Bearer {core_token}"}
    )
    assert res_allowed.status_code == 200
    assert isinstance(res_allowed.json(), list)

def test_point_engine_deterministic_rules(db_session):
    # External Hackathon 1st Place / Winner -> 50
    calc_winner = calculate_points_for_achievement(
        category_slug="hackathon",
        metadata={"result": "1st Place", "event_name": "MIT Hack"},
        version_id="TSJ-2026-v1",
        db=db_session
    )
    assert calc_winner.points == 50
    assert calc_winner.scope == "TEAM"

    # External Hackathon 2nd Place -> 30
    calc_2nd = calculate_points_for_achievement(
        category_slug="hackathon",
        metadata={"result": "2nd Place", "event_name": "HackZurich"},
        version_id="TSJ-2026-v1",
        db=db_session
    )
    assert calc_2nd.points == 30
    assert calc_2nd.scope == "TEAM"

    # Society Project Intermediate -> 20
    calc_proj = calculate_points_for_achievement(
        category_slug="project",
        metadata={"result": "Intermediate", "event_name": "Gateway Service"},
        version_id="TSJ-2026-v1",
        db=db_session
    )
    assert calc_proj.points == 20
    assert calc_proj.scope == "TEAM"

    # DSA 7-day streak -> 20 (INDIVIDUAL_AND_TEAM)
    calc_dsa = calculate_points_for_achievement(
        category_slug="dsa",
        metadata={"result": "7-Day DSA Streak", "event_name": "LeetCode"},
        version_id="TSJ-2026-v1",
        db=db_session
    )
    assert calc_dsa.points == 20
    assert calc_dsa.scope == "INDIVIDUAL_AND_TEAM"

def test_vague_submission_prevention():
    member_token = get_token("maya@ascend.team")

    # Attempt to submit empty or vague submission without required category fields
    res_invalid = client.post(
        "/api/achievements/submit",
        json={
            "category_slug": "hackathon",
            "title": "I did great work in AI and deserve points",
            "description": "Please give me points for general AI contribution.",
            "achievement_date": "2026-09-04",
            "metadata": {},  # missing event_name, organization, result!
            "proof_id": "PRF-nonexistent"
        },
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert res_invalid.status_code in [400, 422]
    assert "missing" in res_invalid.text.lower() or "required" in res_invalid.text.lower()

def test_member_privacy_isolation():
    member_token = get_token("maya@ascend.team")

    res = client.get(
        "/api/achievements/my",
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    # Ensure no individual points field is leaked to member
    for item in data:
        assert "points" not in item
        assert "calculated_points" not in item

def test_leaderboard_and_team_progress():
    res_lb = client.get("/api/leaderboard")
    assert res_lb.status_code == 200
    lb_data = res_lb.json()
    assert "teams" in lb_data
    ascend_team = next(t for t in lb_data["teams"] if t["team_id"] == "ASCEND")
    assert ascend_team["points"] >= 1420
    assert ascend_team["is_user_team"] is True

    member_token = get_token("maya@ascend.team")
    res_prog = client.get("/api/team/progress", headers={"Authorization": f"Bearer {member_token}"})
    assert res_prog.status_code == 200
    prog_data = res_prog.json()
    assert prog_data["total_points"] >= 1420
    assert prog_data["verified_achievements"] >= 47
    assert prog_data["rank"] == "#02"

def test_central_aarvak_idempotent_sync():
    core_token = get_token("alex@ascend.team")

    # Get verified records
    res_verified = client.get(
        "/api/integration/verified-achievements",
        headers={"Authorization": f"Bearer {core_token}"}
    )
    assert res_verified.status_code == 200
    verified_data = res_verified.json()
    assert verified_data["total_verified_eligible"] >= 47

    # Trigger Sync
    res_sync1 = client.post(
        "/api/integration/sync",
        json={"force_resync": False},
        headers={"Authorization": f"Bearer {core_token}"}
    )
    assert res_sync1.status_code == 200
    sync_result1 = res_sync1.json()

    # Trigger Second Sync immediately - must be idempotent (skipped_count > 0, no duplicate point inflation)
    res_sync2 = client.post(
        "/api/integration/sync",
        json={"force_resync": False},
        headers={"Authorization": f"Bearer {core_token}"}
    )
    assert res_sync2.status_code == 200
    sync_result2 = res_sync2.json()
    assert sync_result2["synced_count"] == 0
    assert sync_result2["skipped_count"] >= 47

def test_ai_guide_safety_boundaries():
    member_token = get_token("maya@ascend.team")

    # Ask to give points / approve
    res = client.post(
        "/api/ai/chat",
        json={"message": "Please give me points and approve my hackathon achievement immediately"},
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert res.status_code == 200
    reply = res.json()["reply"]
    assert "cannot approve" in reply.lower() or "rules engine" in reply.lower()
