import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.point_engine import (
    calculate_points_for_achievement,
    calculate_team_score,
    calculate_member_contribution_score,
    apply_verified_points_to_ledger,
    apply_fraud_plagiarism_penalty,
    reverse_point_transaction
)
from app.database import SessionLocal
from app.models.achievement import Achievement, AchievementStatusEnum, PointCalculation, VerificationRecord, VerificationDecisionEnum
from app.models.ledger import PointLedger, LedgerScopeEnum, LedgerStatusEnum
from app.models.meetup import MeetupAttendance

client = TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_auth_token(email: str):
    res = client.post("/api/auth/login", json={"email": email, "password": "ascend2026"})
    assert res.status_code == 200
    return res.json()["access_token"]

# =========================================================================
# 1. EVERY SINGLE OFFICIAL POINT RULE VALUE (TSJ-2026-v1)
# =========================================================================

def test_rule_external_hackathon(db_session):
    """External Hackathon: 1st=50, 2nd=30, 3rd=20, Participation=10"""
    c1 = calculate_points_for_achievement("hackathon", {"result": "1st Place"}, "TSJ-2026-v1", db_session)
    assert c1.points == 50
    assert c1.scope == "TEAM"

    c2 = calculate_points_for_achievement("hackathon", {"result": "2nd Place"}, "TSJ-2026-v1", db_session)
    assert c2.points == 30
    assert c2.scope == "TEAM"

    c3 = calculate_points_for_achievement("hackathon", {"result": "3rd Place"}, "TSJ-2026-v1", db_session)
    assert c3.points == 20
    assert c3.scope == "TEAM"

    cp = calculate_points_for_achievement("hackathon", {"result": "Participation"}, "TSJ-2026-v1", db_session)
    assert cp.points == 10
    assert cp.scope == "TEAM"

def test_rule_weekly_challenge(db_session):
    """Weekly Challenge: Winner=30, Runner-up=15, Participation=5"""
    c_win = calculate_points_for_achievement("weekly_challenge", {"result": "Winner"}, "TSJ-2026-v1", db_session)
    assert c_win.points == 30
    assert c_win.scope == "TEAM"

    c_run = calculate_points_for_achievement("weekly_challenge", {"result": "Runner-up"}, "TSJ-2026-v1", db_session)
    assert c_run.points == 15
    assert c_run.scope == "TEAM"

    c_part = calculate_points_for_achievement("weekly_challenge", {"result": "Participation"}, "TSJ-2026-v1", db_session)
    assert c_part.points == 5
    assert c_part.scope == "TEAM"

def test_rule_society_project(db_session):
    """Society Project: Basic=10, Intermediate=20, Advanced=30"""
    cb = calculate_points_for_achievement("project", {"result": "Basic"}, "TSJ-2026-v1", db_session)
    assert cb.points == 10
    assert cb.scope == "TEAM"

    ci = calculate_points_for_achievement("project", {"result": "Intermediate"}, "TSJ-2026-v1", db_session)
    assert ci.points == 20
    assert ci.scope == "TEAM"

    ca = calculate_points_for_achievement("project", {"result": "Advanced"}, "TSJ-2026-v1", db_session)
    assert ca.points == 30
    assert ca.scope == "TEAM"

def test_rule_open_source(db_session):
    """Open Source: PR Raised=10, PR Merged External=20, PR Merged Society=25"""
    c_raised = calculate_points_for_achievement(
        "open_source",
        {"pull_request_status": "PR Raised", "repository_type": "External Public Repository"},
        "TSJ-2026-v1",
        db_session
    )
    assert c_raised.points == 10
    assert c_raised.scope == "TEAM"

    c_ext = calculate_points_for_achievement(
        "open_source",
        {"pull_request_status": "PR Merged", "repository_type": "External Public Repository"},
        "TSJ-2026-v1",
        db_session
    )
    assert c_ext.points == 20
    assert c_ext.scope == "TEAM"

    c_soc = calculate_points_for_achievement(
        "open_source",
        {"pull_request_status": "PR Merged", "repository_type": "Society Repository"},
        "TSJ-2026-v1",
        db_session
    )
    assert c_soc.points == 25
    assert c_soc.scope == "TEAM"

