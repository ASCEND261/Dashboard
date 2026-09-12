--
-- PostgreSQL database dump
--

\restrict PImplO3SYTAXHBNrZP4psZLUZtwDEmgg0cTnofBmK62RKS9JmvhX7Qg8aEuiLpB

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: achievement_categories; Type: TABLE DATA; Schema: public; Owner: yogayjain
--

COPY public.achievement_categories (id, slug, name, description, icon, required_fields, is_active, created_at) FROM stdin;
cat-hackathon	hackathon	External Hackathon	Competitive hackathons. 1st: 50, 2nd: 30, 3rd: 20, Participation: 10	Trophy	[{"name": "event_name", "label": "Event Name", "type": "text", "required": true, "placeholder": "e.g., HackZurich 2026"}, {"name": "organization", "label": "Organizing Body", "type": "text", "required": true, "placeholder": "e.g., ETH Zurich"}, {"name": "result", "label": "Placement Result", "type": "select", "required": true, "options": ["1st Place", "2nd Place", "3rd Place", "Participation"]}, {"name": "project_repo", "label": "Project Repository / Demo Link", "type": "url", "required": false}]	1	2026-09-05 09:56:48.388218
cat-weekly	weekly_challenge	Weekly Challenge	Official weekly sprint challenge. Winner: 30, Runner-up: 15, Participation: 5	Flame	[{"name": "challenge_id", "label": "Challenge Name / ID", "type": "text", "required": true, "placeholder": "e.g., Sprint Week 03 Challenge"}, {"name": "organization", "label": "Admin Review Body", "type": "text", "required": true, "placeholder": "Core Tech Council"}, {"name": "result", "label": "Award Placement", "type": "select", "required": true, "options": ["Winner", "Runner-up", "Participation"]}]	1	2026-09-05 09:56:48.38822
cat-project	project	Society Project	Official society engineering projects. Basic: 10, Intermediate: 20, Advanced: 30	Code	[{"name": "event_name", "label": "Project Name", "type": "text", "required": true, "placeholder": "e.g., ASCEND Gateway Engine"}, {"name": "organization", "label": "Host Society / Unit", "type": "text", "required": true, "placeholder": "e.g., Tech Society"}, {"name": "result", "label": "Project Evaluation Tier", "type": "select", "required": true, "options": ["Basic", "Intermediate", "Advanced"]}, {"name": "role", "label": "Your Technical Role", "type": "text", "required": true, "placeholder": "e.g., Backend Lead"}]	1	2026-09-05 09:56:48.38822
cat-oss	open_source	Open Source	PR Raised: 10, PR Merged External: 20, PR Merged Society Repo: 25	GitPullRequest	[{"name": "event_name", "label": "Repository Name", "type": "text", "required": true, "placeholder": "e.g., fastapi/fastapi"}, {"name": "repository_type", "label": "Repository Type", "type": "select", "required": true, "options": ["External Public Repository", "Society Repository"]}, {"name": "pull_request_status", "label": "Pull Request Status", "type": "select", "required": true, "options": ["PR Raised", "PR Merged"]}, {"name": "result", "label": "Classification Tier", "type": "select", "required": true, "options": ["PR Raised", "PR Merged in External Public Repository", "PR Merged in Society Repository"]}, {"name": "pr_url", "label": "Pull Request URL", "type": "url", "required": true}]	1	2026-09-05 09:56:48.388221
cat-dsa	dsa	DSA Streak	Continuous competitive programming streak. 7-Day: 20 pts, Monthly: 100 pts (Individual + Team)	Award	[{"name": "event_name", "label": "Platform", "type": "text", "required": true, "placeholder": "e.g., LeetCode / Codeforces"}, {"name": "organization", "label": "Verification Platform", "type": "text", "required": true, "placeholder": "e.g., LeetCode Daily Challenge"}, {"name": "result", "label": "Streak Duration", "type": "select", "required": true, "options": ["7-Day DSA Streak", "Monthly DSA Streak"]}, {"name": "profile_url", "label": "Public Profile URL", "type": "url", "required": true}]	1	2026-09-05 09:56:48.388221
cat-paper	publication	Research Paper	Publication / Submission of technical research paper: 50 pts (Individual + Team)	BookOpen	[{"name": "event_name", "label": "Paper Title", "type": "text", "required": true}, {"name": "organization", "label": "Publisher / Journal / Conference", "type": "text", "required": true}, {"name": "result", "label": "Status", "type": "select", "required": true, "options": ["Publication / Submission"]}, {"name": "doi", "label": "DOI / Paper Link", "type": "text", "required": false}]	1	2026-09-05 09:56:48.388221
cat-talk	tech_talk	Tech Talk	Delivery of technical keynote or workshop: 15 pts (Individual + Team)	Users	[{"name": "event_name", "label": "Talk Title", "type": "text", "required": true}, {"name": "organization", "label": "Host Body / Venue", "type": "text", "required": true}, {"name": "result", "label": "Delivery Status", "type": "select", "required": true, "options": ["Tech Talk Delivery"]}]	1	2026-09-05 09:56:48.388222
cat-blog	blog	Blog / Article	Technical publication on Medium / Substack / Dev.to: 10 pts (Individual + Team)	FileText	[{"name": "event_name", "label": "Article Title", "type": "text", "required": true}, {"name": "organization", "label": "Publication Platform", "type": "text", "required": true}, {"name": "result", "label": "Status", "type": "select", "required": true, "options": ["Blog / Article Publication"]}, {"name": "article_url", "label": "Public Article URL", "type": "url", "required": true}]	1	2026-09-05 09:56:48.388222
cat-event	external_event	External Event	Attendance / Participation in approved technical event: 10 pts (Individual + Team)	Compass	[{"name": "event_name", "label": "Event Name", "type": "text", "required": true}, {"name": "organization", "label": "Organizer", "type": "text", "required": true}, {"name": "result", "label": "Participation", "type": "select", "required": true, "options": ["External Event Participation"]}]	1	2026-09-05 09:56:48.388223
cat-track	sprint_track	Sprint Track Scoring	Track scoring: Winner 25, Runner-up 15, Participation 8, Full Track Streak 30 (Individual + Team)	Trophy	[{"name": "event_name", "label": "Sprint Track Session", "type": "text", "required": true}, {"name": "organization", "label": "Tech Sprint Committee", "type": "text", "required": true}, {"name": "result", "label": "Result Tier", "type": "select", "required": true, "options": ["Winner", "Runner-up", "Participation", "Full Track Streak"]}]	1	2026-09-05 09:56:48.388223
cat-final	final_project	Final / Major Project	End of sprint capstone evaluation. Winner: 250, Runner-up: 100, Other: 50	Award	[{"name": "event_name", "label": "Final Project Title", "type": "text", "required": true}, {"name": "organization", "label": "Judging Panel", "type": "text", "required": true}, {"name": "result", "label": "Final Standing", "type": "select", "required": true, "options": ["Winner", "Runner-up", "Other Participating Team"]}]	1	2026-09-05 09:56:48.388224
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: yogayjain
--

