--
-- PostgreSQL database dump
--


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
-- Name: achievementstatusenum; Type: TYPE; Schema: public; Owner: yogayjain
--

CREATE TYPE public.achievementstatusenum AS ENUM (
    'SUBMITTED',
    'UNDER_REVIEW',
    'NEEDS_MORE_PROOF',
    'VERIFIED',
    'REJECTED'
);



--
-- Name: ledgerscopeenum; Type: TYPE; Schema: public; Owner: yogayjain
--

CREATE TYPE public.ledgerscopeenum AS ENUM (
    'INDIVIDUAL',
    'TEAM'
);



--
-- Name: ledgerstatusenum; Type: TYPE; Schema: public; Owner: yogayjain
--

CREATE TYPE public.ledgerstatusenum AS ENUM (
    'APPLIED',
    'REVERSED'
);



--
-- Name: roleenum; Type: TYPE; Schema: public; Owner: yogayjain
--

CREATE TYPE public.roleenum AS ENUM (
    'MEMBER',
    'CORE_MEMBER',
    'ADMIN'
);



--
-- Name: sprinttrackenum; Type: TYPE; Schema: public; Owner: yogayjain
--

CREATE TYPE public.sprinttrackenum AS ENUM (
    'CODE_TRACK',
    'OPEN_SOURCE_TRACK',
    'BUILD_TRACK',
    'PITCH_TRACK'
);



--
-- Name: syncstatusenum; Type: TYPE; Schema: public; Owner: yogayjain
--

CREATE TYPE public.syncstatusenum AS ENUM (
    'READY',
    'SYNCING',
    'SYNCED',
    'FAILED'
);



--
-- Name: verificationdecisionenum; Type: TYPE; Schema: public; Owner: yogayjain
--

CREATE TYPE public.verificationdecisionenum AS ENUM (
    'VERIFIED',
    'NEEDS_MORE_PROOF',
    'REJECTED'
);



SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: access_requests; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.access_requests (
    id character varying(50) NOT NULL,
    user_id character varying(50),
    email character varying(120) NOT NULL,
    name character varying(100) NOT NULL,
    requested_at timestamp without time zone DEFAULT now(),
    reviewed_at timestamp without time zone,
    reviewed_by character varying(50),
    status character varying(20) DEFAULT 'PENDING'::character varying,
    enrollment_number character varying(100),
    branch character varying(100),
    section character varying(50),
    department character varying(100),
    reason text
);



--
-- Name: achievement_categories; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.achievement_categories (
    id character varying(50) NOT NULL,
    slug character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon character varying(50),
    required_fields json NOT NULL,
    is_active integer,
    created_at timestamp without time zone
);



--
-- Name: achievement_proofs; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.achievement_proofs (
    id character varying(50) NOT NULL,
    achievement_id character varying(50),
    file_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    mime_type character varying(100) NOT NULL,
    file_size_bytes integer NOT NULL,
    file_hash_sha256 character varying(64) NOT NULL,
    ai_extracted json,
    duplicate_check json,
    uploaded_at timestamp without time zone
);



--
-- Name: achievements; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.achievements (
    id character varying(50) NOT NULL,
    user_id character varying(50) NOT NULL,
    team_id character varying(50) NOT NULL,
    category_id character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    achievement_date character varying(50) NOT NULL,
    metadata_json json NOT NULL,
    status public.achievementstatusenum NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);



--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.audit_logs (
    id character varying(50) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id character varying(50) NOT NULL,
    actor_id character varying(50) NOT NULL,
    actor_name character varying(100),
    actor_role character varying(50),
    action character varying(100) NOT NULL,
    details json,
    "timestamp" timestamp without time zone
);



--
-- Name: departments; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.departments (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20) NOT NULL,
    created_at timestamp without time zone
);



--
-- Name: email_otps; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.email_otps (
    id character varying(50) NOT NULL,
    email character varying(120) NOT NULL,
    otp_hash character varying(255) NOT NULL,
    attempts integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone NOT NULL,
    consumed boolean DEFAULT false,
    dev_code character varying(10)
);



--
-- Name: integration_events; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.integration_events (
    id character varying(50) NOT NULL,
    achievement_id character varying(50) NOT NULL,
    sync_status public.syncstatusenum NOT NULL,
    attempt_count integer,
    last_attempt_at timestamp without time zone,
    external_reference_id character varying(100),
    payload json,
    error_message text,
    created_at timestamp without time zone
);



--
-- Name: meetup_attendance; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.meetup_attendance (
    id character varying(50) NOT NULL,
    meetup_id character varying(50) NOT NULL,
    team_id character varying(50) NOT NULL,
    member_id character varying(50) NOT NULL,
    meetup_date character varying(50) NOT NULL,
    verified_by character varying(50) NOT NULL,
    verified_at timestamp without time zone
);



