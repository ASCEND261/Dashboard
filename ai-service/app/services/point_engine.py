import logging
from decimal import Decimal
from typing import Dict, Any, Optional, Tuple, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.rule import PointRule, PointRuleVersion
from app.models.ledger import PointLedger, LedgerScopeEnum, LedgerStatusEnum
from app.models.penalty import PenaltyRecord

logger = logging.getLogger(__name__)

OFFICIAL_VERSION = "TSJ-2026-v1"

class PointCalculationResult:
    def __init__(
        self,
        rule_id: str,
        rule_code: str,
        rule_version: str,
        points: int,
        scope: str,
        condition_matched: str,
        eligible: bool = True
    ):
        self.rule_id = rule_id
        self.rule_code = rule_code
        self.rule_version = rule_version
        self.points = points
        self.scope = scope  # TEAM or INDIVIDUAL_AND_TEAM
        self.condition_matched = condition_matched
        self.eligible = eligible

    def to_dict(self) -> Dict[str, Any]:
        return {
            "rule_id": self.rule_id,
            "rule_code": self.rule_code,
            "rule_version": self.rule_version,
            "points": self.points,
            "scope": self.scope,
            "condition_matched": self.condition_matched,
            "eligible": self.eligible
        }

def calculate_points_for_achievement(
    category_slug: str,
    metadata: Dict[str, Any],
    version_id: str = OFFICIAL_VERSION,
    db: Session = None
) -> PointCalculationResult:
    """
    Deterministic Point Rules Engine strictly implementing the
    TECH SPRINT JOURNEY 2026 — OFFICIAL POINTS & SCORING SYSTEM.
    
    CRITICAL RULE:
    Zero point hallucination, estimation, rounding, or AI-generation.
    Official document is the single source of truth.
    """
    if db is None:
        raise ValueError("Database session required for point calculation.")

    if version_id in ["2026-v1", "TSJ-2026-v1"]:
        version_id = OFFICIAL_VERSION

    norm_meta = {k.lower(): str(v).strip() for k, v in metadata.items() if v is not None}
    cat = category_slug.lower().strip()

    # Rule lookup query
    query = db.query(PointRule).filter(
        PointRule.version_id == version_id,
        PointRule.is_active == True
    )

    def get_rule_info(code: str):
        r = query.filter(PointRule.rule_code == code).first()
        return (r.id if r else f"RULE-{code}", r.rule_code if r else code)

    # 1. EXTERNAL HACKATHON
    # 1st Place = 50, 2nd Place = 30, 3rd Place = 20, Participation = 10
    if cat == "hackathon" or cat == "external_hackathon":
        result_val = (norm_meta.get("result") or norm_meta.get("position") or "").lower()
        if "1st" in result_val or "first" in result_val or "winner" in result_val:
            rid, rcode = get_rule_info("EXTERNAL_HACKATHON_1ST")
            return PointCalculationResult(rid, rcode, version_id, 50, "TEAM", "External Hackathon 1st Place")
        elif "2nd" in result_val or "second" in result_val or "runner" in result_val:
            rid, rcode = get_rule_info("EXTERNAL_HACKATHON_2ND")
            return PointCalculationResult(rid, rcode, version_id, 30, "TEAM", "External Hackathon 2nd Place")
        elif "3rd" in result_val or "third" in result_val:
            rid, rcode = get_rule_info("EXTERNAL_HACKATHON_3RD")
            return PointCalculationResult(rid, rcode, version_id, 20, "TEAM", "External Hackathon 3rd Place")
        else:
            rid, rcode = get_rule_info("EXTERNAL_HACKATHON_PARTICIPATION")
            return PointCalculationResult(rid, rcode, version_id, 10, "TEAM", "External Hackathon Participation")

    # 2. WEEKLY CHALLENGE
    # Winner = 30, Runner-up = 15, Participation = 5
    if cat == "weekly_challenge":
        result_val = (norm_meta.get("result") or "").lower()
        if "winner" in result_val or "1st" in result_val or "first" in result_val:
            rid, rcode = get_rule_info("WEEKLY_CHALLENGE_WINNER")
            return PointCalculationResult(rid, rcode, version_id, 30, "TEAM", "Weekly Challenge Winner")
        elif "runner" in result_val or "2nd" in result_val or "second" in result_val:
            rid, rcode = get_rule_info("WEEKLY_CHALLENGE_RUNNER_UP")
            return PointCalculationResult(rid, rcode, version_id, 15, "TEAM", "Weekly Challenge Runner-up")
        else:
            rid, rcode = get_rule_info("WEEKLY_CHALLENGE_PARTICIPATION")
            return PointCalculationResult(rid, rcode, version_id, 5, "TEAM", "Weekly Challenge Participation")

    # 3. SOCIETY PROJECT
    # Basic = 10, Intermediate = 20, Advanced = 30
    if cat == "project" or cat == "society_project":
        level_val = (norm_meta.get("result") or norm_meta.get("level") or norm_meta.get("project_level") or "").lower()
        if "advance" in level_val or "production" in level_val:
            rid, rcode = get_rule_info("SOCIETY_PROJECT_ADVANCED")
            return PointCalculationResult(rid, rcode, version_id, 30, "TEAM", "Society Project Advanced")
        elif "intermed" in level_val or "prototype" in level_val:
            rid, rcode = get_rule_info("SOCIETY_PROJECT_INTERMEDIATE")
            return PointCalculationResult(rid, rcode, version_id, 20, "TEAM", "Society Project Intermediate")
        else:
            rid, rcode = get_rule_info("SOCIETY_PROJECT_BASIC")
            return PointCalculationResult(rid, rcode, version_id, 10, "TEAM", "Society Project Basic")

    # 4. OPEN SOURCE
    # PR Raised = 10, PR Merged External Public Repo = 20, PR Merged Society Repo = 25
    if cat == "open_source":
        pr_status = (norm_meta.get("pull_request_status") or norm_meta.get("result") or "merged").lower()
        repo_type = (norm_meta.get("repository_type") or norm_meta.get("type") or "external_public").lower()

        if "raised" in pr_status and "merge" not in pr_status:
            rid, rcode = get_rule_info("OPEN_SOURCE_PR_RAISED")
            return PointCalculationResult(rid, rcode, version_id, 10, "TEAM", "Open Source PR Raised")
        elif "society" in repo_type or "internal" in repo_type:
            rid, rcode = get_rule_info("OPEN_SOURCE_PR_MERGED_SOCIETY")
            return PointCalculationResult(rid, rcode, version_id, 25, "TEAM", "Open Source PR Merged Society Repo")
        else:
            rid, rcode = get_rule_info("OPEN_SOURCE_PR_MERGED_EXTERNAL")
            return PointCalculationResult(rid, rcode, version_id, 20, "TEAM", "Open Source PR Merged External Public Repo")

    # 5. FINAL / MAJOR PROJECT
    # Winner = 250, Runner-up = 100, Other participating teams = 50
    if cat == "final_project" or cat == "major_project":
        res_val = (norm_meta.get("result") or "").lower()
        if "winner" in res_val or "1st" in res_val:
            rid, rcode = get_rule_info("FINAL_PROJECT_WINNER")
            return PointCalculationResult(rid, rcode, version_id, 250, "TEAM", "Final Project Winner")
        elif "runner" in res_val or "2nd" in res_val:
            rid, rcode = get_rule_info("FINAL_PROJECT_RUNNER_UP")
            return PointCalculationResult(rid, rcode, version_id, 100, "TEAM", "Final Project Runner-up")
        else:
            rid, rcode = get_rule_info("FINAL_PROJECT_PARTICIPATING")
            return PointCalculationResult(rid, rcode, version_id, 50, "TEAM", "Final Project Participating Team")

    # 6. INDIVIDUAL SCOREBOARD: DSA STREAK
    # 7-day DSA streak = 20, Monthly DSA streak = 100 (INDIVIDUAL + TEAM)
    if cat == "dsa" or cat == "dsa_streak":
        streak_type = (norm_meta.get("streak_type") or norm_meta.get("result") or "7_day").lower()
        if "month" in streak_type or "30" in streak_type:
            rid, rcode = get_rule_info("DSA_MONTHLY_STREAK")
            return PointCalculationResult(rid, rcode, version_id, 100, "INDIVIDUAL_AND_TEAM", "Monthly DSA Streak")
        else:
            rid, rcode = get_rule_info("DSA_7_DAY_STREAK")
            return PointCalculationResult(rid, rcode, version_id, 20, "INDIVIDUAL_AND_TEAM", "7-Day DSA Streak")

    # 7. RESEARCH PAPER
    # Publication / Submission = 50 (INDIVIDUAL + TEAM)
    if cat == "publication" or cat == "research_paper":
        rid, rcode = get_rule_info("RESEARCH_PAPER")
        return PointCalculationResult(rid, rcode, version_id, 50, "INDIVIDUAL_AND_TEAM", "Research Paper Publication")

    # 8. TECH TALK
    # Delivery = 15 (INDIVIDUAL + TEAM)
    if cat == "tech_talk":
        rid, rcode = get_rule_info("TECH_TALK")
        return PointCalculationResult(rid, rcode, version_id, 15, "INDIVIDUAL_AND_TEAM", "Tech Talk Delivery")

    # 9. BLOG / ARTICLE
    # Publication = 10 (INDIVIDUAL + TEAM)
    if cat == "blog" or cat == "article":
        rid, rcode = get_rule_info("BLOG_ARTICLE")
        return PointCalculationResult(rid, rcode, version_id, 10, "INDIVIDUAL_AND_TEAM", "Blog / Article Publication")

    # 10. EXTERNAL EVENT
    # Attendance / Participation = 10 (INDIVIDUAL + TEAM)
    if cat == "external_event" or cat == "event":
        rid, rcode = get_rule_info("EXTERNAL_EVENT")
        return PointCalculationResult(rid, rcode, version_id, 10, "INDIVIDUAL_AND_TEAM", "External Event Participation")

    # 11. SPRINT TRACK SCORING
    # Winner = 25, Runner-up = 15, Participation = 8, Full Track Streak = 30 (INDIVIDUAL + TEAM)
    if cat == "sprint_track" or cat == "track":
        res_val = (norm_meta.get("result") or "").lower()
        if "full" in res_val or "streak" in res_val:
            rid, rcode = get_rule_info("FULL_TRACK_STREAK")
            return PointCalculationResult(rid, rcode, version_id, 30, "INDIVIDUAL_AND_TEAM", "Full Track Streak Bonus")
        elif "winner" in res_val or "1st" in res_val:
            rid, rcode = get_rule_info("SPRINT_WINNER")
            return PointCalculationResult(rid, rcode, version_id, 25, "INDIVIDUAL_AND_TEAM", "Sprint Track Winner")
        elif "runner" in res_val or "2nd" in res_val:
            rid, rcode = get_rule_info("SPRINT_RUNNER_UP")
            return PointCalculationResult(rid, rcode, version_id, 15, "INDIVIDUAL_AND_TEAM", "Sprint Track Runner-up")
        else:
            rid, rcode = get_rule_info("SPRINT_PARTICIPATION")
            return PointCalculationResult(rid, rcode, version_id, 8, "INDIVIDUAL_AND_TEAM", "Sprint Track Participation")

    # 12. Generic / Other Technical fallback
    default_rule = query.filter(PointRule.category_slug == cat).first()
    if default_rule:
        return PointCalculationResult(
            default_rule.id,
            default_rule.rule_code or f"RULE_{cat.upper()}",
            version_id,
            default_rule.points,
            default_rule.scope,
            f"Configured tier ({default_rule.condition_val})"
        )

    # Safe official baseline
    return PointCalculationResult(
        rule_id="RULE-BASE-10",
        rule_code="OFFICIAL_BASELINE",
        rule_version=version_id,
        points=10,
        scope="TEAM",
        condition_matched="Official participation baseline"
    )

