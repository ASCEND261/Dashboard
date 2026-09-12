use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub const OFFICIAL_VERSION: &str = "TSJ-2026-v1";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PointCalculationResult {
    pub rule_id: String,
    pub rule_code: String,
    pub rule_version: String,
    pub points: i32,
    pub scope: String, // "TEAM" or "INDIVIDUAL_AND_TEAM"
    pub condition_matched: String,
    pub eligible: bool,
}

pub fn calculate_points(
    category_slug: &str,
    metadata: &serde_json::Value,
    version_id: Option<&str>,
) -> PointCalculationResult {
    let mut version = version_id.unwrap_or(OFFICIAL_VERSION);
    if version == "2026-v1" {
        version = OFFICIAL_VERSION;
    }

    // Extract normalized metadata map
    let mut norm_meta: HashMap<String, String> = HashMap::new();
    if let Some(obj) = metadata.as_object() {
        for (k, v) in obj {
            if let Some(s) = v.as_str() {
                norm_meta.insert(k.to_lowercase(), s.trim().to_lowercase());
            } else if !v.is_null() {
                norm_meta.insert(k.to_lowercase(), v.to_string().trim().to_lowercase());
            }
        }
    }

    // Pre-check: Ineligible / Disqualified submissions
    if norm_meta.get("disqualified").map(|s| s == "true").unwrap_or(false)
        || norm_meta.get("position").map(|s| s == "disqualified" || s == "ineligible").unwrap_or(false)
        || norm_meta.get("result").map(|s| s == "disqualified" || s == "ineligible").unwrap_or(false)
    {
        return PointCalculationResult {
            rule_id: "RULE-INELIGIBLE".to_string(),
            rule_code: "INELIGIBLE".to_string(),
            rule_version: version.to_string(),
            points: 0,
            scope: "TEAM".to_string(),
            condition_matched: "Submission ineligible / disqualified under sprint rules".to_string(),
            eligible: false,
        };
    }

    let cat = category_slug.trim().to_lowercase();

    // 1. EXTERNAL HACKATHON
    // 1st Place = 50, 2nd Place = 30, 3rd Place = 20, Participation = 10 (Scope: TEAM)
    if cat == "hackathon" || cat == "external_hackathon" {
        let result_val = norm_meta
            .get("result")
            .or_else(|| norm_meta.get("position"))
            .cloned()
            .unwrap_or_default();

        if result_val.contains("1st") || result_val.contains("first") || result_val.contains("winner") {
            return PointCalculationResult {
                rule_id: "RULE-HACK-1ST".to_string(),
                rule_code: "EXTERNAL_HACKATHON_1ST".to_string(),
                rule_version: version.to_string(),
                points: 50,
                scope: "TEAM".to_string(),
                condition_matched: "External Hackathon 1st Place".to_string(),
                eligible: true,
            };
        } else if result_val.contains("2nd") || result_val.contains("second") || result_val.contains("runner") {
            return PointCalculationResult {
                rule_id: "RULE-HACK-2ND".to_string(),
                rule_code: "EXTERNAL_HACKATHON_2ND".to_string(),
                rule_version: version.to_string(),
                points: 30,
                scope: "TEAM".to_string(),
                condition_matched: "External Hackathon 2nd Place".to_string(),
                eligible: true,
            };
        } else if result_val.contains("3rd") || result_val.contains("third") {
            return PointCalculationResult {
                rule_id: "RULE-HACK-3RD".to_string(),
                rule_code: "EXTERNAL_HACKATHON_3RD".to_string(),
                rule_version: version.to_string(),
                points: 20,
                scope: "TEAM".to_string(),
                condition_matched: "External Hackathon 3rd Place".to_string(),
                eligible: true,
            };
        } else {
            return PointCalculationResult {
                rule_id: "RULE-HACK-PARTICIPATION".to_string(),
                rule_code: "EXTERNAL_HACKATHON_PARTICIPATION".to_string(),
                rule_version: version.to_string(),
                points: 10,
                scope: "TEAM".to_string(),
                condition_matched: "External Hackathon Participation".to_string(),
                eligible: true,
            };
        }
    }

    // 2. WEEKLY CHALLENGE
    // Winner = 30, Runner-up = 15, Participation = 5 (Scope: TEAM)
    if cat == "weekly_challenge" {
        let result_val = norm_meta.get("result").cloned().unwrap_or_default();
        if result_val.contains("winner") || result_val.contains("1st") || result_val.contains("first") {
            return PointCalculationResult {
                rule_id: "RULE-WEEKLY-WINNER".to_string(),
                rule_code: "WEEKLY_CHALLENGE_WINNER".to_string(),
                rule_version: version.to_string(),
                points: 30,
                scope: "TEAM".to_string(),
                condition_matched: "Weekly Challenge Winner".to_string(),
                eligible: true,
            };
        } else if result_val.contains("runner") || result_val.contains("2nd") || result_val.contains("second") {
            return PointCalculationResult {
                rule_id: "RULE-WEEKLY-RUNNER-UP".to_string(),
                rule_code: "WEEKLY_CHALLENGE_RUNNER_UP".to_string(),
                rule_version: version.to_string(),
                points: 15,
                scope: "TEAM".to_string(),
                condition_matched: "Weekly Challenge Runner-up".to_string(),
                eligible: true,
            };
        } else {
            return PointCalculationResult {
                rule_id: "RULE-WEEKLY-PARTICIPATION".to_string(),
                rule_code: "WEEKLY_CHALLENGE_PARTICIPATION".to_string(),
                rule_version: version.to_string(),
                points: 5,
                scope: "TEAM".to_string(),
                condition_matched: "Weekly Challenge Participation".to_string(),
                eligible: true,
            };
        }
    }

    // 3. SOCIETY PROJECT
    // Basic = 10, Intermediate = 20, Advanced = 30 (Scope: TEAM)
    if cat == "project" || cat == "society_project" {
        let level_val = norm_meta
            .get("result")
            .or_else(|| norm_meta.get("level"))
            .or_else(|| norm_meta.get("project_level"))
            .or_else(|| norm_meta.get("complexity"))
            .cloned()
            .unwrap_or_default();

        if level_val.contains("advance") || level_val.contains("production") {
            return PointCalculationResult {
                rule_id: "RULE-SOCIETY-ADVANCED".to_string(),
                rule_code: "SOCIETY_PROJECT_ADVANCED".to_string(),
                rule_version: version.to_string(),
                points: 30,
                scope: "TEAM".to_string(),
                condition_matched: "Society Project Advanced".to_string(),
                eligible: true,
            };
        } else if level_val.contains("intermed") || level_val.contains("prototype") {
            return PointCalculationResult {
                rule_id: "RULE-SOCIETY-INTERMEDIATE".to_string(),
                rule_code: "SOCIETY_PROJECT_INTERMEDIATE".to_string(),
                rule_version: version.to_string(),
                points: 20,
                scope: "TEAM".to_string(),
                condition_matched: "Society Project Intermediate".to_string(),
                eligible: true,
            };
        } else {
            return PointCalculationResult {
                rule_id: "RULE-SOCIETY-BASIC".to_string(),
                rule_code: "SOCIETY_PROJECT_BASIC".to_string(),
                rule_version: version.to_string(),
                points: 10,
                scope: "TEAM".to_string(),
                condition_matched: "Society Project Basic".to_string(),
                eligible: true,
            };
        }
    }

    // 4. OPEN SOURCE
    // PR Raised = 10, PR Merged External = 20, PR Merged Society = 25 (Scope: TEAM)
    if cat == "open_source" {
        let pr_status = norm_meta
            .get("pull_request_status")
            .or_else(|| norm_meta.get("result"))
            .or_else(|| norm_meta.get("status"))
            .cloned()
            .unwrap_or_else(|| "merged".to_string());
        let repo_type = norm_meta
            .get("repository_type")
            .or_else(|| norm_meta.get("type"))
            .or_else(|| norm_meta.get("target"))
            .cloned()
            .unwrap_or_else(|| "external_public".to_string());

        if pr_status.contains("raised") && !pr_status.contains("merge") {
            return PointCalculationResult {
                rule_id: "RULE-OSS-RAISED".to_string(),
                rule_code: "OPEN_SOURCE_PR_RAISED".to_string(),
                rule_version: version.to_string(),
                points: 10,
                scope: "TEAM".to_string(),
                condition_matched: "Open Source PR Raised".to_string(),
                eligible: true,
            };
        } else if repo_type.contains("society") || repo_type.contains("internal") {
            return PointCalculationResult {
                rule_id: "RULE-OSS-MERGED-SOC".to_string(),
                rule_code: "OPEN_SOURCE_PR_MERGED_SOCIETY".to_string(),
                rule_version: version.to_string(),
                points: 25,
                scope: "TEAM".to_string(),
                condition_matched: "Open Source PR Merged in Society Repository".to_string(),
                eligible: true,
            };
        } else {
            return PointCalculationResult {
                rule_id: "RULE-OSS-MERGED-EXT".to_string(),
                rule_code: "OPEN_SOURCE_PR_MERGED_EXTERNAL".to_string(),
                rule_version: version.to_string(),
                points: 20,
                scope: "TEAM".to_string(),
                condition_matched: "Open Source PR Merged in External Public Repository".to_string(),
                eligible: true,
            };
        }
    }

    // 5. FINAL / MAJOR PROJECT
    // Winner = 250, Runner-up = 100, Other = 50 (Scope: TEAM)
    if cat == "final_project" || cat == "major_project" {
        let res_val = norm_meta.get("result").cloned().unwrap_or_default();
        if res_val.contains("winner") || res_val.contains("1st") {
            return PointCalculationResult {
                rule_id: "RULE-FINAL-WINNER".to_string(),
                rule_code: "FINAL_PROJECT_WINNER".to_string(),
                rule_version: version.to_string(),
                points: 250,
                scope: "TEAM".to_string(),
                condition_matched: "Final Project Winner".to_string(),
                eligible: true,
            };
        } else if res_val.contains("runner") || res_val.contains("2nd") {
            return PointCalculationResult {
                rule_id: "RULE-FINAL-RUNNER-UP".to_string(),
                rule_code: "FINAL_PROJECT_RUNNER_UP".to_string(),
                rule_version: version.to_string(),
                points: 100,
                scope: "TEAM".to_string(),
                condition_matched: "Final Project Runner-up".to_string(),
                eligible: true,
            };
        } else {
            return PointCalculationResult {
                rule_id: "RULE-FINAL-PARTICIPATING".to_string(),
                rule_code: "FINAL_PROJECT_PARTICIPATING".to_string(),
                rule_version: version.to_string(),
                points: 50,
                scope: "TEAM".to_string(),
                condition_matched: "Final Project Other Participating Team".to_string(),
                eligible: true,
            };
        }
    }

    // 6. INDIVIDUAL SCOREBOARD: DSA STREAK
    // 7-day = 20, Monthly = 100 (Scope: INDIVIDUAL_AND_TEAM)
    if cat == "dsa" || cat == "dsa_streak" {
        let streak_type = norm_meta
            .get("streak_type")
            .or_else(|| norm_meta.get("result"))
            .cloned()
            .unwrap_or_else(|| "7_day".to_string());

        if streak_type.contains("month") || streak_type.contains("30") {
            return PointCalculationResult {
                rule_id: "RULE-DSA-MONTHLY".to_string(),
                rule_code: "DSA_MONTHLY_STREAK".to_string(),
                rule_version: version.to_string(),
                points: 100,
                scope: "INDIVIDUAL_AND_TEAM".to_string(),
                condition_matched: "Monthly DSA Streak".to_string(),
                eligible: true,
            };
        } else {
            return PointCalculationResult {
                rule_id: "RULE-DSA-7-DAY".to_string(),
                rule_code: "DSA_7_DAY_STREAK".to_string(),
                rule_version: version.to_string(),
                points: 20,
                scope: "INDIVIDUAL_AND_TEAM".to_string(),
                condition_matched: "7-Day DSA Streak".to_string(),
                eligible: true,
            };
        }
    }

    // 7. RESEARCH PAPER
    // Publication / Submission = 50 (Scope: INDIVIDUAL_AND_TEAM)
    if cat == "publication" || cat == "research_paper" {
        return PointCalculationResult {
            rule_id: "RULE-RESEARCH-PAPER".to_string(),
            rule_code: "RESEARCH_PAPER".to_string(),
            rule_version: version.to_string(),
            points: 50,
            scope: "INDIVIDUAL_AND_TEAM".to_string(),
            condition_matched: "Research Paper Publication / Submission".to_string(),
            eligible: true,
        };
    }

    // 8. TECH TALK
    // Delivery = 15 (Scope: INDIVIDUAL_AND_TEAM)
    if cat == "tech_talk" || cat == "technical_talk" {
        return PointCalculationResult {
            rule_id: "RULE-TECH-TALK".to_string(),
            rule_code: "TECH_TALK".to_string(),
            rule_version: version.to_string(),
            points: 15,
            scope: "INDIVIDUAL_AND_TEAM".to_string(),
            condition_matched: "Tech Talk Delivery".to_string(),
            eligible: true,
        };
    }

    // 9. BLOG / ARTICLE
    // Publication = 10 (Scope: INDIVIDUAL_AND_TEAM)
    if cat == "blog" || cat == "article" || cat == "technical_blog" {
        return PointCalculationResult {
            rule_id: "RULE-BLOG-ARTICLE".to_string(),
            rule_code: "BLOG_ARTICLE".to_string(),
            rule_version: version.to_string(),
            points: 10,
            scope: "INDIVIDUAL_AND_TEAM".to_string(),
            condition_matched: "Blog / Article Publication".to_string(),
            eligible: true,
        };
    }

    // 10. EXTERNAL EVENT
    // Attendance / Participation = 10 (Scope: INDIVIDUAL_AND_TEAM)
    if cat == "external_event" || cat == "event" || cat == "event_organizing" {
        return PointCalculationResult {
            rule_id: "RULE-EXTERNAL-EVENT".to_string(),
            rule_code: "EXTERNAL_EVENT".to_string(),
            rule_version: version.to_string(),
            points: 10,
            scope: "INDIVIDUAL_AND_TEAM".to_string(),
            condition_matched: "External Event Participation".to_string(),
            eligible: true,
        };
    }

    // 11. SPRINT TRACK SCORING
    // Winner / Code Track DSA = 25, Runner-up / OSS PR = 15, Participation / Build Track Feature = 8, Pitch Track / Full Track Streak = 30 (Scope: INDIVIDUAL_AND_TEAM)
    if cat == "sprint_track" || cat == "track" {
        let res_val = norm_meta
            .get("result")
            .or_else(|| norm_meta.get("milestone"))
            .cloned()
            .unwrap_or_default();

        if res_val.contains("full track") || res_val.contains("full_track") || res_val.contains("streak") || res_val.contains("pitch") || res_val.contains("investor") {
            return PointCalculationResult {
                rule_id: "RULE-FULL-TRACK-STREAK".to_string(),
                rule_code: "FULL_TRACK_STREAK".to_string(),
                rule_version: version.to_string(),
                points: 30,
                scope: "INDIVIDUAL_AND_TEAM".to_string(),
                condition_matched: "Sprint Pitch Track / Full Track Streak".to_string(),
                eligible: true,
            };
        } else if res_val.contains("winner") || res_val.contains("1st") || res_val.contains("15 dsa") {
            return PointCalculationResult {
                rule_id: "RULE-SPRINT-WINNER".to_string(),
                rule_code: "SPRINT_WINNER".to_string(),
                rule_version: version.to_string(),
                points: 25,
                scope: "INDIVIDUAL_AND_TEAM".to_string(),
                condition_matched: "Sprint Code Track Winner / 15 DSA Solved".to_string(),
                eligible: true,
            };
        } else if res_val.contains("runner") || res_val.contains("2nd") || res_val.contains("pr merged") || res_val.contains("first external") {
            return PointCalculationResult {
                rule_id: "RULE-SPRINT-RUNNER-UP".to_string(),
                rule_code: "SPRINT_RUNNER_UP".to_string(),
                rule_version: version.to_string(),
                points: 15,
                scope: "INDIVIDUAL_AND_TEAM".to_string(),
                condition_matched: "Sprint OSS Track / Runner-up".to_string(),
                eligible: true,
            };
        } else {
            return PointCalculationResult {
                rule_id: "RULE-SPRINT-PARTICIPATION".to_string(),
                rule_code: "SPRINT_PARTICIPATION".to_string(),
                rule_version: version.to_string(),
                points: 8,
                scope: "INDIVIDUAL_AND_TEAM".to_string(),
                condition_matched: "Sprint Build Track / Participation".to_string(),
                eligible: true,
            };
        }
    }

    // Fallback for unmapped category
    PointCalculationResult {
        rule_id: "RULE-UNMAPPED".to_string(),
        rule_code: "UNMAPPED_CATEGORY".to_string(),
        rule_version: version.to_string(),
        points: 0,
        scope: "TEAM".to_string(),
        condition_matched: "Category unmapped in official ruleset; requires manual review".to_string(),
        eligible: false,
    }
}