--
-- Name: penalty_records; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.penalty_records (
    id character varying(50) NOT NULL,
    achievement_id character varying(50) NOT NULL,
    team_id character varying(50) NOT NULL,
    original_points integer NOT NULL,
    penalty_rate double precision NOT NULL,
    penalty_points integer NOT NULL,
    final_team_points integer NOT NULL,
    reason text NOT NULL,
    verified_by character varying(50) NOT NULL,
    applied_at timestamp without time zone
);



--
-- Name: point_calculations; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.point_calculations (
    id character varying(50) NOT NULL,
    achievement_id character varying(50) NOT NULL,
    rule_id character varying(100) NOT NULL,
    rule_version character varying(50) NOT NULL,
    points integer NOT NULL,
    calculated_at timestamp without time zone
);



--
-- Name: point_ledger; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.point_ledger (
    id character varying(50) NOT NULL,
    achievement_id character varying(50),
    member_id character varying(50),
    team_id character varying(50) NOT NULL,
    source_type character varying(50) NOT NULL,
    source_id character varying(100) NOT NULL,
    rule_id character varying(100) NOT NULL,
    rule_version character varying(50) NOT NULL,
    base_points integer NOT NULL,
    bonus_points integer NOT NULL,
    penalty_points integer NOT NULL,
    final_points integer NOT NULL,
    scope public.ledgerscopeenum NOT NULL,
    status public.ledgerstatusenum NOT NULL,
    created_at timestamp without time zone,
    created_by character varying(100) NOT NULL
);



--
-- Name: point_rule_versions; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.point_rule_versions (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    effective_from timestamp without time zone,
    effective_to timestamp without time zone,
    is_active boolean,
    created_at timestamp without time zone
);



--
-- Name: point_rules; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.point_rules (
    id character varying(100) NOT NULL,
    rule_code character varying(100),
    version_id character varying(50) NOT NULL,
    category_slug character varying(50) NOT NULL,
    condition_key character varying(50) NOT NULL,
    condition_val character varying(100) NOT NULL,
    points integer NOT NULL,
    scope character varying(50) NOT NULL,
    activity_type character varying(50) NOT NULL,
    description character varying(255),
    is_active boolean,
    created_at timestamp without time zone
);



--
-- Name: teams; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.teams (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    department_id character varying(50),
    created_at timestamp without time zone
);



--
-- Name: users; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.users (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(120) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    role public.roleenum NOT NULL,
    sprint_track public.sprinttrackenum,
    department_id character varying(50),
    team_id character varying(50),
    created_at timestamp without time zone,
    status character varying(20) DEFAULT 'APPROVED'::character varying,
    access_code_hash character varying(255),
    enrollment_number character varying(100),
    branch character varying(100),
    section character varying(50),
    department character varying(100)
);



--
-- Name: verification_records; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.verification_records (
    id character varying(50) NOT NULL,
    achievement_id character varying(50) NOT NULL,
    verifier_id character varying(50) NOT NULL,
    decision public.verificationdecisionenum NOT NULL,
    reason text,
    rule_id_applied character varying(100),
    verified_at timestamp without time zone
);



--
-- Name: access_requests access_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.access_requests
    ADD CONSTRAINT access_requests_pkey PRIMARY KEY (id);


--
-- Name: achievement_categories achievement_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.achievement_categories
    ADD CONSTRAINT achievement_categories_pkey PRIMARY KEY (id);


--
-- Name: achievement_proofs achievement_proofs_pkey; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.achievement_proofs
    ADD CONSTRAINT achievement_proofs_pkey PRIMARY KEY (id);


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: departments departments_code_key; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_code_key UNIQUE (code);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: email_otps email_otps_pkey; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.email_otps
    ADD CONSTRAINT email_otps_pkey PRIMARY KEY (id);


--
-- Name: integration_events integration_events_pkey; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.integration_events
    ADD CONSTRAINT integration_events_pkey PRIMARY KEY (id);


--
-- Name: meetup_attendance meetup_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.meetup_attendance
    ADD CONSTRAINT meetup_attendance_pkey PRIMARY KEY (id);


--
-- Name: penalty_records penalty_records_pkey; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.penalty_records
    ADD CONSTRAINT penalty_records_pkey PRIMARY KEY (id);


--
-- Name: point_calculations point_calculations_pkey; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.point_calculations
    ADD CONSTRAINT point_calculations_pkey PRIMARY KEY (id);


--
-- Name: point_ledger point_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.point_ledger
    ADD CONSTRAINT point_ledger_pkey PRIMARY KEY (id);


