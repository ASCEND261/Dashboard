import os
import hashlib
from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models.user import User, RoleEnum, Department, Team, SprintTrackEnum
from app.models.rule import PointRuleVersion, PointRule
from app.models.achievement import (
    AchievementCategory,
    Achievement,
    AchievementProof,
    VerificationRecord,
    PointCalculation,
    AchievementStatusEnum,
    VerificationDecisionEnum
)
from app.models.audit import AuditLog
from app.models.integration import IntegrationEvent, SyncStatusEnum
from app.models.ledger import PointLedger, LedgerScopeEnum, LedgerStatusEnum
from app.models.meetup import MeetupAttendance
from app.models.penalty import PenaltyRecord
from app.services.auth_service import get_password_hash
from app.services.audit_service import record_audit_event
from app.config import settings

def seed_database():
    print("Re-initializing tables for Official Tech Sprint Journey 2026 Scoring System...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    os.makedirs(settings.STORAGE_DIR, exist_ok=True)

    try:
        print("Seeding Departments...")
        cse = Department(id="dept-cse", name="Computer Science & Engineering", code="CSE")
        ece = Department(id="dept-ece", name="Electronics & Communication", code="ECE")
        aids = Department(id="dept-aids", name="Artificial Intelligence & Data Science", code="AIDS")
        mech = Department(id="dept-mech", name="Mechanical Engineering", code="MECH")
        db.add_all([cse, ece, aids, mech])
        db.flush()

        print("Seeding Teams...")
        teams = [
            Team(id="ASCEND", name="ASCEND", department_id=cse.id),
            Team(id="NOVA", name="Team Nova", department_id=ece.id),
            Team(id="TITANS", name="Titans", department_id=aids.id),
            Team(id="VORTEX", name="Vortex", department_id=mech.id),
            Team(id="APEX", name="Apex Squad", department_id=cse.id),
        ]
        db.add_all(teams)
        db.flush()

        print("Seeding Users with Official Sprint Tracks...")
        pwd = get_password_hash("ascend2026")

        # Official Demo Personas
        member_maya = User(
            id="usr-member-1",
            name="Maya Lin",
            email="maya@ascend.team",
            hashed_password=pwd,
            role=RoleEnum.MEMBER,
            sprint_track=SprintTrackEnum.CODE_TRACK,
            department_id=cse.id,
            team_id="ASCEND"
        )
        core_alex = User(
            id="usr-core-1",
            name="Alex Chen",
            email="alex@ascend.team",
            hashed_password=pwd,
            role=RoleEnum.CORE_MEMBER,
            sprint_track=SprintTrackEnum.OPEN_SOURCE_TRACK,
            department_id=cse.id,
            team_id="ASCEND"
        )
        admin_sarah = User(
            id="usr-admin-1",
            name="Dr. Sarah Vance",
            email="sarah@ascend.team",
            hashed_password=pwd,
            role=RoleEnum.ADMIN,
            sprint_track=SprintTrackEnum.BUILD_TRACK,
            department_id=cse.id,
            team_id="ASCEND"
        )
        member_rohan = User(
            id="usr-member-2",
            name="Rohan Patel",
            email="rohan@ascend.team",
            hashed_password=pwd,
            role=RoleEnum.MEMBER,
            sprint_track=SprintTrackEnum.BUILD_TRACK,
            department_id=cse.id,
            team_id="ASCEND"
        )
        member_elena = User(
            id="usr-member-3",
            name="Elena Rostova",
            email="elena@ascend.team",
            hashed_password=pwd,
            role=RoleEnum.MEMBER,
            sprint_track=SprintTrackEnum.PITCH_TRACK,
            department_id=aids.id,
            team_id="ASCEND"
        )
        user_test = User(
            id="usr-test-1",
            name="Test Member (Seed)",
            email="test@ascend.team",
            hashed_password=pwd,
            role=RoleEnum.MEMBER,
            sprint_track=SprintTrackEnum.CODE_TRACK,
            department_id=cse.id,
            team_id="ASCEND"
        )
        db.add_all([member_maya, core_alex, admin_sarah, member_rohan, member_elena, user_test])
        db.flush()

        print("Seeding Official Tech Sprint Journey Categories...")
        categories = [
            AchievementCategory(
                id="cat-hackathon",
                slug="hackathon",
                name="External Hackathon",
                description="Competitive hackathons. 1st: 50, 2nd: 30, 3rd: 20, Participation: 10",
                icon="Trophy",
                required_fields=[
                    {"name": "event_name", "label": "Event Name", "type": "text", "required": True, "placeholder": "e.g., HackZurich 2026"},
                    {"name": "organization", "label": "Organizing Body", "type": "text", "required": True, "placeholder": "e.g., ETH Zurich"},
                    {"name": "result", "label": "Placement Result", "type": "select", "required": True, "options": ["1st Place", "2nd Place", "3rd Place", "Participation"]},
                    {"name": "project_repo", "label": "Project Repository / Demo Link", "type": "url", "required": False}
                ]
            ),
            AchievementCategory(
                id="cat-weekly",
                slug="weekly_challenge",
                name="Weekly Challenge",
                description="Official weekly sprint challenge. Winner: 30, Runner-up: 15, Participation: 5",
                icon="Flame",
                required_fields=[
                    {"name": "challenge_id", "label": "Challenge Name / ID", "type": "text", "required": True, "placeholder": "e.g., Sprint Week 03 Challenge"},
                    {"name": "organization", "label": "Admin Review Body", "type": "text", "required": True, "placeholder": "Core Tech Council"},
                    {"name": "result", "label": "Award Placement", "type": "select", "required": True, "options": ["Winner", "Runner-up", "Participation"]}
                ]
            ),
            AchievementCategory(
                id="cat-project",
                slug="project",
                name="Society Project",
                description="Official society engineering projects. Basic: 10, Intermediate: 20, Advanced: 30",
                icon="Code",
                required_fields=[
                    {"name": "event_name", "label": "Project Name", "type": "text", "required": True, "placeholder": "e.g., ASCEND Gateway Engine"},
                    {"name": "organization", "label": "Host Society / Unit", "type": "text", "required": True, "placeholder": "e.g., Tech Society"},
                    {"name": "result", "label": "Project Evaluation Tier", "type": "select", "required": True, "options": ["Basic", "Intermediate", "Advanced"]},
                    {"name": "role", "label": "Your Technical Role", "type": "text", "required": True, "placeholder": "e.g., Backend Lead"}
                ]
            ),
            AchievementCategory(
                id="cat-oss",
                slug="open_source",
                name="Open Source",
                description="PR Raised: 10, PR Merged External: 20, PR Merged Society Repo: 25",
                icon="GitPullRequest",
                required_fields=[
                    {"name": "event_name", "label": "Repository Name", "type": "text", "required": True, "placeholder": "e.g., fastapi/fastapi"},
                    {"name": "repository_type", "label": "Repository Type", "type": "select", "required": True, "options": ["External Public Repository", "Society Repository"]},
                    {"name": "pull_request_status", "label": "Pull Request Status", "type": "select", "required": True, "options": ["PR Raised", "PR Merged"]},
                    {"name": "result", "label": "Classification Tier", "type": "select", "required": True, "options": ["PR Raised", "PR Merged in External Public Repository", "PR Merged in Society Repository"]},
                    {"name": "pr_url", "label": "Pull Request URL", "type": "url", "required": True}
                ]
            ),
            AchievementCategory(
                id="cat-dsa",
                slug="dsa",
                name="DSA Streak",
                description="Continuous competitive programming streak. 7-Day: 20 pts, Monthly: 100 pts (Individual + Team)",
                icon="Award",
                required_fields=[
                    {"name": "event_name", "label": "Platform", "type": "text", "required": True, "placeholder": "e.g., LeetCode / Codeforces"},
                    {"name": "organization", "label": "Verification Platform", "type": "text", "required": True, "placeholder": "e.g., LeetCode Daily Challenge"},
                    {"name": "result", "label": "Streak Duration", "type": "select", "required": True, "options": ["7-Day DSA Streak", "Monthly DSA Streak"]},
                    {"name": "profile_url", "label": "Public Profile URL", "type": "url", "required": True}
                ]
            ),
            AchievementCategory(
                id="cat-paper",
                slug="publication",
                name="Research Paper",
                description="Publication / Submission of technical research paper: 50 pts (Individual + Team)",
                icon="BookOpen",
                required_fields=[
                    {"name": "event_name", "label": "Paper Title", "type": "text", "required": True},
                    {"name": "organization", "label": "Publisher / Journal / Conference", "type": "text", "required": True},
                    {"name": "result", "label": "Status", "type": "select", "required": True, "options": ["Publication / Submission"]},
                    {"name": "doi", "label": "DOI / Paper Link", "type": "text", "required": False}
                ]
            ),
            AchievementCategory(
                id="cat-talk",
                slug="tech_talk",
                name="Tech Talk",
                description="Delivery of technical keynote or workshop: 15 pts (Individual + Team)",
                icon="Users",
                required_fields=[
                    {"name": "event_name", "label": "Talk Title", "type": "text", "required": True},
                    {"name": "organization", "label": "Host Body / Venue", "type": "text", "required": True},
                    {"name": "result", "label": "Delivery Status", "type": "select", "required": True, "options": ["Tech Talk Delivery"]}
                ]
            ),
            AchievementCategory(
                id="cat-blog",
                slug="blog",
                name="Blog / Article",
                description="Technical publication on Medium / Substack / Dev.to: 10 pts (Individual + Team)",
                icon="FileText",
                required_fields=[
                    {"name": "event_name", "label": "Article Title", "type": "text", "required": True},
                    {"name": "organization", "label": "Publication Platform", "type": "text", "required": True},
                    {"name": "result", "label": "Status", "type": "select", "required": True, "options": ["Blog / Article Publication"]},
                    {"name": "article_url", "label": "Public Article URL", "type": "url", "required": True}
                ]
            ),
            AchievementCategory(
                id="cat-event",
                slug="external_event",
                name="External Event",
                description="Attendance / Participation in approved technical event: 10 pts (Individual + Team)",
                icon="Compass",
                required_fields=[
                    {"name": "event_name", "label": "Event Name", "type": "text", "required": True},
                    {"name": "organization", "label": "Organizer", "type": "text", "required": True},
                    {"name": "result", "label": "Participation", "type": "select", "required": True, "options": ["External Event Participation"]}
                ]
            ),
            AchievementCategory(
                id="cat-track",
                slug="sprint_track",
                name="Sprint Track Scoring",
                description="Track scoring: Winner 25, Runner-up 15, Participation 8, Full Track Streak 30 (Individual + Team)",
                icon="Trophy",
                required_fields=[
                    {"name": "event_name", "label": "Sprint Track Session", "type": "text", "required": True},
                    {"name": "organization", "label": "Tech Sprint Committee", "type": "text", "required": True},
                    {"name": "result", "label": "Result Tier", "type": "select", "required": True, "options": ["Winner", "Runner-up", "Participation", "Full Track Streak"]}
                ]
            ),
            AchievementCategory(
                id="cat-final",
                slug="final_project",
                name="Final / Major Project",
                description="End of sprint capstone evaluation. Winner: 250, Runner-up: 100, Other: 50",
                icon="Award",
                required_fields=[
                    {"name": "event_name", "label": "Final Project Title", "type": "text", "required": True},
                    {"name": "organization", "label": "Judging Panel", "type": "text", "required": True},
                    {"name": "result", "label": "Final Standing", "type": "select", "required": True, "options": ["Winner", "Runner-up", "Other Participating Team"]}
                ]
            )
        ]
        db.add_all(categories)
        db.flush()

        print("Seeding Official Rulebook: TSJ-2026-v1...")
        version = PointRuleVersion(
            id="TSJ-2026-v1",
            name="Tech Sprint Journey 2026 — Official Points & Scoring System",
            description="The official single source of truth for cohort scoring.",
            effective_from=datetime(2026, 1, 1),
            is_active=True
        )
        db.add(version)
        db.flush()

        official_rules = [
            # 2.1 Bi-Weekly Meetup Attendance (5 per member present)
            PointRule(id="RULE-MEETUP-ATTENDANCE", rule_code="MEETUP_ATTENDANCE", version_id=version.id, category_slug="meetup", condition_key="result", condition_val="Attendance", points=5, scope="TEAM", activity_type="TEAM_ACTIVITY", description="5 points per team member present at verified bi-weekly meetup"),
            
            # 2.2 Weekly Challenge (Winner: 30, Runner-up: 15, Participation: 5)
            PointRule(id="RULE-WEEKLY-WINNER", rule_code="WEEKLY_CHALLENGE_WINNER", version_id=version.id, category_slug="weekly_challenge", condition_key="result", condition_val="Winner", points=30, scope="TEAM", activity_type="TEAM_ACTIVITY", description="Weekly Challenge Winner: 30 points awarded to team"),
            PointRule(id="RULE-WEEKLY-RUNNER-UP", rule_code="WEEKLY_CHALLENGE_RUNNER_UP", version_id=version.id, category_slug="weekly_challenge", condition_key="result", condition_val="Runner-up", points=15, scope="TEAM", activity_type="TEAM_ACTIVITY", description="Weekly Challenge Runner-up: 15 points awarded to team"),
            PointRule(id="RULE-WEEKLY-PARTICIPATION", rule_code="WEEKLY_CHALLENGE_PARTICIPATION", version_id=version.id, category_slug="weekly_challenge", condition_key="result", condition_val="Participation", points=5, scope="TEAM", activity_type="TEAM_ACTIVITY", description="Weekly Challenge Participation: 5 points awarded to team"),

            # 2.3 Society Project (Basic: 10, Intermediate: 20, Advanced: 30)
            PointRule(id="RULE-SOCIETY-BASIC", rule_code="SOCIETY_PROJECT_BASIC", version_id=version.id, category_slug="project", condition_key="result", condition_val="Basic", points=10, scope="TEAM", activity_type="TEAM_ACTIVITY", description="Society Project Basic tier: 10 points"),
            PointRule(id="RULE-SOCIETY-INTERMEDIATE", rule_code="SOCIETY_PROJECT_INTERMEDIATE", version_id=version.id, category_slug="project", condition_key="result", condition_val="Intermediate", points=20, scope="TEAM", activity_type="TEAM_ACTIVITY", description="Society Project Intermediate tier: 20 points"),
            PointRule(id="RULE-SOCIETY-ADVANCED", rule_code="SOCIETY_PROJECT_ADVANCED", version_id=version.id, category_slug="project", condition_key="result", condition_val="Advanced", points=30, scope="TEAM", activity_type="TEAM_ACTIVITY", description="Society Project Advanced tier: 30 points"),

            # 2.4 External Hackathon (1st: 50, 2nd: 30, 3rd: 20, Participation: 10)
            PointRule(id="RULE-HACK-1ST", rule_code="EXTERNAL_HACKATHON_1ST", version_id=version.id, category_slug="hackathon", condition_key="result", condition_val="1st Place", points=50, scope="TEAM", activity_type="TEAM_ACTIVITY", description="External Hackathon 1st Place: 50 points"),
            PointRule(id="RULE-HACK-2ND", rule_code="EXTERNAL_HACKATHON_2ND", version_id=version.id, category_slug="hackathon", condition_key="result", condition_val="2nd Place", points=30, scope="TEAM", activity_type="TEAM_ACTIVITY", description="External Hackathon 2nd Place: 30 points"),
            PointRule(id="RULE-HACK-3RD", rule_code="EXTERNAL_HACKATHON_3RD", version_id=version.id, category_slug="hackathon", condition_key="result", condition_val="3rd Place", points=20, scope="TEAM", activity_type="TEAM_ACTIVITY", description="External Hackathon 3rd Place: 20 points"),
            PointRule(id="RULE-HACK-PARTICIPATION", rule_code="EXTERNAL_HACKATHON_PARTICIPATION", version_id=version.id, category_slug="hackathon", condition_key="result", condition_val="Participation", points=10, scope="TEAM", activity_type="TEAM_ACTIVITY", description="External Hackathon Participation: 10 points"),

            # 2.5 Open Source (PR Raised: 10, PR Merged External: 20, PR Merged Society: 25)
            PointRule(id="RULE-OSS-RAISED", rule_code="OPEN_SOURCE_PR_RAISED", version_id=version.id, category_slug="open_source", condition_key="result", condition_val="PR Raised", points=10, scope="TEAM", activity_type="TEAM_ACTIVITY", description="Open Source PR Raised: 10 points"),
            PointRule(id="RULE-OSS-MERGED-EXT", rule_code="OPEN_SOURCE_PR_MERGED_EXTERNAL", version_id=version.id, category_slug="open_source", condition_key="result", condition_val="PR Merged in External Public Repository", points=20, scope="TEAM", activity_type="TEAM_ACTIVITY", description="PR Merged in External Public Repository: 20 points"),
            PointRule(id="RULE-OSS-MERGED-SOC", rule_code="OPEN_SOURCE_PR_MERGED_SOCIETY", version_id=version.id, category_slug="open_source", condition_key="result", condition_val="PR Merged in Society Repository", points=25, scope="TEAM", activity_type="TEAM_ACTIVITY", description="PR Merged in Society Repository: 25 points"),

            # 2.6 Final / Major Project (Winner: 250, Runner-up: 100, Other: 50)
            PointRule(id="RULE-FINAL-WINNER", rule_code="FINAL_PROJECT_WINNER", version_id=version.id, category_slug="final_project", condition_key="result", condition_val="Winner", points=250, scope="TEAM", activity_type="TEAM_ACTIVITY", description="Final Project Winner: 250 points"),
            PointRule(id="RULE-FINAL-RUNNER-UP", rule_code="FINAL_PROJECT_RUNNER_UP", version_id=version.id, category_slug="final_project", condition_key="result", condition_val="Runner-up", points=100, scope="TEAM", activity_type="TEAM_ACTIVITY", description="Final Project Runner-up: 100 points"),
            PointRule(id="RULE-FINAL-PARTICIPATING", rule_code="FINAL_PROJECT_PARTICIPATING", version_id=version.id, category_slug="final_project", condition_key="result", condition_val="Other Participating Team", points=50, scope="TEAM", activity_type="TEAM_ACTIVITY", description="Final Project Other Participating Team: 50 points"),

            # 3.1 DSA Streak (7-day: 20, Monthly: 100) -> INDIVIDUAL + TEAM
            PointRule(id="RULE-DSA-7-DAY", rule_code="DSA_7_DAY_STREAK", version_id=version.id, category_slug="dsa", condition_key="result", condition_val="7-Day DSA Streak", points=20, scope="INDIVIDUAL_AND_TEAM", activity_type="INDIVIDUAL_CONTRIBUTION", description="7-Day DSA Streak: +20 Individual, +20 Team"),
            PointRule(id="RULE-DSA-MONTHLY", rule_code="DSA_MONTHLY_STREAK", version_id=version.id, category_slug="dsa", condition_key="result", condition_val="Monthly DSA Streak", points=100, scope="INDIVIDUAL_AND_TEAM", activity_type="INDIVIDUAL_CONTRIBUTION", description="Monthly DSA Streak: +100 Individual, +100 Team"),

            # 3.2 Research Paper (50) -> INDIVIDUAL + TEAM
            PointRule(id="RULE-RESEARCH-PAPER", rule_code="RESEARCH_PAPER", version_id=version.id, category_slug="publication", condition_key="result", condition_val="Publication / Submission", points=50, scope="INDIVIDUAL_AND_TEAM", activity_type="INDIVIDUAL_CONTRIBUTION", description="Research Paper Publication / Submission: +50 Individual, +50 Team"),

            # 3.3 Tech Talk (15) -> INDIVIDUAL + TEAM
            PointRule(id="RULE-TECH-TALK", rule_code="TECH_TALK", version_id=version.id, category_slug="tech_talk", condition_key="result", condition_val="Tech Talk Delivery", points=15, scope="INDIVIDUAL_AND_TEAM", activity_type="INDIVIDUAL_CONTRIBUTION", description="Tech Talk Delivery: +15 Individual, +15 Team"),

            # 3.4 Blog / Article (10) -> INDIVIDUAL + TEAM
            PointRule(id="RULE-BLOG-ARTICLE", rule_code="BLOG_ARTICLE", version_id=version.id, category_slug="blog", condition_key="result", condition_val="Blog / Article Publication", points=10, scope="INDIVIDUAL_AND_TEAM", activity_type="INDIVIDUAL_CONTRIBUTION", description="Blog / Article Publication: +10 Individual, +10 Team"),

            # 3.5 External Event (10) -> INDIVIDUAL + TEAM
            PointRule(id="RULE-EXTERNAL-EVENT", rule_code="EXTERNAL_EVENT", version_id=version.id, category_slug="external_event", condition_key="result", condition_val="External Event Participation", points=10, scope="INDIVIDUAL_AND_TEAM", activity_type="INDIVIDUAL_CONTRIBUTION", description="External Event Participation: +10 Individual, +10 Team"),

            # 5. Sprint Track Scoring (Winner: 25, Runner-up: 15, Participation: 8, Full Track Streak: 30) -> INDIVIDUAL + TEAM
            PointRule(id="RULE-SPRINT-WINNER", rule_code="SPRINT_WINNER", version_id=version.id, category_slug="sprint_track", condition_key="result", condition_val="Winner", points=25, scope="INDIVIDUAL_AND_TEAM", activity_type="SPRINT_TRACK", description="Sprint Track Winner: +25 Individual, +25 Team"),
            PointRule(id="RULE-SPRINT-RUNNER-UP", rule_code="SPRINT_RUNNER_UP", version_id=version.id, category_slug="sprint_track", condition_key="result", condition_val="Runner-up", points=15, scope="INDIVIDUAL_AND_TEAM", activity_type="SPRINT_TRACK", description="Sprint Track Runner-up: +15 Individual, +15 Team"),
            PointRule(id="RULE-SPRINT-PARTICIPATION", rule_code="SPRINT_PARTICIPATION", version_id=version.id, category_slug="sprint_track", condition_key="result", condition_val="Participation", points=8, scope="INDIVIDUAL_AND_TEAM", activity_type="SPRINT_TRACK", description="Sprint Track Participation: +8 Individual, +8 Team"),
            PointRule(id="RULE-FULL-TRACK-STREAK", rule_code="FULL_TRACK_STREAK", version_id=version.id, category_slug="sprint_track", condition_key="result", condition_val="Full Track Streak", points=30, scope="INDIVIDUAL_AND_TEAM", activity_type="SPRINT_TRACK", description="Full Track Streak One-Time Bonus: +30 Individual, +30 Team"),
        ]
        db.add_all(official_rules)
        db.flush()

        def create_dummy_file(filename: str) -> str:
            full = os.path.join(settings.STORAGE_DIR, filename)
            if not os.path.exists(full):
                with open(full, "wb") as f:
                    f.write(b"%PDF-1.4\n%Official ASCEND Verified Proof Document\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\nxref\n0 2\n0000000000 65535 f\n0000000010 00000 n\ntrailer<</Size 2/Root 1 0 R>>\nstartxref\n70\n%%EOF")
            return full

        print("Seeding 47 Official Verified Achievements for Team ASCEND totaling exactly 1,420 points...")
        # 47 items strictly drawn from official TSJ-2026-v1 rules:
        # Sum must equal exactly 1,420:
        # Let's craft an exact distribution:
        # 4 x 50 (External Hackathon 1st Place / Research Paper) = 200
        # 6 x 30 (External Hackathon 2nd Place / Weekly Challenge Winner / Society Advanced / Full Track Streak) = 180 (380)
        # 8 x 25 (PR Merged Society Repo / Sprint Winner) = 200 (580)
        # 10 x 20 (External Hackathon 3rd Place / Society Intermediate / PR Merged External / 7-Day DSA Streak) = 200 (780)
        # 8 x 15 (Weekly Challenge Runner-up / Tech Talk / Sprint Runner-up) = 120 (900)
        # 11 x 10 (External Hackathon Participation / Society Basic / PR Raised / Blog / External Event) = 110 (1010)
        # Total items so far: 4 + 6 + 8 + 10 + 8 + 11 = 47 items. Sum = 1010.
        # We need 47 items totaling 1420 points (diff = 410).
        # We have official points:
        # 2 x 100 (DSA Monthly Streak): +200 - 2 items of 10 replaced with 100 (+180 pts) -> sum = 1190.
        # 1 x 250 (Final Project Winner): +250 - 1 item of 10 replaced with 250 (+240 pts) -> sum = 1430 (10 too high).
        # Replace one 20 with 10 (-10 pts) -> sum = 1420! Total items = 47!
        # Let's verify:
        # - 1 x 250 (Final Project Winner) = 250
        # - 2 x 100 (Monthly DSA Streak) = 200  [total 450, 3 items]
        # - 4 x 50 (Hackathon 1st / Research Paper) = 200 [total 650, 7 items]
        # - 6 x 30 (Hackathon 2nd / Weekly Winner / Society Advanced) = 180 [total 830, 13 items]
        # - 8 x 25 (PR Merged Society Repo / Sprint Winner) = 200 [total 1030, 21 items]
        # - 9 x 20 (Hackathon 3rd / Society Intermed / PR Merged Ext / 7-Day DSA) = 180 [total 1210, 30 items]
        # - 8 x 15 (Weekly Runner-up / Tech Talk / Sprint Runner-up) = 120 [total 1330, 38 items]
        # - 9 x 10 (Hackathon Part / Society Basic / PR Raised / Blog / External Event) = 90 [total 1420, 47 items]
        # Let's check:
        # 1 + 2 + 4 + 6 + 8 + 9 + 8 + 9 = 47 items!
        # 250 + 200 + 200 + 180 + 200 + 180 + 120 + 90 = 1420 points!
        # Exactly 47 items and exactly 1,420 points.

        official_47_distribution = [
            # 250 pts (1 item)
            ("final_project", "FINAL_PROJECT_WINNER", "Winner", 250, "TEAM", "Tech Sprint Capstone — 1st Place Grand Winner"),
            # 100 pts (2 items)
            ("dsa", "DSA_MONTHLY_STREAK", "Monthly DSA Streak", 100, "INDIVIDUAL_AND_TEAM", "Monthly DSA Problem Solving Streak"),
            ("dsa", "DSA_MONTHLY_STREAK", "Monthly DSA Streak", 100, "INDIVIDUAL_AND_TEAM", "Continuous 30-Day Algorithm Mastery"),
            # 50 pts (4 items)
            ("hackathon", "EXTERNAL_HACKATHON_1ST", "1st Place", 50, "TEAM", "MIT HackTech Global — 1st Place Division"),
            ("hackathon", "EXTERNAL_HACKATHON_1ST", "1st Place", 50, "TEAM", "ETHLisbon Hackathon — 1st Place Web3"),
            ("publication", "RESEARCH_PAPER", "Publication / Submission", 50, "INDIVIDUAL_AND_TEAM", "IEEE Distributed Consensus Architecture Paper"),
            ("publication", "RESEARCH_PAPER", "Publication / Submission", 50, "INDIVIDUAL_AND_TEAM", "ACM Dependable Systems Research Publication"),
            # 30 pts (6 items)
            ("hackathon", "EXTERNAL_HACKATHON_2ND", "2nd Place", 30, "TEAM", "HackZurich AI Track — 2nd Place Runner-Up"),
            ("hackathon", "EXTERNAL_HACKATHON_2ND", "2nd Place", 30, "TEAM", "Stanford TreeHacks Security — 2nd Place"),
            ("weekly_challenge", "WEEKLY_CHALLENGE_WINNER", "Winner", 30, "TEAM", "Weekly Sprint Challenge 01 — 1st Place"),
            ("weekly_challenge", "WEEKLY_CHALLENGE_WINNER", "Winner", 30, "TEAM", "Weekly Sprint Challenge 04 — 1st Place"),
            ("project", "SOCIETY_PROJECT_ADVANCED", "Advanced", 30, "TEAM", "ASCEND Gateway Core Service — Advanced Tier"),
            ("sprint_track", "FULL_TRACK_STREAK", "Full Track Streak", 30, "INDIVIDUAL_AND_TEAM", "Full Track Consistency Bonus Achievement"),
            # 25 pts (8 items)
            ("open_source", "OPEN_SOURCE_PR_MERGED_SOCIETY", "PR Merged in Society Repository", 25, "TEAM", "Society Repo Pull Request Merged #01"),
            ("open_source", "OPEN_SOURCE_PR_MERGED_SOCIETY", "PR Merged in Society Repository", 25, "TEAM", "Society Repo Pull Request Merged #02"),
            ("open_source", "OPEN_SOURCE_PR_MERGED_SOCIETY", "PR Merged in Society Repository", 25, "TEAM", "Society Repo Pull Request Merged #03"),
            ("open_source", "OPEN_SOURCE_PR_MERGED_SOCIETY", "PR Merged in Society Repository", 25, "TEAM", "Society Repo Pull Request Merged #04"),
            ("sprint_track", "SPRINT_WINNER", "Winner", 25, "INDIVIDUAL_AND_TEAM", "Code Track Sprint Session — Winner"),
            ("sprint_track", "SPRINT_WINNER", "Winner", 25, "INDIVIDUAL_AND_TEAM", "Build Track Sprint Session — Winner"),
            ("sprint_track", "SPRINT_WINNER", "Winner", 25, "INDIVIDUAL_AND_TEAM", "Pitch Track Sprint Session — Winner"),
            ("sprint_track", "SPRINT_WINNER", "Winner", 25, "INDIVIDUAL_AND_TEAM", "Open Source Track Session — Winner"),
            # 20 pts (9 items)
            ("hackathon", "EXTERNAL_HACKATHON_3RD", "3rd Place", 20, "TEAM", "Harvard HackMIT Fintech — 3rd Place"),
            ("hackathon", "EXTERNAL_HACKATHON_3RD", "3rd Place", 20, "TEAM", "PennApps Systems Track — 3rd Place"),
            ("project", "SOCIETY_PROJECT_INTERMEDIATE", "Intermediate", 20, "TEAM", "Telemetry Ingestion Pipeline — Intermediate"),
            ("project", "SOCIETY_PROJECT_INTERMEDIATE", "Intermediate", 20, "TEAM", "Verification Queue Microservice — Intermediate"),
            ("open_source", "OPEN_SOURCE_PR_MERGED_EXTERNAL", "PR Merged in External Public Repository", 20, "TEAM", "FastAPI Core Repository Feature PR"),
            ("open_source", "OPEN_SOURCE_PR_MERGED_EXTERNAL", "PR Merged in External Public Repository", 20, "TEAM", "SQLAlchemy 2.0 Async Optimization PR"),
            ("dsa", "DSA_7_DAY_STREAK", "7-Day DSA Streak", 20, "INDIVIDUAL_AND_TEAM", "Verified 7-Day LeetCode Streak #01"),
            ("dsa", "DSA_7_DAY_STREAK", "7-Day DSA Streak", 20, "INDIVIDUAL_AND_TEAM", "Verified 7-Day LeetCode Streak #02"),
            ("dsa", "DSA_7_DAY_STREAK", "7-Day DSA Streak", 20, "INDIVIDUAL_AND_TEAM", "Verified 7-Day LeetCode Streak #03"),
            # 15 pts (8 items)
            ("weekly_challenge", "WEEKLY_CHALLENGE_RUNNER_UP", "Runner-up", 15, "TEAM", "Weekly Sprint Challenge 02 — Runner-up"),
            ("weekly_challenge", "WEEKLY_CHALLENGE_RUNNER_UP", "Runner-up", 15, "TEAM", "Weekly Sprint Challenge 05 — Runner-up"),
            ("tech_talk", "TECH_TALK", "Tech Talk Delivery", 15, "INDIVIDUAL_AND_TEAM", "Delivered Keynote: Zero Trust Architecture"),
            ("tech_talk", "TECH_TALK", "Tech Talk Delivery", 15, "INDIVIDUAL_AND_TEAM", "Delivered Workshop: Reactive Microfrontends"),
            ("tech_talk", "TECH_TALK", "Tech Talk Delivery", 15, "INDIVIDUAL_AND_TEAM", "Delivered Seminar: Asynchronous Database Engines"),
            ("sprint_track", "SPRINT_RUNNER_UP", "Runner-up", 15, "INDIVIDUAL_AND_TEAM", "Code Track Sprint — Runner-Up"),
            ("sprint_track", "SPRINT_RUNNER_UP", "Runner-up", 15, "INDIVIDUAL_AND_TEAM", "Build Track Sprint — Runner-Up"),
            ("sprint_track", "SPRINT_RUNNER_UP", "Runner-up", 15, "INDIVIDUAL_AND_TEAM", "Open Source Sprint — Runner-Up"),
            # 10 pts (9 items)
            ("hackathon", "EXTERNAL_HACKATHON_PARTICIPATION", "Participation", 10, "TEAM", "CalHacks 12.0 Participation Verification"),
            ("hackathon", "EXTERNAL_HACKATHON_PARTICIPATION", "Participation", 10, "TEAM", "HackTheNorth Participation Verification"),
            ("project", "SOCIETY_PROJECT_BASIC", "Basic", 10, "TEAM", "Basic Monitoring Healthcheck Utility"),
            ("open_source", "OPEN_SOURCE_PR_RAISED", "PR Raised", 10, "TEAM", "Open Source Architectural Proposal PR"),
            ("blog", "BLOG_ARTICLE", "Blog / Article Publication", 10, "INDIVIDUAL_AND_TEAM", "Published Article: Modern Distributed Ledgers"),
            ("blog", "BLOG_ARTICLE", "Blog / Article Publication", 10, "INDIVIDUAL_AND_TEAM", "Published Article: Real-Time Event Driven Architecture"),
            ("external_event", "EXTERNAL_EVENT", "External Event Participation", 10, "INDIVIDUAL_AND_TEAM", "Attended Cloud Native Distributed Systems Summit"),
            ("external_event", "EXTERNAL_EVENT", "External Event Participation", 10, "INDIVIDUAL_AND_TEAM", "Attended Global Cybersecurity Symposium"),
            ("external_event", "EXTERNAL_EVENT", "External Event Participation", 10, "INDIVIDUAL_AND_TEAM", "Attended ACM International Algorithms Forum"),
        ]

        assert len(official_47_distribution) == 47, f"Count is {len(official_47_distribution)}"
        total_seeded_points = sum(item[3] for item in official_47_distribution)
        assert total_seeded_points == 1420, f"Total points is {total_seeded_points}"
        print(f"Verified 47 official items configuration: exactly {total_seeded_points} points.")

        users_pool = [member_maya, member_rohan, member_elena]
        category_map = {c.slug: c for c in categories}

        ach_counter = 100
        for i, (cat_slug, rule_code, result_tier, points_val, scope_val, title_val) in enumerate(official_47_distribution):
            ach_counter += 1
            ach_id = f"ACH-2026-{ach_counter:05d}"
            u = users_pool[i % len(users_pool)]
            cat = category_map[cat_slug]

            days_ago = max(2, 60 - i)
            ach_date = (datetime.utcnow() - timedelta(days=days_ago)).strftime("%Y-%m-%d")

            meta = {
                "event_name": title_val.split(" — ")[0],
                "organization": "Official Tech Sprint Committee",
                "result": result_tier,
                "pull_request_status": "PR Merged" if "Merged" in result_tier else ("PR Raised" if "Raised" in result_tier else None),
                "repository_type": "Society Repository" if "Society" in result_tier else "External Public Repository"
            }

            ach = Achievement(
                id=ach_id,
                user_id=u.id,
                team_id="ASCEND",
                category_id=cat.id,
                title=title_val,
                description=f"Official verified record for {title_val} under Tech Sprint Journey 2026.",
                achievement_date=ach_date,
                metadata_json=meta,
                status=AchievementStatusEnum.VERIFIED,
                created_at=datetime.utcnow() - timedelta(days=days_ago, hours=2),
                updated_at=datetime.utcnow() - timedelta(days=days_ago)
            )
            db.add(ach)
            db.flush()

            # Proof file
            f_name = f"proof_{ach_id}.pdf"
            create_dummy_file(f_name)
            p_hash = hashlib.sha256(f"{ach_id}_official_proof".encode()).hexdigest()

            proof = AchievementProof(
                id=f"PRF-{ach_id}",
                achievement_id=ach.id,
                file_name=f_name,
                file_path=f_name,
                mime_type="application/pdf",
                file_size_bytes=1024,
                file_hash_sha256=p_hash,
                ai_extracted={
                    "extracted_name": u.name,
                    "extracted_organization": "Official Tech Sprint Committee",
                    "extracted_event": title_val.split(" — ")[0],
                    "extracted_achievement": result_tier,
                    "extracted_date": ach_date,
                    "certificate_id": f"TSJ-CERT-{ach_counter}",
                    "checks": {
                        "name_detected": True,
                        "event_detected": True,
                        "date_detected": True,
                        "achievement_detected": True,
                        "document_appears_readable": True,
                        "name_match": True
                    },
                    "flags": []
                },
                duplicate_check={
                    "is_duplicate_warning": False,
                    "similarity_pct": 0,
                    "matching_achievement_id": None,
                    "reason": "Clean official verification."
                },
                uploaded_at=ach.created_at
            )
            db.add(proof)

            # Rule match
            matched_rule = db.query(PointRule).filter(PointRule.rule_code == rule_code).first()
            rule_id = matched_rule.id if matched_rule else f"RULE-{rule_code}"

            # Point Calculation
            calc = PointCalculation(
                id=f"CALC-{ach.id}",
                achievement_id=ach.id,
                rule_id=rule_id,
                rule_version="TSJ-2026-v1",
                points=points_val,
                calculated_at=datetime.utcnow() - timedelta(days=days_ago)
            )
            db.add(calc)

            # Verification Record
            verif = VerificationRecord(
                id=f"VRF-{ach.id}",
                achievement_id=ach.id,
                verifier_id=core_alex.id,
                decision=VerificationDecisionEnum.VERIFIED,
                reason=f"Verified under official rule {rule_code} (TSJ-2026-v1).",
                rule_id_applied=rule_id,
                verified_at=datetime.utcnow() - timedelta(days=days_ago)
            )
            db.add(verif)

            # Point Ledger Dual Entry (Team + Individual if applicable)
            team_ledger_entry = PointLedger(
                id=f"LEDGER-TEAM-{ach.id}",
                achievement_id=ach.id,
                member_id=u.id,
                team_id="ASCEND",
                source_type="ACHIEVEMENT",
                source_id=ach.id,
                rule_id=rule_id,
                rule_version="TSJ-2026-v1",
                base_points=points_val,
                bonus_points=0,
                penalty_points=0,
                final_points=points_val,
                scope=LedgerScopeEnum.TEAM,
                status=LedgerStatusEnum.APPLIED,
                created_by=core_alex.id,
                created_at=datetime.utcnow() - timedelta(days=days_ago)
            )
            db.add(team_ledger_entry)

            if scope_val == "INDIVIDUAL_AND_TEAM":
                member_ledger_entry = PointLedger(
                    id=f"LEDGER-INDIV-{ach.id}",
                    achievement_id=ach.id,
                    member_id=u.id,
                    team_id="ASCEND",
                    source_type="ACHIEVEMENT",
                    source_id=ach.id,
                    rule_id=rule_id,
                    rule_version="TSJ-2026-v1",
                    base_points=points_val,
                    bonus_points=0,
                    penalty_points=0,
                    final_points=points_val,
                    scope=LedgerScopeEnum.INDIVIDUAL,
                    status=LedgerStatusEnum.APPLIED,
                    created_by=core_alex.id,
                    created_at=datetime.utcnow() - timedelta(days=days_ago)
                )
                db.add(member_ledger_entry)

            # Integration event
            int_event = IntegrationEvent(
                id=f"INT-{ach.id}",
                achievement_id=ach.id,
                sync_status=SyncStatusEnum.SYNCED if i < 35 else SyncStatusEnum.READY,
                attempt_count=1 if i < 35 else 0,
                last_attempt_at=datetime.utcnow() - timedelta(days=1) if i < 35 else None,
                external_reference_id=f"AARVAK-SYNC-ASCEND-{ach.id}-TSJ-2026-v1",
                payload={
                    "external_reference_id": f"AARVAK-SYNC-ASCEND-{ach.id}-TSJ-2026-v1",
                    "achievement_id": ach.id,
                    "team_id": "ASCEND",
                    "category": cat.slug,
                    "points": points_val,
                    "rule_version": "TSJ-2026-v1"
                }
            )
            db.add(int_event)

        print("Seeding 12 Pending Queue Submissions...")
        pending_samples = [
            ("hackathon", "EXTERNAL_HACKATHON_1ST", "1st Place", "HackSiliconValley 2026 — 1st Place", "Lead engineer building multi-agent consensus system.", member_maya, False, 0.0),
            ("hackathon", "EXTERNAL_HACKATHON_2ND", "2nd Place", "MIT Energy Hack 2026 — 2nd Place", "Built smart grid consumption forecasting model with LSTM.", member_rohan, False, 0.0),
            ("dsa", "DSA_7_DAY_STREAK", "7-Day DSA Streak", "LeetCode 7-Day Dynamic Programming Streak", "Solved 14 hard and medium problems in continuous 7-day streak.", member_maya, False, 0.0),
            ("project", "SOCIETY_PROJECT_ADVANCED", "Advanced", "Distributed Log Engine — Production Release", "High throughput WAL engine handling 50k ops/sec.", member_rohan, False, 0.0),
            ("publication", "RESEARCH_PAPER", "Publication / Submission", "IEEE Transactions on Dependable Systems Paper", "Primary student author on resilient distributed lock protocols.", member_elena, False, 0.0),
            ("open_source", "OPEN_SOURCE_PR_MERGED_SOCIETY", "PR Merged in Society Repository", "Society Gateway Core Middleware Optimization PR", "Contributed memory pooling patch reducing latency.", member_maya, False, 0.0),
            ("weekly_challenge", "WEEKLY_CHALLENGE_WINNER", "Winner", "Weekly Challenge 06: Algorithmic Optimization", "Placed 1st overall in dynamic benchmark test.", member_maya, False, 0.0),
            ("hackathon", "EXTERNAL_HACKATHON_3RD", "3rd Place", "Berkeley CalHacks 12.0 — 3rd Place", "Built real-time audio isolation device using Rust.", member_rohan, True, 88.0),
            ("tech_talk", "TECH_TALK", "Tech Talk Delivery", "Delivered 2-Hour Docker & Kubernetes Bootcamp", "Trained 60 junior engineering students on containerization.", member_elena, False, 0.0),
            ("blog", "BLOG_ARTICLE", "Blog / Article Publication", "Published Deep Dive on Raft Consensus Protocols", "Technical architectural guide on medium with 4.5k reads.", member_maya, False, 0.0),
            ("sprint_track", "SPRINT_WINNER", "Winner", "Code Track Bi-Weekly Sprint — 1st Place", "Achieved top score on sprint algorithmic bracket.", member_rohan, False, 0.0),
            ("external_event", "EXTERNAL_EVENT", "External Event Participation", "Attended Global Web Summit & Tech Expo", "Official participant in cloud architecture workshops.", member_elena, False, 0.0),
        ]

        for idx, (cat_slug, rule_code, res, title, desc, user_obj, is_dup, dup_score) in enumerate(pending_samples):
            ach_counter += 1
            ach_id = f"ACH-2026-{ach_counter:05d}"
            cat = category_map[cat_slug]

            ach = Achievement(
                id=ach_id,
                user_id=user_obj.id,
                team_id="ASCEND",
                category_id=cat.id,
                title=title,
                description=desc,
                achievement_date="2026-09-04",
                metadata_json={
                    "event_name": title.split(" — ")[0],
                    "organization": "Official Tech Sprint Committee",
                    "result": res,
                    "pull_request_status": "PR Merged" if "Merged" in res else None,
                    "repository_type": "Society Repository" if "Society" in res else "External Public Repository"
                },
                status=AchievementStatusEnum.SUBMITTED,
                created_at=datetime.utcnow() - timedelta(hours=idx * 2 + 1)
            )
            db.add(ach)
            db.flush()

            f_name = f"pending_proof_{ach_id}.pdf"
            create_dummy_file(f_name)

            proof = AchievementProof(
                id=f"PRF-{ach_id}",
                achievement_id=ach.id,
                file_name=f_name,
                file_path=f_name,
                mime_type="application/pdf",
                file_size_bytes=2048,
                file_hash_sha256=hashlib.sha256(f"{ach_id}_pending_proof".encode()).hexdigest(),
                ai_extracted={
                    "extracted_name": user_obj.name,
                    "extracted_organization": "Official Tech Sprint Committee",
                    "extracted_event": title.split(" — ")[0],
                    "extracted_achievement": res,
                    "extracted_date": "2026-09-04",
                    "certificate_id": f"TSJ-CERT-{ach_counter}",
                    "checks": {
                        "name_detected": True,
                        "event_detected": True,
                        "date_detected": True,
                        "achievement_detected": True,
                        "document_appears_readable": True,
                        "name_match": True
                    },
                    "flags": ["Duplicate similarity alert"] if is_dup else []
                },
                duplicate_check={
                    "is_duplicate_warning": is_dup,
                    "similarity_pct": dup_score,
                    "matching_achievement_id": "ACH-2026-00108" if is_dup else None,
                    "reason": "Similar event name and member submission detected." if is_dup else "Clean submission."
                },
                uploaded_at=ach.created_at
            )
            db.add(proof)

            record_audit_event(
                db=db,
                entity_type="ACHIEVEMENT",
                entity_id=ach.id,
                action="SUBMITTED",
                actor=user_obj,
                details={"category": cat.slug, "title": ach.title}
            )

        print("Seeding 3 'Needs More Proof' Submissions...")
        needs_proof_samples = [
            ("Hackathon Certificate Blurry", "The certificate uploaded is low-resolution and participant name is truncated. Please upload an official legible PDF.", member_maya),
            ("GitHub Pull Request Link Missing", "PR URL was not provided or repository is private. Please provide valid public verification link.", member_rohan),
            ("Society Project Documentation Incomplete", "Please attach architecture evaluation notes signed off by Tech Society leads.", member_elena)
        ]

        for idx, (title, feedback_reason, user_obj) in enumerate(needs_proof_samples):
            ach_counter += 1
            ach_id = f"ACH-2026-{ach_counter:05d}"
            cat = category_map["hackathon"] if idx == 0 else (category_map["open_source"] if idx == 1 else category_map["project"])

            ach = Achievement(
                id=ach_id,
                user_id=user_obj.id,
                team_id="ASCEND",
                category_id=cat.id,
                title=f"{title} — Verification Review",
                description="Submitted claim awaiting clearer documentation.",
                achievement_date="2026-09-01",
                metadata_json={"event_name": title, "organization": "Tech Org", "result": "Participation"},
                status=AchievementStatusEnum.NEEDS_MORE_PROOF,
                created_at=datetime.utcnow() - timedelta(days=2)
            )
            db.add(ach)
            db.flush()

            f_name = f"needs_proof_{ach_id}.pdf"
            create_dummy_file(f_name)
            proof = AchievementProof(
                id=f"PRF-{ach_id}",
                achievement_id=ach.id,
                file_name=f_name,
                file_path=f_name,
                mime_type="application/pdf",
                file_size_bytes=1024,
                file_hash_sha256=hashlib.sha256(f_name.encode()).hexdigest(),
                ai_extracted={"checks": {"document_appears_readable": False}, "flags": ["Low contrast document"]},
                duplicate_check={"is_duplicate_warning": False},
                uploaded_at=ach.created_at
            )
            db.add(proof)

            verif = VerificationRecord(
                id=f"VRF-{ach.id}",
                achievement_id=ach.id,
                verifier_id=core_alex.id,
                decision=VerificationDecisionEnum.NEEDS_MORE_PROOF,
                reason=feedback_reason,
                verified_at=datetime.utcnow() - timedelta(days=1)
            )
            db.add(verif)

            record_audit_event(
                db=db,
                entity_type="VERIFICATION",
                entity_id=ach.id,
                action="NEEDS_MORE_PROOF_REQUESTED",
                actor=core_alex,
                details={"reason": feedback_reason}
            )

        db.commit()
        print("Database re-seeded successfully with Official TECH SPRINT JOURNEY 2026 rulebook!")
        print("Rule Version: TSJ-2026-v1")
        print("Team ASCEND Verified Points: exactly 1,420 in both PointCalculation and PointLedger!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