COPY public.departments (id, name, code, created_at) FROM stdin;
dept-cse	Computer Science & Engineering	CSE	2026-09-05 09:56:48.210314
dept-ece	Electronics & Communication	ECE	2026-09-05 09:56:48.210322
dept-aids	Artificial Intelligence & Data Science	AIDS	2026-09-05 09:56:48.210323
dept-mech	Mechanical Engineering	MECH	2026-09-05 09:56:48.210324
\.


--
-- Data for Name: point_rule_versions; Type: TABLE DATA; Schema: public; Owner: yogayjain
--

COPY public.point_rule_versions (id, name, description, effective_from, effective_to, is_active, created_at) FROM stdin;
TSJ-2026-v1	Tech Sprint Journey 2026 — Official Points & Scoring System	The official single source of truth for cohort scoring.	2026-01-01 00:00:00	\N	t	2026-09-05 09:56:48.389907
\.


--
-- Data for Name: point_rules; Type: TABLE DATA; Schema: public; Owner: yogayjain
--

COPY public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) FROM stdin;
RULE-MEETUP-ATTENDANCE	MEETUP_ATTENDANCE	TSJ-2026-v1	meetup	result	Attendance	5	TEAM	TEAM_ACTIVITY	5 points per team member present at verified bi-weekly meetup	t	2026-09-05 09:56:48.391389
RULE-WEEKLY-WINNER	WEEKLY_CHALLENGE_WINNER	TSJ-2026-v1	weekly_challenge	result	Winner	30	TEAM	TEAM_ACTIVITY	Weekly Challenge Winner: 30 points awarded to team	t	2026-09-05 09:56:48.39139
RULE-WEEKLY-RUNNER-UP	WEEKLY_CHALLENGE_RUNNER_UP	TSJ-2026-v1	weekly_challenge	result	Runner-up	15	TEAM	TEAM_ACTIVITY	Weekly Challenge Runner-up: 15 points awarded to team	t	2026-09-05 09:56:48.391391
RULE-WEEKLY-PARTICIPATION	WEEKLY_CHALLENGE_PARTICIPATION	TSJ-2026-v1	weekly_challenge	result	Participation	5	TEAM	TEAM_ACTIVITY	Weekly Challenge Participation: 5 points awarded to team	t	2026-09-05 09:56:48.391391
RULE-SOCIETY-BASIC	SOCIETY_PROJECT_BASIC	TSJ-2026-v1	project	result	Basic	10	TEAM	TEAM_ACTIVITY	Society Project Basic tier: 10 points	t	2026-09-05 09:56:48.391391
RULE-SOCIETY-INTERMEDIATE	SOCIETY_PROJECT_INTERMEDIATE	TSJ-2026-v1	project	result	Intermediate	20	TEAM	TEAM_ACTIVITY	Society Project Intermediate tier: 20 points	t	2026-09-05 09:56:48.391392
RULE-SOCIETY-ADVANCED	SOCIETY_PROJECT_ADVANCED	TSJ-2026-v1	project	result	Advanced	30	TEAM	TEAM_ACTIVITY	Society Project Advanced tier: 30 points	t	2026-09-05 09:56:48.391392
RULE-HACK-1ST	EXTERNAL_HACKATHON_1ST	TSJ-2026-v1	hackathon	result	1st Place	50	TEAM	TEAM_ACTIVITY	External Hackathon 1st Place: 50 points	t	2026-09-05 09:56:48.391393
RULE-HACK-2ND	EXTERNAL_HACKATHON_2ND	TSJ-2026-v1	hackathon	result	2nd Place	30	TEAM	TEAM_ACTIVITY	External Hackathon 2nd Place: 30 points	t	2026-09-05 09:56:48.391393
RULE-HACK-3RD	EXTERNAL_HACKATHON_3RD	TSJ-2026-v1	hackathon	result	3rd Place	20	TEAM	TEAM_ACTIVITY	External Hackathon 3rd Place: 20 points	t	2026-09-05 09:56:48.391393
RULE-HACK-PARTICIPATION	EXTERNAL_HACKATHON_PARTICIPATION	TSJ-2026-v1	hackathon	result	Participation	10	TEAM	TEAM_ACTIVITY	External Hackathon Participation: 10 points	t	2026-09-05 09:56:48.391394
RULE-OSS-RAISED	OPEN_SOURCE_PR_RAISED	TSJ-2026-v1	open_source	result	PR Raised	10	TEAM	TEAM_ACTIVITY	Open Source PR Raised: 10 points	t	2026-09-05 09:56:48.391394
RULE-OSS-MERGED-EXT	OPEN_SOURCE_PR_MERGED_EXTERNAL	TSJ-2026-v1	open_source	result	PR Merged in External Public Repository	20	TEAM	TEAM_ACTIVITY	PR Merged in External Public Repository: 20 points	t	2026-09-05 09:56:48.391395
RULE-OSS-MERGED-SOC	OPEN_SOURCE_PR_MERGED_SOCIETY	TSJ-2026-v1	open_source	result	PR Merged in Society Repository	25	TEAM	TEAM_ACTIVITY	PR Merged in Society Repository: 25 points	t	2026-09-05 09:56:48.391395
RULE-FINAL-WINNER	FINAL_PROJECT_WINNER	TSJ-2026-v1	final_project	result	Winner	250	TEAM	TEAM_ACTIVITY	Final Project Winner: 250 points	t	2026-09-05 09:56:48.391395
RULE-FINAL-RUNNER-UP	FINAL_PROJECT_RUNNER_UP	TSJ-2026-v1	final_project	result	Runner-up	100	TEAM	TEAM_ACTIVITY	Final Project Runner-up: 100 points	t	2026-09-05 09:56:48.391396
RULE-FINAL-PARTICIPATING	FINAL_PROJECT_PARTICIPATING	TSJ-2026-v1	final_project	result	Other Participating Team	50	TEAM	TEAM_ACTIVITY	Final Project Other Participating Team: 50 points	t	2026-09-05 09:56:48.391396
RULE-DSA-7-DAY	DSA_7_DAY_STREAK	TSJ-2026-v1	dsa	result	7-Day DSA Streak	20	INDIVIDUAL_AND_TEAM	INDIVIDUAL_CONTRIBUTION	7-Day DSA Streak: +20 Individual, +20 Team	t	2026-09-05 09:56:48.391397
RULE-DSA-MONTHLY	DSA_MONTHLY_STREAK	TSJ-2026-v1	dsa	result	Monthly DSA Streak	100	INDIVIDUAL_AND_TEAM	INDIVIDUAL_CONTRIBUTION	Monthly DSA Streak: +100 Individual, +100 Team	t	2026-09-05 09:56:48.391397
RULE-RESEARCH-PAPER	RESEARCH_PAPER	TSJ-2026-v1	publication	result	Publication / Submission	50	INDIVIDUAL_AND_TEAM	INDIVIDUAL_CONTRIBUTION	Research Paper Publication / Submission: +50 Individual, +50 Team	t	2026-09-05 09:56:48.391397
RULE-TECH-TALK	TECH_TALK	TSJ-2026-v1	tech_talk	result	Tech Talk Delivery	15	INDIVIDUAL_AND_TEAM	INDIVIDUAL_CONTRIBUTION	Tech Talk Delivery: +15 Individual, +15 Team	t	2026-09-05 09:56:48.391398
RULE-BLOG-ARTICLE	BLOG_ARTICLE	TSJ-2026-v1	blog	result	Blog / Article Publication	10	INDIVIDUAL_AND_TEAM	INDIVIDUAL_CONTRIBUTION	Blog / Article Publication: +10 Individual, +10 Team	t	2026-09-05 09:56:48.391398
RULE-EXTERNAL-EVENT	EXTERNAL_EVENT	TSJ-2026-v1	external_event	result	External Event Participation	10	INDIVIDUAL_AND_TEAM	INDIVIDUAL_CONTRIBUTION	External Event Participation: +10 Individual, +10 Team	t	2026-09-05 09:56:48.391399
RULE-SPRINT-WINNER	SPRINT_WINNER	TSJ-2026-v1	sprint_track	result	Winner	25	INDIVIDUAL_AND_TEAM	SPRINT_TRACK	Sprint Track Winner: +25 Individual, +25 Team	t	2026-09-05 09:56:48.391399
RULE-SPRINT-RUNNER-UP	SPRINT_RUNNER_UP	TSJ-2026-v1	sprint_track	result	Runner-up	15	INDIVIDUAL_AND_TEAM	SPRINT_TRACK	Sprint Track Runner-up: +15 Individual, +15 Team	t	2026-09-05 09:56:48.391399
RULE-SPRINT-PARTICIPATION	SPRINT_PARTICIPATION	TSJ-2026-v1	sprint_track	result	Participation	8	INDIVIDUAL_AND_TEAM	SPRINT_TRACK	Sprint Track Participation: +8 Individual, +8 Team	t	2026-09-05 09:56:48.3914
RULE-FULL-TRACK-STREAK	FULL_TRACK_STREAK	TSJ-2026-v1	sprint_track	result	Full Track Streak	30	INDIVIDUAL_AND_TEAM	SPRINT_TRACK	Full Track Streak One-Time Bonus: +30 Individual, +30 Team	t	2026-09-05 09:56:48.3914
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: yogayjain
--