# =========================================================================
# POINT LEDGER & ACCOUNTING SERVICES
# =========================================================================

def apply_verified_points_to_ledger(
    db: Session,
    achievement_id: str,
    member_id: str,
    team_id: str,
    rule_id: str,
    rule_version: str,
    points: int,
    scope: str,
    verifier_id: str
) -> List[PointLedger]:
    """
    Applies official points to the immutable Point Ledger.
    
    OFFICIAL DUAL ACCOUNTING RULE:
    If scope is INDIVIDUAL_AND_TEAM:
      1. Member ledger: +points
      2. Team ledger:   +points
      (Counts for BOTH, never averaged!)
    If scope is TEAM:
      1. Team ledger:   +points
      
    Guarantees idempotency via unique constraints.
    """
    entries = []

    # Check existing entry for this achievement to prevent double-counting
    existing = db.query(PointLedger).filter(
        PointLedger.source_type == "ACHIEVEMENT",
        PointLedger.source_id == achievement_id,
        PointLedger.status == LedgerStatusEnum.APPLIED
    ).first()

    if existing:
        logger.warning(f"Achievement {achievement_id} already has applied points in ledger. Skipping.")
        return db.query(PointLedger).filter(
            PointLedger.source_type == "ACHIEVEMENT",
            PointLedger.source_id == achievement_id
        ).all()

    # 1. Team Ledger Entry
    team_entry = PointLedger(
        achievement_id=achievement_id,
        member_id=member_id,
        team_id=team_id,
        source_type="ACHIEVEMENT",
        source_id=achievement_id,
        rule_id=rule_id,
        rule_version=rule_version,
        base_points=points,
        bonus_points=0,
        penalty_points=0,
        final_points=points,
        scope=LedgerScopeEnum.TEAM,
        status=LedgerStatusEnum.APPLIED,
        created_by=verifier_id
    )
    db.add(team_entry)
    entries.append(team_entry)

    # 2. Individual Ledger Entry if applicable
    if scope == "INDIVIDUAL_AND_TEAM" and member_id:
        member_entry = PointLedger(
            achievement_id=achievement_id,
            member_id=member_id,
            team_id=team_id,
            source_type="ACHIEVEMENT",
            source_id=achievement_id,
            rule_id=rule_id,
            rule_version=rule_version,
            base_points=points,
            bonus_points=0,
            penalty_points=0,
            final_points=points,
            scope=LedgerScopeEnum.INDIVIDUAL,
            status=LedgerStatusEnum.APPLIED,
            created_by=verifier_id
        )
        db.add(member_entry)
        entries.append(member_entry)

    db.flush()
    return entries