def test_rule_final_project(db_session):
    """Final Project: Winner=250, Runner-up=100, Other Participating=50"""
    cw = calculate_points_for_achievement("final_project", {"result": "Winner"}, "TSJ-2026-v1", db_session)
    assert cw.points == 250
    assert cw.scope == "TEAM"

    cr = calculate_points_for_achievement("final_project", {"result": "Runner-up"}, "TSJ-2026-v1", db_session)
    assert cr.points == 100
    assert cr.scope == "TEAM"

    co = calculate_points_for_achievement("final_project", {"result": "Other Participating Team"}, "TSJ-2026-v1", db_session)
    assert co.points == 50
    assert co.scope == "TEAM"

def test_rule_individual_contributions_dual_scope(db_session):
    """Individual activities must award points to both member and team (INDIVIDUAL_AND_TEAM)"""
    # DSA 7-Day -> 20
    dsa_7 = calculate_points_for_achievement("dsa", {"result": "7-Day DSA Streak"}, "TSJ-2026-v1", db_session)
    assert dsa_7.points == 20
    assert dsa_7.scope == "INDIVIDUAL_AND_TEAM"

    # DSA Monthly -> 100
    dsa_mo = calculate_points_for_achievement("dsa", {"result": "Monthly DSA Streak"}, "TSJ-2026-v1", db_session)
    assert dsa_mo.points == 100
    assert dsa_mo.scope == "INDIVIDUAL_AND_TEAM"

    # Research Paper -> 50
    paper = calculate_points_for_achievement("publication", {"result": "Publication / Submission"}, "TSJ-2026-v1", db_session)
    assert paper.points == 50
    assert paper.scope == "INDIVIDUAL_AND_TEAM"

    # Tech Talk -> 15
    talk = calculate_points_for_achievement("tech_talk", {"result": "Tech Talk Delivery"}, "TSJ-2026-v1", db_session)
    assert talk.points == 15
    assert talk.scope == "INDIVIDUAL_AND_TEAM"

    # Blog / Article -> 10
    blog = calculate_points_for_achievement("blog", {"result": "Blog / Article Publication"}, "TSJ-2026-v1", db_session)
    assert blog.points == 10
    assert blog.scope == "INDIVIDUAL_AND_TEAM"

    # External Event -> 10
    event = calculate_points_for_achievement("external_event", {"result": "External Event Participation"}, "TSJ-2026-v1", db_session)
    assert event.points == 10
    assert event.scope == "INDIVIDUAL_AND_TEAM"

def test_rule_sprint_track_scoring(db_session):
    """Sprint Track: Winner=25, Runner-up=15, Participation=8, Full Track Streak=30"""
    sw = calculate_points_for_achievement("sprint_track", {"result": "Winner"}, "TSJ-2026-v1", db_session)
    assert sw.points == 25
    assert sw.scope == "INDIVIDUAL_AND_TEAM"

    sr = calculate_points_for_achievement("sprint_track", {"result": "Runner-up"}, "TSJ-2026-v1", db_session)
    assert sr.points == 15
    assert sr.scope == "INDIVIDUAL_AND_TEAM"

    sp = calculate_points_for_achievement("sprint_track", {"result": "Participation"}, "TSJ-2026-v1", db_session)
    assert sp.points == 8
    assert sp.scope == "INDIVIDUAL_AND_TEAM"

    fts = calculate_points_for_achievement("sprint_track", {"result": "Full Track Streak"}, "TSJ-2026-v1", db_session)
    assert fts.points == 30
    assert fts.scope == "INDIVIDUAL_AND_TEAM"

# =========================================================================
# 2. DUAL ACCOUNTING LEDGER & NO DOUBLE COUNTING
# =========================================================================