COPY public.teams (id, name, department_id, created_at) FROM stdin;
ASCEND	ASCEND	dept-cse	2026-09-05 09:56:48.212002
NOVA	Team Nova	dept-ece	2026-09-05 09:56:48.212004
TITANS	Titans	dept-aids	2026-09-05 09:56:48.212005
VORTEX	Vortex	dept-mech	2026-09-05 09:56:48.212005
APEX	Apex Squad	dept-cse	2026-09-05 09:56:48.212006
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: yogayjain
--

COPY public.users (id, name, email, hashed_password, role, sprint_track, department_id, team_id, created_at, status, access_code_hash, enrollment_number, branch, section, department) FROM stdin;
usr-autoverify-engine	ASCEND AutoVerify Engine	autoverify@ascend.internal	system-hash	ADMIN	\N	\N	\N	2026-09-11 14:49:25.158089	APPROVED	\N	\N	\N	\N	\N
usr-admin-sarthak	Sarthak	sarthak@ascend.team	$argon2id$v=19$m=19456,t=2,p=1$c2FydGhhazIwMjY$Jp29iB23K8lS7oI0UqZ7wQ	ADMIN	\N	\N	\N	2026-09-12 11:11:05.242216	APPROVED	123456	\N	\N	\N	\N
\.


--
-- PostgreSQL database dump complete
--

\unrestrict PImplO3SYTAXHBNrZP4psZLUZtwDEmgg0cTnofBmK62RKS9JmvhX7Qg8aEuiLpB

