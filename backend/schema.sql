--
-- PostgreSQL database dump
--

\restrict RwHu1Otk9bySS54Q9M4LX3nQ8ehZlhOI6HXjehuTgO0vsJjUadkpwv8BaprUxIC

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


ALTER TYPE public.achievementstatusenum OWNER TO yogayjain;

--
-- Name: ledgerscopeenum; Type: TYPE; Schema: public; Owner: yogayjain
--

CREATE TYPE public.ledgerscopeenum AS ENUM (
    'INDIVIDUAL',
    'TEAM'
);


ALTER TYPE public.ledgerscopeenum OWNER TO yogayjain;

--
-- Name: ledgerstatusenum; Type: TYPE; Schema: public; Owner: yogayjain
--

CREATE TYPE public.ledgerstatusenum AS ENUM (
    'APPLIED',
    'REVERSED'
);


ALTER TYPE public.ledgerstatusenum OWNER TO yogayjain;

--
-- Name: roleenum; Type: TYPE; Schema: public; Owner: yogayjain
--

CREATE TYPE public.roleenum AS ENUM (
    'MEMBER',
    'CORE_MEMBER',
    'ADMIN'
);


ALTER TYPE public.roleenum OWNER TO yogayjain;

--
-- Name: sprinttrackenum; Type: TYPE; Schema: public; Owner: yogayjain
--

CREATE TYPE public.sprinttrackenum AS ENUM (
    'CODE_TRACK',
    'OPEN_SOURCE_TRACK',
    'BUILD_TRACK',
    'PITCH_TRACK'
);


ALTER TYPE public.sprinttrackenum OWNER TO yogayjain;

--
-- Name: syncstatusenum; Type: TYPE; Schema: public; Owner: yogayjain
--

CREATE TYPE public.syncstatusenum AS ENUM (
    'READY',
    'SYNCING',
    'SYNCED',
    'FAILED'
);


ALTER TYPE public.syncstatusenum OWNER TO yogayjain;

--
-- Name: verificationdecisionenum; Type: TYPE; Schema: public; Owner: yogayjain
--

CREATE TYPE public.verificationdecisionenum AS ENUM (
    'VERIFIED',
    'NEEDS_MORE_PROOF',
    'REJECTED'
);


ALTER TYPE public.verificationdecisionenum OWNER TO yogayjain;

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


ALTER TABLE public.access_requests OWNER TO yogayjain;

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


ALTER TABLE public.achievement_categories OWNER TO yogayjain;

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


ALTER TABLE public.achievement_proofs OWNER TO yogayjain;

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


ALTER TABLE public.achievements OWNER TO yogayjain;

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


ALTER TABLE public.audit_logs OWNER TO yogayjain;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.departments (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20) NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.departments OWNER TO yogayjain;

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


ALTER TABLE public.email_otps OWNER TO yogayjain;

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


ALTER TABLE public.integration_events OWNER TO yogayjain;

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


ALTER TABLE public.meetup_attendance OWNER TO yogayjain;

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


ALTER TABLE public.penalty_records OWNER TO yogayjain;

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


ALTER TABLE public.point_calculations OWNER TO yogayjain;

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


ALTER TABLE public.point_ledger OWNER TO yogayjain;

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


ALTER TABLE public.point_rule_versions OWNER TO yogayjain;

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


ALTER TABLE public.point_rules OWNER TO yogayjain;

--
-- Name: teams; Type: TABLE; Schema: public; Owner: yogayjain
--

CREATE TABLE public.teams (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    department_id character varying(50),
    created_at timestamp without time zone
);


ALTER TABLE public.teams OWNER TO yogayjain;

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


ALTER TABLE public.users OWNER TO yogayjain;

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


ALTER TABLE public.verification_records OWNER TO yogayjain;

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

\unrestrict RwHu1Otk9bySS54Q9M4LX3nQ8ehZlhOI6HXjehuTgO0vsJjUadkpwv8BaprUxIC