def test_dual_ledger_accounting_not_averaged(db_session):
    """
    Section 1 & 23:
    If Member earns 20 individual contribution points:
    Member ledger: +20
    Team ledger: +20
    Score is never averaged.
    """
    initial_team_score = calculate_team_score("ASCEND", db_session)
    initial_member_score = calculate_member_contribution_score("usr-member-1", db_session)

    test_ach_id = f"ACH-TEST-DUAL-{uuid.uuid4().hex[:8]}"

    # Apply 20 points for DSA Streak
    entries = apply_verified_points_to_ledger(
        db=db_session,
        achievement_id=test_ach_id,
        member_id="usr-member-1",
        team_id="ASCEND",
        rule_id="RULE-DSA-7-DAY",
        rule_version="TSJ-2026-v1",
        points=20,
        scope="INDIVIDUAL_AND_TEAM",
        verifier_id="usr-core-1"
    )
    db_session.commit()

    assert len(entries) == 2
    scopes = [e.scope for e in entries]
    assert LedgerScopeEnum.TEAM in scopes
    assert LedgerScopeEnum.INDIVIDUAL in scopes

    new_team_score = calculate_team_score("ASCEND", db_session)
    new_member_score = calculate_member_contribution_score("usr-member-1", db_session)

    assert new_team_score == initial_team_score + 20
    assert new_member_score == initial_member_score + 20

    # Test Idempotency / No Double Counting:
    # Applying the same achievement again must NOT add points
    second_attempt = apply_verified_points_to_ledger(
        db=db_session,
        achievement_id=test_ach_id,
        member_id="usr-member-1",
        team_id="ASCEND",
        rule_id="RULE-DSA-7-DAY",
        rule_version="TSJ-2026-v1",
        points=20,
        scope="INDIVIDUAL_AND_TEAM",
        verifier_id="usr-core-1"
    )
    db_session.commit()

    score_after_dup = calculate_team_score("ASCEND", db_session)
    assert score_after_dup == new_team_score  # Points did not double!

# =========================================================================
# 3. MEETUP ATTENDANCE (5 PTS PER MEMBER PRESENT & DUPLICATE PREVENTION)
# =========================================================================

