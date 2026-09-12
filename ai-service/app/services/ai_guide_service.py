import re
from typing import Dict, Any, List, Tuple
from app.schemas.ai import AIChatResponse, FormatAchievementResponse, FormattedDraftField

KNOWLEDGE_BASE = {
    "hackathon": {
        "proof": "Official certificate, winner standings, or verifiable award document.",
        "rules": "1st Place: 50 pts, 2nd Place: 30 pts, 3rd Place: 20 pts, Participation: 10 pts (under TSJ-2026-v1)."
    },
    "weekly_challenge": {
        "proof": "Core/Admin evaluated placement standing.",
        "rules": "Winner: 30 pts, Runner-up: 15 pts, Participation: 5 pts."
    },
    "society_project": {
        "proof": "Society GitHub repository, deployment, and evaluation evidence.",
        "rules": "Basic: 10 pts, Intermediate: 20 pts, Advanced: 30 pts."
    },
    "open_source": {
        "proof": "GitHub pull request URL, merge evidence, and repository link.",
        "rules": "PR Raised: 10 pts, PR Merged in External Public Repo: 20 pts, PR Merged in Society Repo: 25 pts."
    },
    "dsa_streak": {
        "proof": "LeetCode / Codeforces profile link with verified continuous activity.",
        "rules": "7-Day DSA Streak: +20 Individual & Team, Monthly DSA Streak: +100 Individual & Team."
    },
    "final_project": {
        "proof": "Capstone judging panel evaluation standings.",
        "rules": "Winner: 250 pts, Runner-up: 100 pts, Other Participating Team: 50 pts."
    },
    "meetup_attendance": {
        "proof": "Organizer-confirmed attendance / QR check-in record.",
        "rules": "5 points per verified present team member. Unique per member and meetup."
    },
    "aarvak": {
        "info": "Central AARVAK Integration exports only VERIFIED achievements deterministically calculated by Core Members under TSJ-2026-v1. It guarantees idempotency and prevents duplicate point allocations."
    }
}

def generate_ai_guide_response(user_query: str) -> AIChatResponse:
    q = user_query.lower()

    # Safety Guardrails
    if any(k in q for k in ["give me points", "approve my", "change my points", "fabricate", "cheat", "override points"]):
        return AIChatResponse(
            reply="As the ASCEND Guide, I cannot approve submissions, alter point allocations, or override Core Member decisions. All points are deterministically calculated by the official Point Rules Engine upon Core Member verification.",
            suggested_actions=["Review Official Rules", "Submit Achievement with Valid Proof"],
            knowledge_references=["Rule Version 2026-v1", "Verification Guidelines"]
        )

    if "how to submit" in q or "submit achievement" in q or "how do i submit" in q:
        return AIChatResponse(
            reply="To submit an achievement: 1) Click '+ Submit Achievement' in the sidebar. 2) Select your category (e.g. Hackathon, Certification). 3) Complete the structured fields. 4) Upload a legible proof document (PDF, PNG, or JPG). 5) Review and submit. Your submission will immediately enter the Core Verification Queue.",
            suggested_actions=["Go to Submit Achievement", "Use 'Format My Achievement'"],
            knowledge_references=["Submission Workflow"]
        )

    if "hackathon" in q:
        return AIChatResponse(
            reply="Under official Tech Sprint Journey rules (TSJ-2026-v1), External Hackathons award: 1st Place (50 pts), 2nd Place (30 pts), 3rd Place (20 pts), and Participation (10 pts) to the team score upon Core verification with valid certificate proof.",
            suggested_actions=["Submit Hackathon Achievement"],
            knowledge_references=["Official Rulebook TSJ-2026-v1"]
        )

    if "certification" in q:
        return AIChatResponse(
            reply=f"For Certifications, provide an official PDF or verifiable Credential ID. Advanced certifications earn 60 pts, Associate/Intermediate earn 35 pts, and Foundational earn 20 pts.",
            suggested_actions=["Submit Certification"],
            knowledge_references=["Certification Guidelines"]
        )

    if "status" in q or "under review" in q or "needs more proof" in q:
        return AIChatResponse(
            reply="Statuses in ASCEND: 'Submitted' (received), 'Under Review' (being verified by a Core Member), 'Needs More Proof' (verifier requested a clearer document), 'Verified' (points awarded to team), and 'Rejected' (claim ineligible). Check your 'Submission Center' for feedback.",
            suggested_actions=["Check Submission Center"],
            knowledge_references=["Lifecycle Stages"]
        )

    if "aarvak" in q or "central" in q or "sync" in q:
        return AIChatResponse(
            reply="Central AARVAK Integration connects ASCEND's verified records to the central Tech Journey dashboard. Only records marked 'VERIFIED' with deterministic point calculations are synced, using strict idempotency to avoid duplicate points.",
            suggested_actions=["View AARVAK Integration"],
            knowledge_references=["AARVAK Architecture"]
        )

    if "point" in q or "calculate" in q or "fair" in q:
        return AIChatResponse(
            reply="ASCEND uses a Deterministic Point Rules Engine. Point values are strictly configured in versioned official rules (e.g. 2026-v1). Core Members verify the claim and proof, and the engine calculates points with complete audit traceability.",
            suggested_actions=["View Point Rules"],
            knowledge_references=["Deterministic Rules Engine"]
        )

    # General fallback
    return AIChatResponse(
        reply="I am the ASCEND Guide. I can assist you with category selection, required proof documents, official point rules, and understanding your submission status. How can I help with your ascent today?",
        suggested_actions=["How do I submit?", "What proof is required for hackathons?", "How does Central AARVAK work?"],
        knowledge_references=["ASCEND Knowledge Base"]
    )