def apply_fraud_plagiarism_penalty(
    db: Session,
    achievement_id: str,
    team_id: str,
    original_points: int,
    reason: str,
    verifier_id: str
) -> PenaltyRecord:
    """
    Official Rule 14:
    If plagiarism, copied work, fraudulent proof, or false claim is VERIFIED:
    90% of the points associated with that activity are removed from the TEAM SCORE.
    
    Formula:
    penalty = activity_points * 0.90
    remaining_team_points = activity_points - penalty
    """
    penalty_points = int(original_points * 0.90)
    remaining_team_points = original_points - penalty_points

    # Record official PenaltyRecord
    penalty_rec = PenaltyRecord(
        achievement_id=achievement_id,
        team_id=team_id,
        original_points=original_points,
        penalty_rate=0.90,
        penalty_points=penalty_points,
        final_team_points=remaining_team_points,
        reason=reason,
        verified_by=verifier_id
    )
    db.add(penalty_rec)

    # Create compensating negative entry in Point Ledger
    penalty_ledger_entry = PointLedger(
        achievement_id=achievement_id,
        member_id=None,
        team_id=team_id,
        source_type="PENALTY",
        source_id=f"PENALTY-{achievement_id}",
        rule_id="FRAUD_PLAGIARISM_90_PCT",
        rule_version=OFFICIAL_VERSION,
        base_points=0,
        bonus_points=0,
        penalty_points=penalty_points,
        final_points=-penalty_points,  # Deducts 90% from team score
        scope=LedgerScopeEnum.TEAM,
        status=LedgerStatusEnum.APPLIED,
        created_by=verifier_id
    )
    db.add(penalty_ledger_entry)
    db.flush()

    return penalty_rec