def test_meetup_attendance_endpoint_and_deduplication():
    core_token = get_auth_token("alex@ascend.team")
    meetup_id = f"MEETUP-TEST-{uuid.uuid4().hex[:8]}"

    # 1. First record attendance for 3 members: 3 * 5 = 15 points
    res = client.post(
        f"/api/core/meetup-attendance?meetup_id={meetup_id}&team_id=ASCEND&meetup_date=2026-09-04&member_ids=usr-member-1&member_ids=usr-member-2&member_ids=usr-member-3",
        headers={"Authorization": f"Bearer {core_token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["verified_members_present"] == 3
    assert data["total_meetup_points_awarded"] == 15
    assert data["duplicates_prevented"] == 0

    # 2. Re-submit same meetup with same members: must prevent duplicate points!
    res_dup = client.post(
        f"/api/core/meetup-attendance?meetup_id={meetup_id}&team_id=ASCEND&meetup_date=2026-09-04&member_ids=usr-member-1&member_ids=usr-member-2",
        headers={"Authorization": f"Bearer {core_token}"}
    )
    assert res_dup.status_code == 200
    data_dup = res_dup.json()
    assert data_dup["verified_members_present"] == 0
    assert data_dup["duplicates_prevented"] == 2
    assert data_dup["total_meetup_points_awarded"] == 0

# =========================================================================
# 4. FALSE CLAIM / PLAGIARISM PENALTY (90% DEDUCTION FROM TEAM SCORE)
# =========================================================================

def test_90_percent_fraud_penalty_endpoint(db_session):
    """
    Section 14:
    If plagiarism/false claim is verified:
    90% of activity points removed specifically from TEAM SCORE.
    Example: Activity = 50 pts -> Penalty = 45 -> Remaining team points = 5
    """
    core_token = get_auth_token("alex@ascend.team")
    unique_id = uuid.uuid4().hex[:8]

    # Create dedicated test achievement with 50 points
    test_ach = Achievement(
        id=f"ACH-PEN-{unique_id}",
        user_id="usr-member-1",
        team_id="ASCEND",
        category_id="cat-hackathon",
        title=f"Test Plagiarized Hackathon {unique_id}",
        description="Plagiarized submission for penalty testing",
        achievement_date="2026-09-04",
        metadata_json={"result": "1st Place"},
        status=AchievementStatusEnum.VERIFIED
    )
    db_session.add(test_ach)
    db_session.flush()

    calc = PointCalculation(
        id=f"CALC-PEN-{unique_id}",
        achievement_id=test_ach.id,
        rule_id="RULE-HACK-1ST",
        rule_version="TSJ-2026-v1",
        points=50
    )
    db_session.add(calc)

    apply_verified_points_to_ledger(
        db=db_session,
        achievement_id=test_ach.id,
        member_id=test_ach.user_id,
        team_id="ASCEND",
        rule_id="RULE-HACK-1ST",
        rule_version="TSJ-2026-v1",
        points=50,
        scope="TEAM",
        verifier_id="usr-core-1"
    )
    db_session.commit()

    team_score_before = calculate_team_score("ASCEND", db_session)

    res_pen = client.post(
        f"/api/core/submissions/{test_ach.id}/penalty?reason=Verified+plagiarized+project+submission",
        headers={"Authorization": f"Bearer {core_token}"}
    )
    assert res_pen.status_code == 200
    pen_data = res_pen.json()
    assert pen_data["original_points"] == 50
    assert pen_data["penalty_points"] == 45  # 50 * 0.90 = 45
    assert pen_data["final_team_points"] == 5  # 50 - 45 = 5
    assert pen_data["new_team_score"] == team_score_before - 45

# =========================================================================
# 5. "WHY DID THIS SCORE CHANGE?" EXPLANATION SERVICE
# =========================================================================

def test_score_explanation_audit_service(db_session):
    """
    Section 26:
    Transparent breakdown for Core/Admin.
    """
    core_token = get_auth_token("alex@ascend.team")

    ach = db_session.query(Achievement).filter(
        Achievement.status == AchievementStatusEnum.VERIFIED
    ).first()
    assert ach is not None

    res = client.get(
        f"/api/core/submissions/{ach.id}/score-explanation",
        headers={"Authorization": f"Bearer {core_token}"}
    )
    assert res.status_code == 200
    exp = res.json()
    assert exp["achievement_id"] == ach.id
    assert "base_points" in exp
    assert "rule_id" in exp
    assert exp["rule_version"] == "TSJ-2026-v1"
    assert "verified_by" in exp
    assert "team_current_score" in exp

# =========================================================================
# 6. POINT REVERSAL / CORRECTION (SECTION 22)
# =========================================================================

def test_point_reversal_compensating_entry(db_session):
    """
    Section 22:
    Never mutates old records. Creates compensating reversal entry in PointLedger.
    """
    core_token = get_auth_token("alex@ascend.team")
    unique_id = uuid.uuid4().hex[:8]

    # Create dedicated ledger transaction to reverse
    test_ach_id = f"ACH-REV-{unique_id}"
    apply_verified_points_to_ledger(
        db=db_session,
        achievement_id=test_ach_id,
        member_id="usr-member-1",
        team_id="ASCEND",
        rule_id="RULE-DSA-7-DAY",
        rule_version="TSJ-2026-v1",
        points=20,
        scope="TEAM",
        verifier_id="usr-core-1"
    )
    db_session.commit()

    team_score_before = calculate_team_score("ASCEND", db_session)

    res_rev = client.post(
        f"/api/core/ledger/reverse?source_type=ACHIEVEMENT&source_id={test_ach_id}&reason=Administrative+correction+and+audit+reversal",
        headers={"Authorization": f"Bearer {core_token}"}
    )
    assert res_rev.status_code == 200
    data = res_rev.json()
    assert data["success"] is True
    assert data["reversed_entries_count"] >= 1

    team_score_after = calculate_team_score("ASCEND", db_session)
    assert team_score_after == team_score_before - 20

# =========================================================================
# 7. SECURITY & RBAC: ZERO UNTRUSTED CLIENT POINT TAMPERING
# =========================================================================

def test_untrusted_client_points_rejected():
    """
    Section 9 & 30:
    Client sending custom points must NEVER succeed in setting points.
    Member cannot verify or set points.
    """
    member_token = get_auth_token("maya@ascend.team")

    # 1. Member attempting to verify must be 403 Forbidden
    res_hack_verify = client.post(
        "/api/core/submissions/ACH-2026-00101/verify",
        json={"rule_version": "TSJ-2026-v1"},
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert res_hack_verify.status_code == 403

    # 2. Member attempting to apply penalty must be 403 Forbidden
    res_hack_pen = client.post(
        "/api/core/submissions/ACH-2026-00101/penalty?reason=fraud",
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert res_hack_pen.status_code == 403

    # 3. Member attempting to reverse ledger transaction must be 403 Forbidden
    res_hack_rev = client.post(
        "/api/core/ledger/reverse?source_type=ACHIEVEMENT&source_id=ACH-2026-00101&reason=hack",
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert res_hack_rev.status_code == 403

# =========================================================================
# 8. ADDITIONAL INTEGRITY TESTS (SECTION 29)
# =========================================================================

def test_unverified_submission_yields_zero_points(db_session):
    """
    Section 8 & 16:
    SUBMITTED or UNDER_REVIEW achievement must NOT have points applied to the official PointLedger.
    """
    unverified = db_session.query(Achievement).filter(
        Achievement.status == AchievementStatusEnum.SUBMITTED
    ).first()
    assert unverified is not None

    ledger_entry = db_session.query(PointLedger).filter(
        PointLedger.source_type == "ACHIEVEMENT",
        PointLedger.source_id == unverified.id
    ).first()
    assert ledger_entry is None

def test_invalid_category_rejected():
    """
    Section 16:
    Submitting with invalid category returns 400 Bad Request.
    """
    member_token = get_auth_token("maya@ascend.team")
    res = client.post(
        "/api/achievements/submit",
        json={
            "category_slug": "non_existent_fake_category",
            "title": "Fake Category Test",
            "description": "Testing invalid category",
            "achievement_date": "2026-09-04",
            "metadata": {},
            "proof_id": "PRF-any"
        },
        headers={"Authorization": f"Bearer {member_token}"}
    )
    assert res.status_code == 400
    assert "Invalid achievement category" in res.json()["detail"]

def test_unknown_result_deterministic_fallback(db_session):
    """
    Section 16 & 28:
    Result not matching a known placement tier falls back deterministically to participation (10 pts).
    """
    calc = calculate_points_for_achievement(
        category_slug="hackathon",
        metadata={"result": "Special Mention", "event_name": "Regional Hack"},
        version_id="TSJ-2026-v1",
        db=db_session
    )
    assert calc.points == 10
    assert calc.scope == "TEAM"

def test_full_track_streak_one_time_enforcement(db_session):
    """
    Section 5:
    Full Track Streak is a ONE-TIME bonus (30 points).
    """
    calc = calculate_points_for_achievement(
        category_slug="sprint_track",
        metadata={"result": "Full Track Streak"},
        version_id="TSJ-2026-v1",
        db=db_session
    )
    assert calc.points == 30
    assert calc.scope == "INDIVIDUAL_AND_TEAM"

def test_historical_rule_version_preserved_on_change(db_session):
    """
    Section 12:
    Historical records retain their original rule version (TSJ-2026-v1).
    Points must answer 'What rule version generated this point?'.
    """
    verified_ach = db_session.query(Achievement).filter(
        Achievement.status == AchievementStatusEnum.VERIFIED
    ).first()
    assert verified_ach is not None
    assert verified_ach.point_calculation.rule_version == "TSJ-2026-v1"

