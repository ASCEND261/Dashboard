use ascend_backend::services::point_engine::{calculate_points, OFFICIAL_VERSION};
use serde_json::json;

#[test]
fn test_hackathon_point_rules() {
    // 1st Place = 50 pts (Scope: TEAM)
    let res_1st = calculate_points("hackathon", &json!({ "result": "1st Place (Winner)" }), None);
    assert_eq!(res_1st.points, 50);
    assert_eq!(res_1st.scope, "TEAM");
    assert_eq!(res_1st.rule_version, OFFICIAL_VERSION);

    // 2nd Place = 30 pts (Scope: TEAM)
    let res_2nd = calculate_points("hackathon", &json!({ "result": "2nd Place (Runner-up)" }), None);
    assert_eq!(res_2nd.points, 30);
    assert_eq!(res_2nd.scope, "TEAM");

    // 3rd Place = 20 pts (Scope: TEAM)
    let res_3rd = calculate_points("hackathon", &json!({ "result": "3rd Place" }), None);
    assert_eq!(res_3rd.points, 20);
    assert_eq!(res_3rd.scope, "TEAM");

    // Participation = 10 pts (Scope: TEAM)
    let res_part = calculate_points("hackathon", &json!({ "result": "Participant" }), None);
    assert_eq!(res_part.points, 10);
    assert_eq!(res_part.scope, "TEAM");
}

#[test]
fn test_weekly_challenge_rules() {
    // Winner = 30 pts (Scope: TEAM)
    let res_win = calculate_points("weekly_challenge", &json!({ "result": "Winner" }), None);
    assert_eq!(res_win.points, 30);
    assert_eq!(res_win.scope, "TEAM");

    // Runner-up = 15 pts (Scope: TEAM)
    let res_runner = calculate_points("weekly_challenge", &json!({ "result": "Runner-up" }), None);
    assert_eq!(res_runner.points, 15);
    assert_eq!(res_runner.scope, "TEAM");

    // Participation = 5 pts (Scope: TEAM)
    let res_part = calculate_points("weekly_challenge", &json!({ "result": "Participant" }), None);
    assert_eq!(res_part.points, 5);
    assert_eq!(res_part.scope, "TEAM");
}

#[test]
fn test_society_project_rules() {
    // Basic = 10, Intermediate = 20, Advanced = 30 (Scope: TEAM)
    let res_basic = calculate_points("society_project", &json!({ "complexity": "Basic" }), None);
    assert_eq!(res_basic.points, 10);
    assert_eq!(res_basic.scope, "TEAM");

    let res_inter = calculate_points("society_project", &json!({ "complexity": "Intermediate" }), None);
    assert_eq!(res_inter.points, 20);
    assert_eq!(res_inter.scope, "TEAM");

    let res_adv = calculate_points("society_project", &json!({ "complexity": "Advanced" }), None);
    assert_eq!(res_adv.points, 30);
    assert_eq!(res_adv.scope, "TEAM");
}

#[test]
fn test_open_source_rules() {
    // PR Raised = 10 pts
    let res_raised = calculate_points("open_source", &json!({ "status": "PR Raised" }), None);
    assert_eq!(res_raised.points, 10);
    assert_eq!(res_raised.scope, "TEAM");

    // PR Merged in External Public Repo = 20 pts
    let res_ext = calculate_points("open_source", &json!({ "status": "PR Merged", "target": "External Public Repo" }), None);
    assert_eq!(res_ext.points, 20);
    assert_eq!(res_ext.scope, "TEAM");

    // PR Merged in Society Repo = 25 pts
    let res_soc = calculate_points("open_source", &json!({ "status": "PR Merged", "target": "Society Repo" }), None);
    assert_eq!(res_soc.points, 25);
    assert_eq!(res_soc.scope, "TEAM");
}