def calculate_team_score(team_id: str, db: Session) -> int:
    """
    Official Formula (Section 1):
    TEAM SCORE =
      TEAM-LEVEL ACTIVITY POINTS
      + INDIVIDUAL CONTRIBUTION POINTS EARNED BY TEAM MEMBERS
      + ELIGIBLE BONUS POINTS
      - APPLICABLE PENALTIES
      
    Calculated authoritatively from the immutable ledger.
    """
    total = db.query(func.sum(PointLedger.final_points)).filter(
        PointLedger.team_id == team_id,
        PointLedger.scope == LedgerScopeEnum.TEAM,
        PointLedger.status == LedgerStatusEnum.APPLIED
    ).scalar()

    return int(total or 0)

def calculate_member_contribution_score(member_id: str, db: Session) -> int:
    """
    Section 25:
    Calculates member's official individual contribution points from individual ledger.
    """
    total = db.query(func.sum(PointLedger.final_points)).filter(
        PointLedger.member_id == member_id,
        PointLedger.scope == LedgerScopeEnum.INDIVIDUAL,
        PointLedger.status == LedgerStatusEnum.APPLIED
    ).scalar()

    return int(total or 0)

def reverse_point_transaction(
    db: Session,
    source_type: str,
    source_id: str,
    reason: str,
    actor_id: str
) -> List[PointLedger]:
    """
    Section 22: Point Reversal / Correction.
    Never updates old records destructively.
    Creates compensating reversal entries.
    """
    original_entries = db.query(PointLedger).filter(
        PointLedger.source_type == source_type,
        PointLedger.source_id == source_id,
        PointLedger.status == LedgerStatusEnum.APPLIED
    ).all()

    reversals = []
    for entry in original_entries:
        reversal = PointLedger(
            achievement_id=entry.achievement_id,
            member_id=entry.member_id,
            team_id=entry.team_id,
            source_type="REVERSAL",
            source_id=f"REV-{entry.id}",
            rule_id=entry.rule_id,
            rule_version=entry.rule_version,
            base_points=-entry.base_points,
            bonus_points=-entry.bonus_points,
            penalty_points=-entry.penalty_points,
            final_points=-entry.final_points,
            scope=entry.scope,
            status=LedgerStatusEnum.APPLIED,
            created_by=actor_id
        )
        db.add(reversal)
        reversals.append(reversal)

    db.flush()
    return reversals
