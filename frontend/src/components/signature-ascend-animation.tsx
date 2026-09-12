"use client";

import React, { useState, useEffect } from "react";
import AscendLogo from "./ascend-logo";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Sparkles,
  Zap,
  ArrowRight,
  RefreshCw,
  Cpu,
  Lock,
  Layers,
  Award
} from "lucide-react";

export type ScenarioType = "hackathon" | "dsa_ambiguous" | "invalid_poster";

interface ScenarioConfig {
  id: ScenarioType;
  title: string;
  claimCategory: string;
  claimTitle: string;
  claimedResult: string;
  documentType: string;
  fileName: string;
  imagePreviewUrl: string;
  sha256: string;
  expectedOutcome: "AUTO_VERIFIED" | "NEEDS_CORE_REVIEW" | "INVALID_EVIDENCE";
  pointsAwarded: number;
  checks: {
    identity: { label: "Identity Check"; matched: boolean; detail: string };
    achievement: { label: "Category Match"; matched: boolean; detail: string };
    date: { label: "Sprint Date Match"; matched: boolean; detail: string };
    result: { label: "Claim Consistency"; matched: boolean; detail: string };
    source: { label: "Evidence Integrity"; matched: boolean; detail: string };
  };
  explanation: string;
}

const SCENARIOS: Record<ScenarioType, ScenarioConfig> = {
  hackathon: {
    id: "hackathon",
    title: "Scenario 1: Verified Hackathon Winner (AutoVerify)",
    claimCategory: "External Hackathon",
    claimTitle: "Global AI Hackathon 2026",
    claimedResult: "1st Place Winner",
    documentType: "Official Certificate of Excellence",
    fileName: "global_ai_hackathon_winner.jpg",
    imagePreviewUrl: "/demo/winner_certificate.jpg",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    expectedOutcome: "AUTO_VERIFIED",
    pointsAwarded: 50,
    checks: {
      identity: { label: "Identity Check", matched: true, detail: "Sarthak (Admin) verified on certificate" },
      achievement: { label: "Category Match", matched: true, detail: "External Hackathon (TSJ-2026-v1 rulebook)" },
      date: { label: "Sprint Date Match", matched: true, detail: "Issued 04 Sep 2026 (active sprint window)" },
      result: { label: "Claim Consistency", matched: true, detail: "Document text confirms '1st Place / Winner'" },
      source: { label: "Evidence Integrity", matched: true, detail: "SHA-256 collision check & duplicate prevention verified" },
    },
    explanation: "Extracted identity, event, result, and date consistently match the claim, and where available, authoritative sources are checked. Rust backend authoritative engine confirms TSJ-2026-v1 eligibility and commits +50 points to the ledger.",
  },
  dsa_ambiguous: {
    id: "dsa_ambiguous",
    title: "Scenario 2: Profile Problem Count vs Streak (Core Review)",
    claimCategory: "DSA 7-Day Streak",
    claimTitle: "7 Consecutive Days LeetCode Activity",
    claimedResult: "7-Day Streak Complete",
    documentType: "Profile Summary Screenshot",
    fileName: "leetcode_profile_summary.png",
    imagePreviewUrl: "/demo/leetcode_profile_500.jpg",
    sha256: "8f481c7e990c0a969bfbf4c8996fb92427ae41e4649b934ca495991b7852b899",
    expectedOutcome: "NEEDS_CORE_REVIEW",
    pointsAwarded: 0,
    checks: {
      identity: { label: "Identity Check", matched: true, detail: "Username @alex_rivera matches account profile" },
      achievement: { label: "Category Match", matched: true, detail: "Individual Contribution: DSA Track" },
      date: { label: "Sprint Date Match", matched: true, detail: "Screenshot uploaded during current sprint" },
      result: { label: "Claim Consistency", matched: false, detail: "Shows '500 Problems Solved', not consecutive streak calendar" },
      source: { label: "Evidence Integrity", matched: true, detail: "Unique image hash verified across cohort" },
    },
    explanation: "Total problem count is NOT proof of a consecutive 7-day streak. ASCEND refuses to award arbitrary points and routes the submission to Core Verifier review.",
  },
  invalid_poster: {
    id: "invalid_poster",
    title: "Scenario 3: Unrelated Meme / Image (Zero Deductions)",
    claimCategory: "Research Paper",
    claimTitle: "IEEE Distributed Consensus Publication",
    claimedResult: "Publication Accepted & Indexed",
    documentType: "Unrelated Meme Photo",
    fileName: "random_hacker_cat_meme.jpg",
    imagePreviewUrl: "/demo/cat_meme_unrelated.jpg",
    sha256: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    expectedOutcome: "INVALID_EVIDENCE",
    pointsAwarded: 0,
    checks: {
      identity: { label: "Identity Check", matched: false, detail: "Author name not present on unrelated meme" },
      achievement: { label: "Category Match", matched: false, detail: "Meme photo lacks research manuscript proof markers" },
      date: { label: "Sprint Date Match", matched: true, detail: "Upload timestamp recorded" },
      result: { label: "Claim Consistency", matched: false, detail: "Evidence clearly unrelated to academic publication" },
      source: { label: "Evidence Integrity", matched: true, detail: "Image hash recorded into disciplinary audit trail" },
    },
    explanation: "Evidence does not support the claimed publication. ASCEND cannot establish the achievement from this evidence — 0 points awarded, existing team score strictly unchanged.",
  },
};