--
-- Name: point_rule_versions point_rule_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.point_rule_versions
    ADD CONSTRAINT point_rule_versions_pkey PRIMARY KEY (id);


--
-- Name: point_rules point_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.point_rules
    ADD CONSTRAINT point_rules_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: point_ledger uq_source_scope_double_counting; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.point_ledger
    ADD CONSTRAINT uq_source_scope_double_counting UNIQUE (source_type, source_id, scope);


--
-- Name: meetup_attendance uq_team_meetup_member; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.meetup_attendance
    ADD CONSTRAINT uq_team_meetup_member UNIQUE (team_id, meetup_id, member_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: verification_records verification_records_pkey; Type: CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.verification_records
    ADD CONSTRAINT verification_records_pkey PRIMARY KEY (id);


--
-- Name: ix_access_requests_status; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_access_requests_status ON public.access_requests USING btree (status);


--
-- Name: ix_achievement_categories_slug; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE UNIQUE INDEX ix_achievement_categories_slug ON public.achievement_categories USING btree (slug);


--
-- Name: ix_achievement_proofs_achievement_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_achievement_proofs_achievement_id ON public.achievement_proofs USING btree (achievement_id);


--
-- Name: ix_achievement_proofs_file_hash_sha256; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_achievement_proofs_file_hash_sha256 ON public.achievement_proofs USING btree (file_hash_sha256);


--
-- Name: ix_achievements_category_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_achievements_category_id ON public.achievements USING btree (category_id);


--
-- Name: ix_achievements_created_at; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_achievements_created_at ON public.achievements USING btree (created_at);


--
-- Name: ix_achievements_status; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_achievements_status ON public.achievements USING btree (status);


--
-- Name: ix_achievements_team_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_achievements_team_id ON public.achievements USING btree (team_id);


--
-- Name: ix_achievements_user_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_achievements_user_id ON public.achievements USING btree (user_id);


--
-- Name: ix_audit_logs_action; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: ix_audit_logs_actor_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_audit_logs_actor_id ON public.audit_logs USING btree (actor_id);


--
-- Name: ix_audit_logs_entity_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_audit_logs_entity_id ON public.audit_logs USING btree (entity_id);


--
-- Name: ix_audit_logs_entity_type; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_audit_logs_entity_type ON public.audit_logs USING btree (entity_type);


--
-- Name: ix_audit_logs_timestamp; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_audit_logs_timestamp ON public.audit_logs USING btree ("timestamp");


--
-- Name: ix_email_otps_email; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_email_otps_email ON public.email_otps USING btree (email);


--
-- Name: ix_integration_events_achievement_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE UNIQUE INDEX ix_integration_events_achievement_id ON public.integration_events USING btree (achievement_id);


--
-- Name: ix_integration_events_external_reference_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_integration_events_external_reference_id ON public.integration_events USING btree (external_reference_id);


--
-- Name: ix_integration_events_sync_status; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_integration_events_sync_status ON public.integration_events USING btree (sync_status);


--
-- Name: ix_meetup_attendance_meetup_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_meetup_attendance_meetup_id ON public.meetup_attendance USING btree (meetup_id);


--
-- Name: ix_meetup_attendance_member_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_meetup_attendance_member_id ON public.meetup_attendance USING btree (member_id);


--
-- Name: ix_meetup_attendance_team_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_meetup_attendance_team_id ON public.meetup_attendance USING btree (team_id);


--
-- Name: ix_penalty_records_achievement_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_penalty_records_achievement_id ON public.penalty_records USING btree (achievement_id);


--
-- Name: ix_penalty_records_applied_at; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_penalty_records_applied_at ON public.penalty_records USING btree (applied_at);


--
-- Name: ix_penalty_records_team_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_penalty_records_team_id ON public.penalty_records USING btree (team_id);


--
-- Name: ix_point_calculations_achievement_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE UNIQUE INDEX ix_point_calculations_achievement_id ON public.point_calculations USING btree (achievement_id);


--
-- Name: ix_point_ledger_achievement_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_point_ledger_achievement_id ON public.point_ledger USING btree (achievement_id);


--
-- Name: ix_point_ledger_created_at; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_point_ledger_created_at ON public.point_ledger USING btree (created_at);


--
-- Name: ix_point_ledger_member_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_point_ledger_member_id ON public.point_ledger USING btree (member_id);


--
-- Name: ix_point_ledger_scope; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_point_ledger_scope ON public.point_ledger USING btree (scope);


--
-- Name: ix_point_ledger_source_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_point_ledger_source_id ON public.point_ledger USING btree (source_id);


--
-- Name: ix_point_ledger_source_type; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_point_ledger_source_type ON public.point_ledger USING btree (source_type);


--
-- Name: ix_point_ledger_team_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_point_ledger_team_id ON public.point_ledger USING btree (team_id);


--
-- Name: ix_point_rules_category_slug; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_point_rules_category_slug ON public.point_rules USING btree (category_slug);


--
-- Name: ix_point_rules_rule_code; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_point_rules_rule_code ON public.point_rules USING btree (rule_code);


--
-- Name: ix_point_rules_version_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_point_rules_version_id ON public.point_rules USING btree (version_id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_role; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_users_role ON public.users USING btree (role);


--
-- Name: ix_verification_records_achievement_id; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_verification_records_achievement_id ON public.verification_records USING btree (achievement_id);


--
-- Name: ix_verification_records_verified_at; Type: INDEX; Schema: public; Owner: yogayjain
--

CREATE INDEX ix_verification_records_verified_at ON public.verification_records USING btree (verified_at);


--
-- Name: access_requests access_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.access_requests
    ADD CONSTRAINT access_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: achievement_proofs achievement_proofs_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.achievement_proofs
    ADD CONSTRAINT achievement_proofs_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id);


--
-- Name: achievements achievements_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.achievement_categories(id);


--
-- Name: achievements achievements_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: achievements achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: integration_events integration_events_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.integration_events
    ADD CONSTRAINT integration_events_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id);