#[test]
fn test_final_project_rules() {
    // Winner = 250 pts, Runner-up = 100 pts, Participation = 50 pts (Scope: TEAM)
    let res_win = calculate_points("final_project", &json!({ "result": "Winner" }), None);
    assert_eq!(res_win.points, 250);
    assert_eq!(res_win.scope, "TEAM");

    let res_runner = calculate_points("final_project", &json!({ "result": "Runner-up" }), None);
    assert_eq!(res_runner.points, 100);
    assert_eq!(res_runner.scope, "TEAM");

    let res_part = calculate_points("final_project", &json!({ "result": "Participation" }), None);
    assert_eq!(res_part.points, 50);
    assert_eq!(res_part.scope, "TEAM");
}

#[test]
fn test_dsa_streak_rules() {
    // 7-day streak = +20 (Scope: INDIVIDUAL_AND_TEAM)
    let res_7d = calculate_points("dsa_streak", &json!({ "streak_type": "7-Day Continuous Streak" }), None);
    assert_eq!(res_7d.points, 20);
    assert_eq!(res_7d.scope, "INDIVIDUAL_AND_TEAM");

    // Monthly streak = +100 (Scope: INDIVIDUAL_AND_TEAM)
    let res_month = calculate_points("dsa_streak", &json!({ "streak_type": "Monthly Consistent DSA Challenge" }), None);
    assert_eq!(res_month.points, 100);
    assert_eq!(res_month.scope, "INDIVIDUAL_AND_TEAM");
}

#[test]
fn test_publication_and_speaking_rules() {
    // Technical Paper = 50 pts (Scope: INDIVIDUAL_AND_TEAM)
    let res_paper = calculate_points("publication", &json!({ "publication_type": "Peer-Reviewed Paper / IEEE" }), None);
    assert_eq!(res_paper.points, 50);
    assert_eq!(res_paper.scope, "INDIVIDUAL_AND_TEAM");

    // Tech Talk = 15 pts (Scope: INDIVIDUAL_AND_TEAM)
    let res_talk = calculate_points("technical_talk", &json!({ "event_type": "Internal / College Tech Talk" }), None);
    assert_eq!(res_talk.points, 15);
    assert_eq!(res_talk.scope, "INDIVIDUAL_AND_TEAM");

    // Tech Blog = 10 pts (Scope: INDIVIDUAL_AND_TEAM)
    let res_blog = calculate_points("technical_blog", &json!({ "platform": "Medium / Dev.to" }), None);
    assert_eq!(res_blog.points, 10);
    assert_eq!(res_blog.scope, "INDIVIDUAL_AND_TEAM");

    // Event Organizing = 10 pts (Scope: INDIVIDUAL_AND_TEAM)
    let res_event = calculate_points("event_organizing", &json!({ "role": "Workshop Lead" }), None);
    assert_eq!(res_event.points, 10);
    assert_eq!(res_event.scope, "INDIVIDUAL_AND_TEAM");
}

#[test]
fn test_sprint_track_rules() {
    // Code Track: 15 DSA Easy/Medium = +25
    let res_code = calculate_points("sprint_track", &json!({ "track": "Code Track", "milestone": "15 DSA Problems Solved" }), None);
    assert_eq!(res_code.points, 25);
    assert_eq!(res_code.scope, "INDIVIDUAL_AND_TEAM");

    // Open Source Track: First PR Merged = +15
    let res_oss = calculate_points("sprint_track", &json!({ "track": "Open Source Track", "milestone": "First External PR Merged" }), None);
    assert_eq!(res_oss.points, 15);
    assert_eq!(res_oss.scope, "INDIVIDUAL_AND_TEAM");

    // Build Track: Feature Branch Shipped = +8
    let res_build = calculate_points("sprint_track", &json!({ "track": "Build Track", "milestone": "Full Stack Feature Shipped" }), None);
    assert_eq!(res_build.points, 8);
    assert_eq!(res_build.scope, "INDIVIDUAL_AND_TEAM");

    // Pitch Track: Pitch Deck Approved = +30
    let res_pitch = calculate_points("sprint_track", &json!({ "track": "Pitch Track", "milestone": "Investor Pitch Deck Approved" }), None);
    assert_eq!(res_pitch.points, 30);
    assert_eq!(res_pitch.scope, "INDIVIDUAL_AND_TEAM");
}