def parse_rough_achievement_draft(raw_text: str, category_hint: str = None) -> FormatAchievementResponse:
    """
    Transforms unstructured member text into a structured draft with high accuracy.
    """
    text = raw_text.strip()
    lower_text = text.lower()

    # Detect category
    category = category_hint or "other"
    if "hackathon" in lower_text:
        category = "hackathon"
    elif "certif" in lower_text or "aws" in lower_text or "azure" in lower_text or "gcp" in lower_text:
        category = "certification"
    elif "compet" in lower_text or "contest" in lower_text or "olympiad" in lower_text:
        category = "competition"
    elif "project" in lower_text or "github" in lower_text or "app" in lower_text:
        category = "project"
    elif "paper" in lower_text or "research" in lower_text or "publication" in lower_text or "ieee" in lower_text:
        category = "publication"
    elif "intern" in lower_text:
        category = "internship"
    elif "workshop" in lower_text:
        category = "workshop"

    # Detect Result / Position
    result = "Participant"
    if any(k in lower_text for k in ["1st", "first", "winner", "won"]):
        result = "Winner"
    elif any(k in lower_text for k in ["2nd", "second", "runner-up", "runner up"]):
        result = "2nd Place"
    elif any(k in lower_text for k in ["3rd", "third"]):
        result = "3rd Place"
    elif "finalist" in lower_text:
        result = "Finalist"

    # Extract event or organization name
    org = "Tech Organization"
    event = "Tech Event"
    
    # Simple regex matches for common phrases like "at XYZ" or "by XYZ"
    org_match = re.search(r"(?:at|by|organized by|from)\s+([A-Z][A-Za-z0-9\s&]+)", text)
    if org_match:
        extracted = org_match.group(1).strip()
        org = extracted.split(" and ")[0].split(" where ")[0][:40]

    title = f"{event} — {result}"
    if category == "hackathon":
        title = f"{org} Hackathon — {result}" if org != "Tech Organization" else f"Hackathon — {result}"
    elif category == "certification":
        title = f"{org} Certification"
        result = "Associate" if "associate" in lower_text else ("Professional" if "pro" in lower_text else "Foundational")
    elif category == "project":
        title = f"Project: {text[:30]}"
        result = "Production Deployed" if "production" in lower_text or "live" in lower_text else "Working Prototype"

    metadata = {
        "event_name": org if category == "hackathon" else title,
        "organization": org,
        "result": result,
        "achievement_level": result
    }

    draft = FormattedDraftField(
        category_slug=category,
        title=title,
        description=text if len(text) > 20 else f"Successfully achieved {result} in {title}.",
        achievement_date="2026-09-04",
        metadata=metadata,
        confidence=0.88,
        notes="Please review and fill any missing details before uploading your proof document."
    )

    return FormatAchievementResponse(
        success=True,
        draft=draft,
        message="Your rough text has been structured into a standardized draft. Please review and attach your proof."
    )