--
-- Name: meetup_attendance meetup_attendance_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.meetup_attendance
    ADD CONSTRAINT meetup_attendance_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.users(id);


--
-- Name: meetup_attendance meetup_attendance_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.meetup_attendance
    ADD CONSTRAINT meetup_attendance_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: meetup_attendance meetup_attendance_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.meetup_attendance
    ADD CONSTRAINT meetup_attendance_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- Name: penalty_records penalty_records_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.penalty_records
    ADD CONSTRAINT penalty_records_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id);


--
-- Name: penalty_records penalty_records_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.penalty_records
    ADD CONSTRAINT penalty_records_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: penalty_records penalty_records_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.penalty_records
    ADD CONSTRAINT penalty_records_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- Name: point_calculations point_calculations_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.point_calculations
    ADD CONSTRAINT point_calculations_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id);


--
-- Name: point_calculations point_calculations_rule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.point_calculations
    ADD CONSTRAINT point_calculations_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES public.point_rules(id);


--
-- Name: point_ledger point_ledger_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.point_ledger
    ADD CONSTRAINT point_ledger_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.users(id);


--
-- Name: point_ledger point_ledger_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.point_ledger
    ADD CONSTRAINT point_ledger_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: point_rules point_rules_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.point_rules
    ADD CONSTRAINT point_rules_version_id_fkey FOREIGN KEY (version_id) REFERENCES public.point_rule_versions(id);


--
-- Name: teams teams_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: users users_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: verification_records verification_records_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.verification_records
    ADD CONSTRAINT verification_records_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id);


--
-- Name: verification_records verification_records_rule_id_applied_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.verification_records
    ADD CONSTRAINT verification_records_rule_id_applied_fkey FOREIGN KEY (rule_id_applied) REFERENCES public.point_rules(id);


--
-- Name: verification_records verification_records_verifier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: yogayjain
--