export default function SignatureAscendAnimation() {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>("hackathon");
  const [step, setStep] = useState<"IDLE" | "SCANNING" | "EXTRACTING" | "MATCHING" | "VERIFYING" | "ASCENDED">("IDLE");
  const [illuminatedChecks, setIlluminatedChecks] = useState<string[]>([]);
  const [showPitchGuide, setShowPitchGuide] = useState<boolean>(false);
  const scenario = SCENARIOS[activeScenario];

  const runSimulation = () => {
    setStep("SCANNING");
    setIlluminatedChecks([]);

    // Step 1: Scanning (0 - 1200ms)
    setTimeout(() => {
      setStep("EXTRACTING");
      // Progressively illuminate evidence fields
      setTimeout(() => setIlluminatedChecks(["identity"]), 300);
      setTimeout(() => setIlluminatedChecks(["identity", "achievement"]), 700);
      setTimeout(() => setIlluminatedChecks(["identity", "achievement", "date"]), 1100);
      setTimeout(() => setIlluminatedChecks(["identity", "achievement", "date", "result"]), 1500);
      setTimeout(() => setIlluminatedChecks(["identity", "achievement", "date", "result", "source"]), 1900);
    }, 1200);

    // Step 2: Matching Claim vs Evidence (2800ms)
    setTimeout(() => {
      setStep("MATCHING");
    }, 3200);

    // Step 3: Verifying with Rust engine (4200ms)
    setTimeout(() => {
      setStep("VERIFYING");
    }, 4400);

    // Step 4: Final Outcome & Ascent (5400ms)
    setTimeout(() => {
      setStep("ASCENDED");
    }, 5600);
  };

  useEffect(() => {
    runSimulation();
  }, [activeScenario]);

  return (
    <div className="w-full rounded-xl bg-[#0E0E11] border border-zinc-800 p-5 sm:p-7 space-y-6 shadow-xl relative overflow-hidden">
      {/* Top Header & Scenario Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-mono font-medium uppercase tracking-wider mb-1">
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <span>Universal AutoVerify Pipeline</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
            SUBMIT → PROVE → VERIFY → CALCULATE → ASCEND
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5 max-w-xl">
            Watch how ASCEND compares claim metadata against cryptographic proof, evaluates 5 evidence dimensions, and enforces deterministic point minting.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowPitchGuide(!showPitchGuide)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono font-medium transition shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span>{showPitchGuide ? "Hide Pitch Script" : "2-Min Pitch Script"}</span>
          </button>
          <button
            onClick={runSimulation}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-medium transition shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${step !== "ASCENDED" && step !== "IDLE" ? "animate-spin" : ""}`} />
            <span>Rerun Pipeline</span>
          </button>
        </div>
      </div>

      {/* Optional Pitch & Defense Helper Drawer */}
      <AnimatePresence>
        {showPitchGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden relative z-10"
          >
            <div className="p-4 sm:p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-lg text-xs font-mono text-zinc-300">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="font-semibold text-zinc-100 uppercase flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-500" />
                  2-Minute High-Impact Judge Pitch Script
                </span>
                <span className="text-[10px] text-zinc-500">Defense Ready • Safe against cross-examination</span>
              </div>

              <div className="space-y-2 text-zinc-200 font-sans text-xs leading-relaxed">
                <p className="font-semibold text-zinc-100">
                  “Judges, ASCEND has two core principles:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-emerald-400 font-bold">1. Zero Deduction:</span> ASCEND never takes points away. It only prevents unsupported achievements from entering the official ledger.
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-blue-400 font-bold">2. Controlled Automation:</span> AI can recommend verification. AI can never manufacture points.
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase font-bold">
                    Three Demonstration Cases:
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="p-2 rounded bg-zinc-950 border border-emerald-500/30">
                      <span className="text-emerald-400 font-bold">Case 1 (Strong Evidence):</span> Member claims 1st place in external hackathon and submits certificate. ASCEND extracts identity, event, result and date, checks consistency & integrity, and passes gate. Rust matches rule, calculates 50 pts, atomically commits to ledger.
                    </div>
                    <div className="p-2 rounded bg-zinc-950 border border-amber-500/30">
                      <span className="text-amber-400 font-bold">Case 2 (Ambiguous Evidence):</span> Member claims 7-day streak but submits profile showing 500 problems solved. ASCEND recognizes total problems ≠ consecutive streak. Routes to Core Review. No points while pending.
                    </div>
                    <div className="p-2 rounded bg-zinc-950 border border-red-500/30">
                      <span className="text-red-400 font-bold">Case 3 (Insufficient Evidence):</span> Unrelated image submitted. ASCEND identifies evidence doesn't support claim. No points awarded, existing team score strictly untouched.
                    </div>
                  </div>
                </div>

                <p className="pt-1 italic font-medium text-zinc-300">
                  “We’re building a controlled verification system where AI understands evidence, Rust enforces the rules, and humans handle ambiguity. <span className="text-blue-400 font-semibold">Controlled automation beats blind AI.”</span>
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex flex-wrap items-center justify-between text-[10px] text-zinc-400">
                <span>Proof of Implementation (Show after pitch):</span>
                <div className="flex items-center gap-3 text-emerald-400 font-bold">
                  <span>✓ 21/21 Rust Tests Passed</span>
                  <span>✓ 22/22 Next.js Routes Built</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scenario Selector Chips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 relative z-10">
        {(Object.keys(SCENARIOS) as ScenarioType[]).map((key) => {
          const sc = SCENARIOS[key];
          const isSelected = activeScenario === key;
          return (
            <button
              key={key}
              onClick={() => setActiveScenario(key)}
              className={`p-3.5 rounded-lg border text-left transition duration-150 ${
                isSelected
                  ? "bg-zinc-850 border-blue-500/70"
                  : "bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold uppercase text-zinc-400">
                  {sc.claimCategory}
                </span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    sc.expectedOutcome === "AUTO_VERIFIED"
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                      : sc.expectedOutcome === "NEEDS_CORE_REVIEW"
                      ? "bg-amber-950/40 text-amber-400 border border-amber-500/30"
                      : "bg-red-950/40 text-red-400 border border-red-500/30"
                  }`}
                >
                  {sc.expectedOutcome === "AUTO_VERIFIED"
                    ? "+50 PTS"
                    : sc.expectedOutcome === "NEEDS_CORE_REVIEW"
                    ? "Core Review"
                    : "0 PTS (Safe)"}
                </span>
              </div>
              <div className="text-xs font-bold text-zinc-100 mt-1 line-clamp-1">{sc.claimTitle}</div>
              <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1 font-sans">{sc.title.split(": ")[1]}</div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Proof Document Preview & Laser Scanner (5 cols) */}
        <div className="lg:col-span-5 rounded-xl bg-zinc-950 border border-zinc-800 p-4 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span className="truncate max-w-[180px]">{scenario.fileName}</span>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
              SHA-256 Verified
            </span>
          </div>

          {/* Document Preview Card with Animated Scanning Laser Line */}
          <div className="my-4 relative h-64 rounded-xl bg-zinc-900 border border-zinc-800 p-3 overflow-hidden flex flex-col justify-between group">
            {/* Real Evidence Image Background with sleek dark overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src={scenario.imagePreviewUrl}
                alt={scenario.claimTitle}
                className="w-full h-full object-cover object-center opacity-40 filter brightness-90 contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40" />
            </div>

            {/* Document Header Mock */}
            <div className="space-y-1 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400 font-semibold tracking-wide">ASCEND EVIDENCE RUNTIME</span>
                <span className="text-[9px] font-mono text-zinc-500">ID: {scenario.sha256.slice(0, 10)}</span>
              </div>
              <div className="text-sm font-bold text-zinc-100 tracking-tight line-clamp-1">{scenario.claimTitle}</div>
              <div className="text-[11px] text-zinc-400 line-clamp-1">{scenario.documentType}</div>
            </div>

            {/* Document Body Overlay */}
            <div className="space-y-1.5 p-2.5 rounded-lg bg-zinc-950/85 backdrop-blur-sm border border-zinc-800 text-xs font-mono relative z-10">
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Claimant:</span>
                <span className="text-zinc-100 font-semibold">Sarthak (Admin)</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Claimed Result:</span>
                <span className="text-blue-400 font-semibold">{scenario.claimedResult}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-zinc-400">Proof Hash:</span>
                <span className="text-zinc-500 font-mono text-[9px] truncate max-w-[130px]">{scenario.sha256}</span>
              </div>
            </div>

            {/* Signature status */}
            <div className="flex items-center justify-between text-[10px] font-mono relative z-10 pt-1.5 border-t border-zinc-800">
              <span className="text-zinc-400">Proof Integrity:</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <Lock className="w-3 h-3" /> Private Encrypted Proof
              </span>
            </div>

            {/* Laser Scanning Line Animation (Calm minimal blue) */}
            {step === "SCANNING" && (
              <motion.div
                initial={{ top: "-5%" }}
                animate={{ top: "105%" }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent z-20 pointer-events-none"
              />
            )}
          </div>

          {/* Current Step Pill */}
          <div className="flex items-center justify-between text-xs font-mono px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-400">Phase:</span>
            <span className="text-blue-400 font-semibold flex items-center gap-1.5 uppercase">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {step}
            </span>
          </div>
        </div>

        {/* Right Column: 5 Evidence Dimensions & Deterministic Verdict (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-zinc-800">
              <span className="text-zinc-400 uppercase">5-Dimensional Evidence Intelligence</span>
              <span className="text-zinc-300 font-semibold">AI Extracts • Rust Validates</span>
            </div>

            {/* Evidence Checks Matrix */}
            <div className="space-y-2">
              {(Object.keys(scenario.checks) as Array<keyof typeof scenario.checks>).map((key) => {
                const check = scenario.checks[key];
                const isIlluminated = illuminatedChecks.includes(key);

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0.3 }}
                    animate={{
                      opacity: isIlluminated ? 1 : 0.3,
                      x: isIlluminated ? 0 : -4,
                    }}
                    transition={{ duration: 0.25 }}
                    className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                      !isIlluminated
                        ? "bg-zinc-950 border-zinc-800"
                        : check.matched
                        ? "bg-zinc-900 border-emerald-500/40"
                        : "bg-zinc-900 border-red-500/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                          !isIlluminated
                            ? "bg-zinc-900 text-zinc-500 border border-zinc-800"
                            : check.matched
                            ? "bg-emerald-950/50 text-emerald-400 border border-emerald-500/40"
                            : "bg-red-950/50 text-red-400 border border-red-500/40"
                        }`}
                      >
                        {isIlluminated ? (check.matched ? "✓" : "×") : "○"}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-100">{check.label}</div>
                        <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{check.detail}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                        !isIlluminated
                          ? "text-zinc-500"
                          : check.matched
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {isIlluminated ? (check.matched ? "MATCHED" : "FLAGGED") : "PENDING"}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Outcome Banner (Appears on VERIFYING or ASCENDED) */}
          <div className="pt-2">
            <AnimatePresence mode="wait">
              {step === "ASCENDED" ? (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-xl border space-y-2 ${
                    scenario.expectedOutcome === "AUTO_VERIFIED"
                      ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                      : scenario.expectedOutcome === "NEEDS_CORE_REVIEW"
                      ? "bg-amber-950/20 border-amber-500/40 text-amber-300"
                      : "bg-red-950/20 border-red-500/40 text-red-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {scenario.expectedOutcome === "AUTO_VERIFIED" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : scenario.expectedOutcome === "NEEDS_CORE_REVIEW" ? (
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <span className="font-bold text-sm font-mono tracking-wide uppercase">
                        {scenario.expectedOutcome === "AUTO_VERIFIED"
                          ? "ACHIEVEMENT AUTO-VERIFIED & ASCENDED"
                          : scenario.expectedOutcome === "NEEDS_CORE_REVIEW"
                          ? "EVIDENCE ROUTED TO CORE VERIFIER QUEUE"
                          : "EVIDENCE INSUFFICIENT — 0 POINTS AWARDED"}
                      </span>
                    </div>

                    <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-zinc-950 border border-current">
                      {scenario.expectedOutcome === "AUTO_VERIFIED"
                        ? "+50 OFFICIAL PTS"
                        : scenario.expectedOutcome === "NEEDS_CORE_REVIEW"
                        ? "0 PTS PENDING"
                        : "0 PTS AWARDED"}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                    {scenario.explanation}
                  </p>

                  {/* Core Principle Quote */}
                  <div className="text-[11px] font-mono text-zinc-300 bg-zinc-950/70 px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center justify-between">
                    <span className="text-zinc-400">Architectural Boundary:</span>
                    <span className="font-semibold text-blue-400">“AI can recommend verification. AI can never manufacture points.”</span>
                  </div>

                  {/* Scenario-Specific Authoritative Execution Sequence */}
                  <div className="pt-2.5 border-t border-current/20 space-y-1.5">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                      <Cpu className="w-3 h-3 text-zinc-400" />
                      <span>Authoritative Execution Sequence:</span>
                    </div>

                    {scenario.expectedOutcome === "AUTO_VERIFIED" && (
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono font-bold">
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> EVIDENCE CHECK ✓
                        </span>
                        <ArrowRight className="w-3 h-3 text-zinc-500" />
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-300 flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-zinc-400" /> RULE MATCHED ✓
                        </span>
                        <ArrowRight className="w-3 h-3 text-zinc-500" />
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-blue-400 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-blue-400" /> POINTS CALCULATED +50
                        </span>
                        <ArrowRight className="w-3 h-3 text-zinc-500" />
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-emerald-500/50 text-emerald-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> LEDGER COMMITTED
                        </span>
                        <ArrowRight className="w-3 h-3 text-zinc-500" />
                        <span className="px-2 py-0.5 rounded bg-emerald-950/30 border border-emerald-500/40 text-emerald-400">
                          TEAM SCORE +50
                        </span>
                      </div>
                    )}

                    {scenario.expectedOutcome === "NEEDS_CORE_REVIEW" && (
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono font-bold">
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-amber-500/40 text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-400" /> EVIDENCE CHECK
                        </span>
                        <ArrowRight className="w-3 h-3 text-zinc-500" />
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-amber-500/40 text-amber-400">
                          PARTIAL / AMBIGUOUS MATCH
                        </span>
                        <ArrowRight className="w-3 h-3 text-zinc-500" />
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-amber-500/50 text-amber-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> CORE REVIEW
                        </span>
                        <ArrowRight className="w-3 h-3 text-zinc-500" />
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                          NO POINTS YET
                        </span>
                        <ArrowRight className="w-3 h-3 text-zinc-500" />
                        <span className="px-2 py-0.5 rounded bg-amber-950/30 border border-amber-500/40 text-amber-400">
                          LEDGER UNCHANGED
                        </span>
                      </div>
                    )}

                    {scenario.expectedOutcome === "INVALID_EVIDENCE" && (
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono font-bold">
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-red-500/40 text-red-400 flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-400" /> EVIDENCE CHECK
                        </span>
                        <ArrowRight className="w-3 h-3 text-zinc-500" />
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-red-500/40 text-red-400">
                          CATEGORY / CLAIM MATCH ✕
                        </span>
                        <ArrowRight className="w-3 h-3 text-zinc-500" />
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-red-500/50 text-red-400 flex items-center gap-1">
                          EVIDENCE INSUFFICIENT
                        </span>
                        <ArrowRight className="w-3 h-3 text-zinc-500" />
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                          NO POINTS AWARDED
                        </span>
                        <ArrowRight className="w-3 h-3 text-zinc-500" />
                        <span className="px-2 py-0.5 rounded bg-emerald-950/30 border border-emerald-500/40 text-emerald-400">
                          LEDGER UNCHANGED
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Anti-Deduction Guarantee Banner */}
                  <div className="pt-2 border-t border-current/20 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-200">Team Score Impact:</span>
                    <span className="font-bold">
                      {scenario.expectedOutcome === "AUTO_VERIFIED"
                        ? "1,420 PTS → 1,470 PTS (+50 PTS Applied to Immutable Ledger)"
                        : scenario.expectedOutcome === "NEEDS_CORE_REVIEW"
                        ? "1,420 PTS (0 PTS Pending Core Review — Score Untouched)"
                        : "1,420 PTS (Evidence Insufficient — Existing Score Strictly Unchanged)"}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
                    <span>Deterministic evaluation executing in Rust runtime...</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">TSJ-2026-v1 Engine</span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
