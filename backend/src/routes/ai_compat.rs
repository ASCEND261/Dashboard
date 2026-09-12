use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use axum::Json;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct AIChatRequest {
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct AIChatResponse {
    pub reply: String,
    pub suggested_actions: Vec<String>,
    pub knowledge_references: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct FormatAchievementRequest {
    pub raw_text: String,
    pub category_hint: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct FormattedDraftField {
    pub category_slug: String,
    pub title: String,
    pub description: String,
    pub achievement_date: String,
    pub metadata: serde_json::Value,
    pub confidence: f64,
    pub notes: &'static str,
}

#[derive(Debug, Serialize)]
pub struct FormatAchievementResponse {
    pub success: bool,
    pub draft: FormattedDraftField,
    pub message: &'static str,
}

pub async fn chat_with_guide(
    AuthUser(_user): AuthUser,
    Json(req): Json<AIChatRequest>,
) -> Result<Json<AIChatResponse>, AppError> {
    let q = req.message.to_lowercase();

    // Safety Guardrails: Prevent prompt injection / cheating / point tampering
    if q.contains("give me points")
        || q.contains("approve my")
        || q.contains("change my points")
        || q.contains("fabricate")
        || q.contains("cheat")
        || q.contains("override points")
    {
        return Ok(Json(AIChatResponse {
            reply: "As the ASCEND Guide, I cannot approve submissions, alter point allocations, or override Core Member decisions. All points are deterministically calculated by the official Rust Point Rules Engine upon Core Member verification or AutoVerify consensus.".to_string(),
            suggested_actions: vec!["Review Official Rules".to_string(), "Submit Achievement with Valid Proof".to_string()],
            knowledge_references: vec!["Rule Version TSJ-2026-v1".to_string(), "Verification Guidelines".to_string()],
        }));
    }

    // Architecture & Verification: "AI assists; Rust decides/enforces"
    if q.contains("how does verification work")
        || q.contains("verification work")
        || q.contains("verification architecture")
        || q.contains("autoverify")
        || q.contains("who verifies")
    {
        return Ok(Json(AIChatResponse {
            reply: "In ASCEND, 'AI assists; Rust decides/enforces.'\n\nWhen an achievement is submitted with proof, it passes through our multi-signal pipeline:\n1. Proof Intelligence (Python AI): Performs OCR, vision analysis, candidate name match, category relevance, date check, and claim consistency.\n2. Cryptographic Integrity: SHA-256 hash collision check detects identical proof documents reused across the cohort.\n3. Authoritative Decision (Rust Engine): Evaluates evidence quality against TSJ-2026-v1 rules.\n\nOutcomes:\n• High-confidence, verified proof → Eligible for AutoVerify or immediate Core clearance.\n• Partial or ambiguous proof → Routed to Core Review Queue with flagged signals (No points yet, ledger unchanged).\n• Insufficient or forged proof → Rejected with explicit feedback (Zero-Deductions guarantee: your existing points are NEVER deducted).".to_string(),
            suggested_actions: vec![
                "How are points calculated?".to_string(),
                "Why was my proof rejected?".to_string(),
                "What can I submit?".to_string(),
            ],
            knowledge_references: vec!["ASCEND Dual-Engine Architecture".to_string(), "AutoVerify Protocol TSJ-2026".to_string()],
        }));
    }

    // Points & Scoring Rules
    if q.contains("how are points calculated")
        || q.contains("points calculated")
        || q.contains("scoring")
        || q.contains("point rules")
        || q.contains("calculate")
    {
        return Ok(Json(AIChatResponse {
            reply: "All points in ASCEND are deterministically computed by the Rust scoring engine under official ruleset TSJ-2026-v1. Neither AI nor individual verifiers can assign arbitrary numbers.\n\nAuthoritative TSJ-2026-v1 Point Table:\n• External Hackathons: 1st Place (50 pts), 2nd Place (30 pts), 3rd Place (20 pts), Participation (10 pts)\n• Weekly Challenges: Winner (30 pts), Runner-up (15 pts), Participation (5 pts)\n• Major Society Projects: Production Deployment (50 pts), Feature Milestone (25 pts)\n• Open Source: Merged PR in public upstream (30 pts), Internal/Society PR (15 pts)\n• DSA Streaks: Verified 7-Day Streak (20 pts)\n• Research/Publications: Peer-reviewed conference/journal (50 pts)\n• Meetup Attendance: 5 pts per verified present team member".to_string(),
            suggested_actions: vec![
                "How does AutoVerify work?".to_string(),
                "What proof is required for open source?".to_string(),
                "View My Submissions".to_string(),
            ],
            knowledge_references: vec!["Official TSJ-2026-v1 Rulebook".to_string(), "Dual-Entry PointLedger".to_string()],
        }));
    }

    // Proof Rejection & Zero-Deduction Guarantee
    if q.contains("rejected")
        || q.contains("why was my proof rejected")
        || q.contains("proof rejected")
        || q.contains("penalty")
        || q.contains("deduct")
    {
        return Ok(Json(AIChatResponse {
            reply: "Submissions are rejected when uploaded proof documents do not satisfy the criteria of the claimed category. Common reasons include:\n• Unrelated images (e.g. memes, generic screenshots, or corrupt files)\n• Identity mismatch (name on certificate does not match the submitting member)\n• Condition mismatch (e.g. a total solved problem counter instead of a consecutive-day streak)\n• Unmerged PRs (pull requests that are still open or draft)\n\nCrucial Rule — Zero-Deductions Guarantee:\nASCEND strictly preserves existing earned points. Ineligible or rejected claims award 0 points, but NEVER deduct or penalize existing verified ledger entries.".to_string(),
            suggested_actions: vec![
                "What can I submit?".to_string(),
                "How does verification work?".to_string(),
                "Check Submission Feedback".to_string(),
            ],
            knowledge_references: vec!["Zero-Deductions Policy".to_string(), "Evidence Verification Checklist".to_string()],
        }));
    }

    // DSA vs Consecutive Streak
    if q.contains("dsa") || q.contains("leetcode") || q.contains("codeforces") || q.contains("streak") {
        return Ok(Json(AIChatResponse {
            reply: "For DSA Algorithmic achievements, ASCEND requires evidence of an active consecutive-day streak (e.g., a verified 7-day streak).\n\nImportant distinction:\nA profile screenshot showing '500 problems solved' is a lifetime total, NOT evidence of a 7-day streak. To receive streak points, your proof must show the daily submission activity calendar or streak counter demonstrating consecutive days of problem solving.".to_string(),
            suggested_actions: vec![
                "What proof is needed for DSA?".to_string(),
                "How are points calculated?".to_string(),
            ],
            knowledge_references: vec!["Rule DSA-01: Consecutive Streaks".to_string(), "Proof Standards".to_string()],
        }));
    }

    // Open Source PR Requirements
    if q.contains("open source") || q.contains("github") || q.contains("pull request") || q.contains("merged pr") || q.contains("open-source") {
        return Ok(Json(AIChatResponse {
            reply: "Open Source points require verified merged pull requests:\n• Upstream Public Repo: Merged PR into a recognized open-source project awards 30 pts.\n• Society / Track Repo: Merged feature PR awards 15 pts.\n\nEvidence Requirements:\n• The PR must be in 'MERGED' status (open PRs or draft submissions are not eligible).\n• Evidence must include repository link and merged commit confirmation. A generic GitHub contribution heatmap alone is not sufficient proof.".to_string(),
            suggested_actions: vec![
                "How do I submit an achievement?".to_string(),
                "Review Open Source Rules".to_string(),
            ],
            knowledge_references: vec!["Rule OS-01: Merged Code Contributions".to_string()],
        }));
    }

    // Access Control vs Achievement Verification
    if q.contains("access")
        || q.contains("approval")
        || q.contains("who approves")
        || q.contains("pending")
        || q.contains("code")
    {
        return Ok(Json(AIChatResponse {
            reply: "In ASCEND, Account Access Approval and Achievement Verification are two strictly separated security systems:\n\n1. Account Access Flow:\nEmail → OTP Verification → Access Request (Status: PENDING) → Administrator Review → APPROVED → Unique 6-Digit Code Generated.\nUntil an administrator approves your account, you cannot access member workspaces or submit claims.\n\n2. Direct Login:\nOnce approved, you receive a collision-free 6-digit access code (available in the [⌁ CODE] button) for direct one-click authentication without waiting for OTP.\n\n3. Achievement Verification:\nCore Members and the AutoVerify engine verify individual achievements and proofs independently from account creation.".to_string(),
            suggested_actions: vec![
                "Who approves my access?".to_string(),
                "How does verification work?".to_string(),
            ],
            knowledge_references: vec!["Access Control & RBAC System".to_string(), "Security Protocol TSJ-2026".to_string()],
        }));
    }

    // General "What can I submit"
    if q.contains("what can i submit") || q.contains("how do i submit") || q.contains("submission") {
        return Ok(Json(AIChatResponse {
            reply: "To submit an achievement:\n1. Click '+ Submit Achievement' in your Workspace or bottom navigation.\n2. Select your category (External Hackathons, Weekly Challenges, Open Source PRs, DSA Streaks, Society Projects, Certifications, Research Papers, etc.).\n3. Complete the required fields (Event name, organization, result, date).\n4. Attach a valid proof document (PDF, PNG, or JPG certificate, merged PR link, or screenshot).\n5. Review & Submit. Your claim immediately enters the AutoVerify & Core Review pipeline.".to_string(),
            suggested_actions: vec![
                "How does verification work?".to_string(),
                "How are points calculated?".to_string(),
            ],
            knowledge_references: vec!["Member Submission Workflow".to_string()],
        }));
    }

    // Default Fallback: Grounded and Authoritative
    Ok(Json(AIChatResponse {
        reply: "I am the ASCEND Guide, your authoritative product intelligence assistant for Tech Sprint Journey 2026. I can explain the verification pipeline ('AI assists; Rust decides/enforces'), official point rules (TSJ-2026-v1), proof standards, access controls, and how your claims are evaluated.".to_string(),
        suggested_actions: vec![
            "How does verification work?".to_string(),
            "How are points calculated?".to_string(),
            "Why was my proof rejected?".to_string(),
            "Who approves my access?".to_string(),
        ],
        knowledge_references: vec!["ASCEND Authoritative Knowledge Core".to_string()],
    }))
}

pub async fn format_achievement_draft(
    AuthUser(_user): AuthUser,
    Json(req): Json<FormatAchievementRequest>,
) -> Result<Json<FormatAchievementResponse>, AppError> {
    let text = req.raw_text.trim();
    let lower_text = text.to_lowercase();

    let mut category = req.category_hint.unwrap_or_else(|| "other".to_string());
    if lower_text.contains("hackathon") {
        category = "hackathon".to_string();
    } else if lower_text.contains("weekly") || lower_text.contains("challenge") {
        category = "weekly_challenge".to_string();
    } else if lower_text.contains("open source") || lower_text.contains("github pr") || lower_text.contains("pull request") {
        category = "open_source".to_string();
    } else if lower_text.contains("dsa") || lower_text.contains("leetcode") || lower_text.contains("codeforces") {
        category = "dsa".to_string();
    } else if lower_text.contains("project") || lower_text.contains("prototype") {
        category = "project".to_string();
    } else if lower_text.contains("paper") || lower_text.contains("research") || lower_text.contains("publication") {
        category = "publication".to_string();
    }

    let mut result = "Participation";
    if lower_text.contains("1st") || lower_text.contains("first") || lower_text.contains("winner") || lower_text.contains("won") {
        result = "1st Place (Winner)";
    } else if lower_text.contains("2nd") || lower_text.contains("second") || lower_text.contains("runner") {
        result = "2nd Place (Runner-up)";
    } else if lower_text.contains("3rd") || lower_text.contains("third") {
        result = "3rd Place";
    }

    let title = if category == "hackathon" {
        format!("Hackathon — {}", result)
    } else if category == "weekly_challenge" {
        format!("Weekly Challenge — {}", result)
    } else if category == "open_source" {
        "Open Source Contribution (PR Merged)".to_string()
    } else if category == "dsa" {
        "DSA Algorithmic Problem Solving".to_string()
    } else {
        format!("Achievement — {}", result)
    };

    let metadata = serde_json::json!({
        "result": result,
        "category": category,
        "parsed_from": "ASCEND AI Assistant",
    });

    let draft = FormattedDraftField {
        category_slug: category,
        title,
        description: if text.len() > 15 { text.to_string() } else { format!("Successfully accomplished: {}", text) },
        achievement_date: "2026-09-04".to_string(),
        metadata,
        confidence: 0.92,
        notes: "Please review and confirm all fields before uploading your proof certificate.",
    };

    Ok(Json(FormatAchievementResponse {
        success: true,
        draft,
        message: "Your rough text has been structured into a standardized draft. Please review and attach your proof.",
    }))
}