ALTER TABLE ONLY public.verification_records
    ADD CONSTRAINT verification_records_verifier_id_fkey FOREIGN KEY (verifier_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--


--
-- PostgreSQL database dump
--


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

INSERT INTO public.achievement_categories (id, slug, name, description, icon, required_fields, is_active, created_at) VALUES ('cat-hackathon', 'hackathon', 'External Hackathon', 'Competitive hackathons. 1st: 50, 2nd: 30, 3rd: 20, Participation: 10', 'Trophy', '[{"name": "event_name", "label": "Event Name", "type": "text", "required": true, "placeholder": "e.g., HackZurich 2026"}, {"name": "organization", "label": "Organizing Body", "type": "text", "required": true, "placeholder": "e.g., ETH Zurich"}, {"name": "result", "label": "Placement Result", "type": "select", "required": true, "options": ["1st Place", "2nd Place", "3rd Place", "Participation"]}, {"name": "project_repo", "label": "Project Repository / Demo Link", "type": "url", "required": false}]', '1', '2026-09-05 09:56:48.388218');
INSERT INTO public.achievement_categories (id, slug, name, description, icon, required_fields, is_active, created_at) VALUES ('cat-weekly', 'weekly_challenge', 'Weekly Challenge', 'Official weekly sprint challenge. Winner: 30, Runner-up: 15, Participation: 5', 'Flame', '[{"name": "challenge_id", "label": "Challenge Name / ID", "type": "text", "required": true, "placeholder": "e.g., Sprint Week 03 Challenge"}, {"name": "organization", "label": "Admin Review Body", "type": "text", "required": true, "placeholder": "Core Tech Council"}, {"name": "result", "label": "Award Placement", "type": "select", "required": true, "options": ["Winner", "Runner-up", "Participation"]}]', '1', '2026-09-05 09:56:48.38822');
INSERT INTO public.achievement_categories (id, slug, name, description, icon, required_fields, is_active, created_at) VALUES ('cat-project', 'project', 'Society Project', 'Official society engineering projects. Basic: 10, Intermediate: 20, Advanced: 30', 'Code', '[{"name": "event_name", "label": "Project Name", "type": "text", "required": true, "placeholder": "e.g., ASCEND Gateway Engine"}, {"name": "organization", "label": "Host Society / Unit", "type": "text", "required": true, "placeholder": "e.g., Tech Society"}, {"name": "result", "label": "Project Evaluation Tier", "type": "select", "required": true, "options": ["Basic", "Intermediate", "Advanced"]}, {"name": "role", "label": "Your Technical Role", "type": "text", "required": true, "placeholder": "e.g., Backend Lead"}]', '1', '2026-09-05 09:56:48.38822');
INSERT INTO public.achievement_categories (id, slug, name, description, icon, required_fields, is_active, created_at) VALUES ('cat-oss', 'open_source', 'Open Source', 'PR Raised: 10, PR Merged External: 20, PR Merged Society Repo: 25', 'GitPullRequest', '[{"name": "event_name", "label": "Repository Name", "type": "text", "required": true, "placeholder": "e.g., fastapi/fastapi"}, {"name": "repository_type", "label": "Repository Type", "type": "select", "required": true, "options": ["External Public Repository", "Society Repository"]}, {"name": "pull_request_status", "label": "Pull Request Status", "type": "select", "required": true, "options": ["PR Raised", "PR Merged"]}, {"name": "result", "label": "Classification Tier", "type": "select", "required": true, "options": ["PR Raised", "PR Merged in External Public Repository", "PR Merged in Society Repository"]}, {"name": "pr_url", "label": "Pull Request URL", "type": "url", "required": true}]', '1', '2026-09-05 09:56:48.388221');
INSERT INTO public.achievement_categories (id, slug, name, description, icon, required_fields, is_active, created_at) VALUES ('cat-dsa', 'dsa', 'DSA Streak', 'Continuous competitive programming streak. 7-Day: 20 pts, Monthly: 100 pts (Individual + Team)', 'Award', '[{"name": "event_name", "label": "Platform", "type": "text", "required": true, "placeholder": "e.g., LeetCode / Codeforces"}, {"name": "organization", "label": "Verification Platform", "type": "text", "required": true, "placeholder": "e.g., LeetCode Daily Challenge"}, {"name": "result", "label": "Streak Duration", "type": "select", "required": true, "options": ["7-Day DSA Streak", "Monthly DSA Streak"]}, {"name": "profile_url", "label": "Public Profile URL", "type": "url", "required": true}]', '1', '2026-09-05 09:56:48.388221');
INSERT INTO public.achievement_categories (id, slug, name, description, icon, required_fields, is_active, created_at) VALUES ('cat-paper', 'publication', 'Research Paper', 'Publication / Submission of technical research paper: 50 pts (Individual + Team)', 'BookOpen', '[{"name": "event_name", "label": "Paper Title", "type": "text", "required": true}, {"name": "organization", "label": "Publisher / Journal / Conference", "type": "text", "required": true}, {"name": "result", "label": "Status", "type": "select", "required": true, "options": ["Publication / Submission"]}, {"name": "doi", "label": "DOI / Paper Link", "type": "text", "required": false}]', '1', '2026-09-05 09:56:48.388221');
INSERT INTO public.achievement_categories (id, slug, name, description, icon, required_fields, is_active, created_at) VALUES ('cat-talk', 'tech_talk', 'Tech Talk', 'Delivery of technical keynote or workshop: 15 pts (Individual + Team)', 'Users', '[{"name": "event_name", "label": "Talk Title", "type": "text", "required": true}, {"name": "organization", "label": "Host Body / Venue", "type": "text", "required": true}, {"name": "result", "label": "Delivery Status", "type": "select", "required": true, "options": ["Tech Talk Delivery"]}]', '1', '2026-09-05 09:56:48.388222');
INSERT INTO public.achievement_categories (id, slug, name, description, icon, required_fields, is_active, created_at) VALUES ('cat-blog', 'blog', 'Blog / Article', 'Technical publication on Medium / Substack / Dev.to: 10 pts (Individual + Team)', 'FileText', '[{"name": "event_name", "label": "Article Title", "type": "text", "required": true}, {"name": "organization", "label": "Publication Platform", "type": "text", "required": true}, {"name": "result", "label": "Status", "type": "select", "required": true, "options": ["Blog / Article Publication"]}, {"name": "article_url", "label": "Public Article URL", "type": "url", "required": true}]', '1', '2026-09-05 09:56:48.388222');
INSERT INTO public.achievement_categories (id, slug, name, description, icon, required_fields, is_active, created_at) VALUES ('cat-event', 'external_event', 'External Event', 'Attendance / Participation in approved technical event: 10 pts (Individual + Team)', 'Compass', '[{"name": "event_name", "label": "Event Name", "type": "text", "required": true}, {"name": "organization", "label": "Organizer", "type": "text", "required": true}, {"name": "result", "label": "Participation", "type": "select", "required": true, "options": ["External Event Participation"]}]', '1', '2026-09-05 09:56:48.388223');
INSERT INTO public.achievement_categories (id, slug, name, description, icon, required_fields, is_active, created_at) VALUES ('cat-track', 'sprint_track', 'Sprint Track Scoring', 'Track scoring: Winner 25, Runner-up 15, Participation 8, Full Track Streak 30 (Individual + Team)', 'Trophy', '[{"name": "event_name", "label": "Sprint Track Session", "type": "text", "required": true}, {"name": "organization", "label": "Tech Sprint Committee", "type": "text", "required": true}, {"name": "result", "label": "Result Tier", "type": "select", "required": true, "options": ["Winner", "Runner-up", "Participation", "Full Track Streak"]}]', '1', '2026-09-05 09:56:48.388223');
INSERT INTO public.achievement_categories (id, slug, name, description, icon, required_fields, is_active, created_at) VALUES ('cat-final', 'final_project', 'Final / Major Project', 'End of sprint capstone evaluation. Winner: 250, Runner-up: 100, Other: 50', 'Award', '[{"name": "event_name", "label": "Final Project Title", "type": "text", "required": true}, {"name": "organization", "label": "Judging Panel", "type": "text", "required": true}, {"name": "result", "label": "Final Standing", "type": "select", "required": true, "options": ["Winner", "Runner-up", "Other Participating Team"]}]', '1', '2026-09-05 09:56:48.388224');


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: yogayjain
--

INSERT INTO public.departments (id, name, code, created_at) VALUES ('dept-cse', 'Computer Science & Engineering', 'CSE', '2026-09-05 09:56:48.210314');
INSERT INTO public.departments (id, name, code, created_at) VALUES ('dept-ece', 'Electronics & Communication', 'ECE', '2026-09-05 09:56:48.210322');
INSERT INTO public.departments (id, name, code, created_at) VALUES ('dept-aids', 'Artificial Intelligence & Data Science', 'AIDS', '2026-09-05 09:56:48.210323');
INSERT INTO public.departments (id, name, code, created_at) VALUES ('dept-mech', 'Mechanical Engineering', 'MECH', '2026-09-05 09:56:48.210324');


--
-- Data for Name: point_rule_versions; Type: TABLE DATA; Schema: public; Owner: yogayjain
--

INSERT INTO public.point_rule_versions (id, name, description, effective_from, effective_to, is_active, created_at) VALUES ('TSJ-2026-v1', 'Tech Sprint Journey 2026 — Official Points & Scoring System', 'The official single source of truth for cohort scoring.', '2026-01-01 00:00:00', NULL, 't', '2026-09-05 09:56:48.389907');


--
-- Data for Name: point_rules; Type: TABLE DATA; Schema: public; Owner: yogayjain
--

INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-MEETUP-ATTENDANCE', 'MEETUP_ATTENDANCE', 'TSJ-2026-v1', 'meetup', 'result', 'Attendance', '5', 'TEAM', 'TEAM_ACTIVITY', '5 points per team member present at verified bi-weekly meetup', 't', '2026-09-05 09:56:48.391389');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-WEEKLY-WINNER', 'WEEKLY_CHALLENGE_WINNER', 'TSJ-2026-v1', 'weekly_challenge', 'result', 'Winner', '30', 'TEAM', 'TEAM_ACTIVITY', 'Weekly Challenge Winner: 30 points awarded to team', 't', '2026-09-05 09:56:48.39139');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-WEEKLY-RUNNER-UP', 'WEEKLY_CHALLENGE_RUNNER_UP', 'TSJ-2026-v1', 'weekly_challenge', 'result', 'Runner-up', '15', 'TEAM', 'TEAM_ACTIVITY', 'Weekly Challenge Runner-up: 15 points awarded to team', 't', '2026-09-05 09:56:48.391391');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-WEEKLY-PARTICIPATION', 'WEEKLY_CHALLENGE_PARTICIPATION', 'TSJ-2026-v1', 'weekly_challenge', 'result', 'Participation', '5', 'TEAM', 'TEAM_ACTIVITY', 'Weekly Challenge Participation: 5 points awarded to team', 't', '2026-09-05 09:56:48.391391');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-SOCIETY-BASIC', 'SOCIETY_PROJECT_BASIC', 'TSJ-2026-v1', 'project', 'result', 'Basic', '10', 'TEAM', 'TEAM_ACTIVITY', 'Society Project Basic tier: 10 points', 't', '2026-09-05 09:56:48.391391');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-SOCIETY-INTERMEDIATE', 'SOCIETY_PROJECT_INTERMEDIATE', 'TSJ-2026-v1', 'project', 'result', 'Intermediate', '20', 'TEAM', 'TEAM_ACTIVITY', 'Society Project Intermediate tier: 20 points', 't', '2026-09-05 09:56:48.391392');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-SOCIETY-ADVANCED', 'SOCIETY_PROJECT_ADVANCED', 'TSJ-2026-v1', 'project', 'result', 'Advanced', '30', 'TEAM', 'TEAM_ACTIVITY', 'Society Project Advanced tier: 30 points', 't', '2026-09-05 09:56:48.391392');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-HACK-1ST', 'EXTERNAL_HACKATHON_1ST', 'TSJ-2026-v1', 'hackathon', 'result', '1st Place', '50', 'TEAM', 'TEAM_ACTIVITY', 'External Hackathon 1st Place: 50 points', 't', '2026-09-05 09:56:48.391393');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-HACK-2ND', 'EXTERNAL_HACKATHON_2ND', 'TSJ-2026-v1', 'hackathon', 'result', '2nd Place', '30', 'TEAM', 'TEAM_ACTIVITY', 'External Hackathon 2nd Place: 30 points', 't', '2026-09-05 09:56:48.391393');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-HACK-3RD', 'EXTERNAL_HACKATHON_3RD', 'TSJ-2026-v1', 'hackathon', 'result', '3rd Place', '20', 'TEAM', 'TEAM_ACTIVITY', 'External Hackathon 3rd Place: 20 points', 't', '2026-09-05 09:56:48.391393');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-HACK-PARTICIPATION', 'EXTERNAL_HACKATHON_PARTICIPATION', 'TSJ-2026-v1', 'hackathon', 'result', 'Participation', '10', 'TEAM', 'TEAM_ACTIVITY', 'External Hackathon Participation: 10 points', 't', '2026-09-05 09:56:48.391394');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-OSS-RAISED', 'OPEN_SOURCE_PR_RAISED', 'TSJ-2026-v1', 'open_source', 'result', 'PR Raised', '10', 'TEAM', 'TEAM_ACTIVITY', 'Open Source PR Raised: 10 points', 't', '2026-09-05 09:56:48.391394');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-OSS-MERGED-EXT', 'OPEN_SOURCE_PR_MERGED_EXTERNAL', 'TSJ-2026-v1', 'open_source', 'result', 'PR Merged in External Public Repository', '20', 'TEAM', 'TEAM_ACTIVITY', 'PR Merged in External Public Repository: 20 points', 't', '2026-09-05 09:56:48.391395');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-OSS-MERGED-SOC', 'OPEN_SOURCE_PR_MERGED_SOCIETY', 'TSJ-2026-v1', 'open_source', 'result', 'PR Merged in Society Repository', '25', 'TEAM', 'TEAM_ACTIVITY', 'PR Merged in Society Repository: 25 points', 't', '2026-09-05 09:56:48.391395');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-FINAL-WINNER', 'FINAL_PROJECT_WINNER', 'TSJ-2026-v1', 'final_project', 'result', 'Winner', '250', 'TEAM', 'TEAM_ACTIVITY', 'Final Project Winner: 250 points', 't', '2026-09-05 09:56:48.391395');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-FINAL-RUNNER-UP', 'FINAL_PROJECT_RUNNER_UP', 'TSJ-2026-v1', 'final_project', 'result', 'Runner-up', '100', 'TEAM', 'TEAM_ACTIVITY', 'Final Project Runner-up: 100 points', 't', '2026-09-05 09:56:48.391396');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-FINAL-PARTICIPATING', 'FINAL_PROJECT_PARTICIPATING', 'TSJ-2026-v1', 'final_project', 'result', 'Other Participating Team', '50', 'TEAM', 'TEAM_ACTIVITY', 'Final Project Other Participating Team: 50 points', 't', '2026-09-05 09:56:48.391396');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-DSA-7-DAY', 'DSA_7_DAY_STREAK', 'TSJ-2026-v1', 'dsa', 'result', '7-Day DSA Streak', '20', 'INDIVIDUAL_AND_TEAM', 'INDIVIDUAL_CONTRIBUTION', '7-Day DSA Streak: +20 Individual, +20 Team', 't', '2026-09-05 09:56:48.391397');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-DSA-MONTHLY', 'DSA_MONTHLY_STREAK', 'TSJ-2026-v1', 'dsa', 'result', 'Monthly DSA Streak', '100', 'INDIVIDUAL_AND_TEAM', 'INDIVIDUAL_CONTRIBUTION', 'Monthly DSA Streak: +100 Individual, +100 Team', 't', '2026-09-05 09:56:48.391397');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-RESEARCH-PAPER', 'RESEARCH_PAPER', 'TSJ-2026-v1', 'publication', 'result', 'Publication / Submission', '50', 'INDIVIDUAL_AND_TEAM', 'INDIVIDUAL_CONTRIBUTION', 'Research Paper Publication / Submission: +50 Individual, +50 Team', 't', '2026-09-05 09:56:48.391397');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-TECH-TALK', 'TECH_TALK', 'TSJ-2026-v1', 'tech_talk', 'result', 'Tech Talk Delivery', '15', 'INDIVIDUAL_AND_TEAM', 'INDIVIDUAL_CONTRIBUTION', 'Tech Talk Delivery: +15 Individual, +15 Team', 't', '2026-09-05 09:56:48.391398');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-BLOG-ARTICLE', 'BLOG_ARTICLE', 'TSJ-2026-v1', 'blog', 'result', 'Blog / Article Publication', '10', 'INDIVIDUAL_AND_TEAM', 'INDIVIDUAL_CONTRIBUTION', 'Blog / Article Publication: +10 Individual, +10 Team', 't', '2026-09-05 09:56:48.391398');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-EXTERNAL-EVENT', 'EXTERNAL_EVENT', 'TSJ-2026-v1', 'external_event', 'result', 'External Event Participation', '10', 'INDIVIDUAL_AND_TEAM', 'INDIVIDUAL_CONTRIBUTION', 'External Event Participation: +10 Individual, +10 Team', 't', '2026-09-05 09:56:48.391399');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-SPRINT-WINNER', 'SPRINT_WINNER', 'TSJ-2026-v1', 'sprint_track', 'result', 'Winner', '25', 'INDIVIDUAL_AND_TEAM', 'SPRINT_TRACK', 'Sprint Track Winner: +25 Individual, +25 Team', 't', '2026-09-05 09:56:48.391399');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-SPRINT-RUNNER-UP', 'SPRINT_RUNNER_UP', 'TSJ-2026-v1', 'sprint_track', 'result', 'Runner-up', '15', 'INDIVIDUAL_AND_TEAM', 'SPRINT_TRACK', 'Sprint Track Runner-up: +15 Individual, +15 Team', 't', '2026-09-05 09:56:48.391399');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-SPRINT-PARTICIPATION', 'SPRINT_PARTICIPATION', 'TSJ-2026-v1', 'sprint_track', 'result', 'Participation', '8', 'INDIVIDUAL_AND_TEAM', 'SPRINT_TRACK', 'Sprint Track Participation: +8 Individual, +8 Team', 't', '2026-09-05 09:56:48.3914');
INSERT INTO public.point_rules (id, rule_code, version_id, category_slug, condition_key, condition_val, points, scope, activity_type, description, is_active, created_at) VALUES ('RULE-FULL-TRACK-STREAK', 'FULL_TRACK_STREAK', 'TSJ-2026-v1', 'sprint_track', 'result', 'Full Track Streak', '30', 'INDIVIDUAL_AND_TEAM', 'SPRINT_TRACK', 'Full Track Streak One-Time Bonus: +30 Individual, +30 Team', 't', '2026-09-05 09:56:48.3914');


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: yogayjain
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: yogayjain
--

INSERT INTO public.users (id, name, email, hashed_password, role, sprint_track, department_id, team_id, created_at, status, access_code_hash, enrollment_number, branch, section, department) VALUES ('usr-autoverify-engine', 'ASCEND AutoVerify Engine', 'autoverify@ascend.internal', 'system-hash', 'ADMIN', NULL, NULL, NULL, '2026-09-11 14:49:25.158089', 'APPROVED', NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.users (id, name, email, hashed_password, role, sprint_track, department_id, team_id, created_at, status, access_code_hash, enrollment_number, branch, section, department) VALUES ('usr-admin-sarthak', 'Sarthak', 'sarthak@ascend.team', '$argon2id$v=19$m=19456,t=2,p=1$c2FydGhhazIwMjY$Jp29iB23K8lS7oI0UqZ7wQ', 'ADMIN', NULL, NULL, NULL, '2026-09-12 11:11:05.242216', 'APPROVED', '123456', NULL, NULL, NULL, NULL);


--
-- PostgreSQL database dump complete
--


