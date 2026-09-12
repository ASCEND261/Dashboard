"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import NetworkCanvas from "@/components/network-canvas";
import AscendGuideModal from "@/components/ascend-guide-modal";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import InteractiveChip from "@/components/react-bits/InteractiveChip";
import AnimatedProgressBar from "@/components/react-bits/AnimatedProgressBar";
import AnimatedCounter from "@/components/react-bits/AnimatedCounter";
import ShimmerBadge from "@/components/react-bits/ShimmerBadge";
import SignatureAscendAnimation from "@/components/signature-ascend-animation";
import AscendLogo from "@/components/ascend-logo";
import PrismaticGlassCard from "@/components/react-bits/PrismaticGlassCard";
import BorderBeam from "@/components/react-bits/BorderBeam";
import GradientText from "@/components/react-bits/GradientText";
import Meteors from "@/components/react-bits/Meteors";
import ShimmerButton from "@/components/react-bits/ShimmerButton";
import {
  ArrowRight,
  ShieldCheck,
  Scale,
  Sparkles,
  Lock,
  RefreshCw,
  Trophy,
  CheckCircle2,
  Cpu,
  Layers,
  Inbox,
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Activity,
  Check,
  X,
  Database,
  Search,
  Code2,
  Award,
  Terminal,
  Zap,
  HelpCircle,
  TrendingUp,
  Target,
  Shield,
  Fingerprint,
  Bot,
  Flame,
  GitPullRequest,
  BookOpen,
  LayoutGrid,
  Workflow
} from "lucide-react";

type TabKey = "platform" | "how_it_works" | "autoverify" | "fairness" | "security" | "categories";

export default function LandingPage() {
  const router = useRouter();
  const { user, demoAccounts, loginWithDemo } = useAuth();
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("platform");

  // Sync active tab with URL hash if present
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes("platform") || hash.includes("overview")) {
        setActiveTab("platform");
      } else if (hash.includes("how") || hash.includes("workflow")) {
        setActiveTab("how_it_works");
      } else if (hash.includes("autoverify")) {
        setActiveTab("autoverify");
      } else if (hash.includes("fairness") || hash.includes("zero")) {
        setActiveTab("fairness");
      } else if (hash.includes("security") || hash.includes("ledger")) {
        setActiveTab("security");
      } else if (hash.includes("category") || hash.includes("rules")) {
        setActiveTab("categories");
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Interactive Product UI Showcase state inside Platform tab
  const [showcaseTab, setShowcaseTab] = useState<"submission" | "triage" | "progress" | "rules">("submission");

  const handleEnter = () => {
    if (!user) {
      router.push("/login");
    } else if (user.role === "CORE_MEMBER" || user.role === "ADMIN") {
      router.push("/core");
    } else {
      router.push("/dashboard");
    }
  };

  const handleQuickDemoLogin = (account: any) => {
    loginWithDemo(account);
    if (account.role === "CORE_MEMBER" || account.role === "ADMIN") {
      router.push("/core");
    } else {
      router.push("/dashboard");
    }
  };

  const heroPreSeedChips = [
    {
      label: "Final / Major Project",
      sublabel: "Sprint Grand Finale Winner",
      badge: "+250 pts",
      icon: Trophy,
      categorySlug: "final_project",
    },
    {
      label: "External Hackathon",
      sublabel: "1st Place Verified Certificate",
      badge: "+50 pts",
      icon: Award,
      categorySlug: "external_hackathon",
    },
    {
      label: "Research Paper",
      sublabel: "Publication / Submission",
      badge: "+50 pts",
      icon: BookOpen,
      categorySlug: "research_paper",
    },
    {
      label: "Open Source PR Merged",
      sublabel: "Society Repository PR",
      badge: "+25 pts",
      icon: GitPullRequest,
      categorySlug: "open_source",
    },
    {
      label: "DSA 7-Day Streak",
      sublabel: "Consecutive Activity Streak",
      badge: "+20 pts",
      icon: Flame,
      categorySlug: "dsa_streak",
    },
  ];

  const tabDefinitions: { key: TabKey; label: string; icon: any; badge?: string }[] = [
    { key: "platform", label: "Platform Overview", icon: LayoutGrid },
    { key: "how_it_works", label: "How It Works", icon: Workflow },
    { key: "autoverify", label: "AutoVerify Engine", icon: Cpu, badge: "11/11 PASSED" },
    { key: "fairness", label: "Zero-Deductions", icon: Scale },
    { key: "security", label: "Security & Ledger", icon: ShieldCheck },
    { key: "categories", label: "Scoring Rules", icon: Trophy },
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-slate-50 dark:bg-[#07080A] text-slate-900 dark:text-[#F3F4F6]">
      {/* Semantic ASCEND Network Background Canvas (React Bits) */}
      <NetworkCanvas />

      {/* Subtle Dot Matrix Grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(#3B82F6 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Grounded AI Guide Modal */}
      <AscendGuideModal isOpen={guideModalOpen} onClose={() => setGuideModalOpen(false)} />

      {/* ========================================================================= */}
      {/* SECTION 1: HERO (SPLIT LAYOUT WITH REAL-TIME ENGAGEMENT) */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-12 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Shooting Star Meteors in Hero */}
        <Meteors number={18} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Column: Core Positioning & Actions */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#0D0F14]/90 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-700 dark:text-zinc-300 shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              <span>TECH SPRINT JOURNEY 2026 // OFFICIAL PLATFORM</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.06]">
              EVERY ACHIEVEMENT. <br />
              <GradientText colors={["#2563EB", "#3B82F6", "#7C3AED", "#0284C7", "#2563EB"]}>
                ONE AUTHORITATIVE ASCENT.
              </GradientText>
            </h1>

            <p className="text-base sm:text-lg font-semibold text-slate-800 dark:text-zinc-200 tracking-tight">
              Record everything. Verify everything. Ascend together.
            </p>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-xl leading-relaxed">
              A trusted digital achievement infrastructure for recording, verifying, and fairly measuring team progress. Deterministic Rust scoring rules. Cryptographic proof validation. Zero point inflation.
            </p>

            {/* Primary Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handleEnter}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm tracking-wide transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>ENTER ASCEND</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/login"
                className="px-5 py-3 rounded-xl bg-white dark:bg-[#0D0F14]/80 hover:bg-slate-50 dark:hover:bg-zinc-850 border border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500/40 text-slate-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-white text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 shadow-xs backdrop-blur-md"
              >
                <Zap className="w-4 h-4 text-blue-500" />
                <span>SIGN IN WITH CODE / OTP</span>
              </Link>
            </div>

            {/* Interactive Pre-Seed Scenario Chips */}
            <div className="pt-2 space-y-2">
              <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span>Quick-Track Qualifying Submissions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {heroPreSeedChips.map((chip) => (
                  <InteractiveChip
                    key={chip.label}
                    label={chip.label}
                    badge={chip.badge}
                    icon={chip.icon}
                    onClick={() => router.push(`/dashboard/submit?cat=${chip.categorySlug}`)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Hero High-Impact Metric Terminal in Prismatic Glass Card */}
          <div className="lg:col-span-5">
            <PrismaticGlassCard className="shadow-xl shadow-slate-200/50 dark:shadow-2xl">
              <BorderBeam size={220} duration={8} colorFrom="#38bdf8" colorTo="#3b82f6" />
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-200 uppercase">Live Verification Gateway</span>
                  </div>
                  <ShimmerBadge variant="blue">RUST AUTHORITATIVE</ShimmerBadge>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#08090C]/80 border border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between hover:border-blue-400/40 dark:hover:border-blue-500/30 transition shadow-xs">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-zinc-400 font-semibold">Ledger Status</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Zero-Deduction Architecture</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">100% Protected</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400">0 penalties</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#08090C]/80 border border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between hover:border-blue-400/40 dark:hover:border-blue-500/30 transition shadow-xs">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-zinc-400 font-semibold">Audit Checkpoints</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">11 Strict Security Gates</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-bold">11 / 11 PASSED</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400">SHA-256 + Rules</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#08090C]/80 border border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between hover:border-blue-400/40 dark:hover:border-blue-500/30 transition shadow-xs">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-zinc-400 font-semibold">Leaderboard Staging</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Ascent Board In Staging</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs text-slate-800 dark:text-zinc-300 font-bold">0 Mock Scores</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400">Qualifying Window</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Authoritative Consensus Engine</span>
                  </span>
                  <span>v1.0.0</span>
                </div>
              </div>
            </PrismaticGlassCard>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: STICKY SEGMENTED TAB NAVIGATION (NO EXCESSIVE SCROLLING) */}
      {/* ========================================================================= */}
      <div className="sticky top-14 z-30 bg-white/95 dark:bg-[#07080A]/95 backdrop-blur-xl border-y border-slate-200 dark:border-zinc-800 py-2.5 px-4 sm:px-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-1.5 sm:gap-2">
          {tabDefinitions.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition duration-150 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold"
                    : "bg-slate-50 dark:bg-[#0D0F14] hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-blue-500"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TABBED CONTENT PANELS (FOCUSED & CINEMATIC) */}
      {/* ========================================================================= */}
      <main className="relative z-10 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full min-h-[600px]">
        {/* TAB 1: PLATFORM OVERVIEW */}
        {activeTab === "platform" && (
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-200">
            {/* Header intro */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">Architecture Showcase</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Enterprise Team Verification, Built on Authoritative Rules
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                Switch through live modules to experience how ASCEND balances member workflows, verification triage, and team analytics.
              </p>
            </div>

            {/* Showcase Selector */}
            <div className="flex items-center justify-center gap-2">
              {[
                { id: "submission", label: "Submission Flow", icon: Inbox },
                { id: "triage", label: "Core Verifier Workspace", icon: ShieldCheck },
                { id: "progress", label: "Ledger Commitment", icon: Database },
                { id: "rules", label: "Deterministic Engine", icon: Cpu },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setShowcaseTab(t.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                    showcaseTab === t.id
                      ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white border border-slate-300 dark:border-zinc-700 font-semibold shadow-xs"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Interactive Showcase Preview Card */}
            <SpotlightCard className="p-6 sm:p-8 bg-white dark:bg-[#0D0F14] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              {showcaseTab === "submission" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase">Member Submission Interface</span>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-mono font-semibold">1-Click Category Extraction</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090A0D] border border-slate-200 dark:border-zinc-800 space-y-2">
                      <div className="text-slate-500 dark:text-zinc-400 font-mono text-[11px] uppercase font-semibold">Upload & Hash</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">SHA-256 Checksum Calculation</div>
                      <p className="text-slate-600 dark:text-zinc-400 text-[11px]">
                        Every uploaded PDF/image generates a SHA-256 fingerprint on ingestion. Duplicate attempts across the cohort are instantly caught.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090A0D] border border-slate-200 dark:border-zinc-800 space-y-2">
                      <div className="text-slate-500 dark:text-zinc-400 font-mono text-[11px] uppercase font-semibold">AI Fact Extraction</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">Non-Authoritative OCR Scanner</div>
                      <p className="text-slate-600 dark:text-zinc-400 text-[11px]">
                        The AI service extracts candidate name, event title, rank, and date. The Rust backend then deterministically verifies these facts against rules.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {showcaseTab === "triage" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase">Core Verifier Triage Queue</span>
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">Real-Time Cohort Review</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090A0D] border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white">Global AI Hackathon 2026 — 1st Place</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        AUTO VERIFIED (+50 PTS)
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400 text-[11px]">
                      Verified by ASCEND AutoVerify Engine. Rule EXTERNAL_HACKATHON_1ST satisfied. Points atomically written to point_ledger.
                    </p>
                  </div>
                </div>
              )}

              {showcaseTab === "progress" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase">Transactional Point Ledger</span>
                    </div>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-mono">ACID Guaranteed</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300">
                    Points strictly enter the official ledger inside atomic database transactions. Unverified or rejected submissions never decrement team scores.
                  </p>
                </div>
              )}

              {showcaseTab === "rules" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase">TSJ-2026-v1 Authoritative Ruleset</span>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">Zero AI Discretion</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300">
                    Scoring values and multipliers are strictly locked in versioned Rust rule files. AI services never award or deduct points.
                  </p>
                </div>
              )}
            </SpotlightCard>

            {/* 3 Core Architecture Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SpotlightCard className="p-6 bg-white dark:bg-[#0D0F14] border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2 shadow-xs">
                <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Deterministic Scoring Engine</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Scoring logic runs exclusively in Rust. Rules are versioned, immutable, and test-driven for 100% precision.
                </p>
              </SpotlightCard>

              <SpotlightCard className="p-6 bg-white dark:bg-[#0D0F14] border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2 shadow-xs">
                <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Zero-Deduction Integrity</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Unsupported evidence awards 0 points without deducting from previously verified points.
                </p>
              </SpotlightCard>

              <SpotlightCard className="p-6 bg-white dark:bg-[#0D0F14] border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cryptographic Verification</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  SHA-256 file hashing detects duplicates across the cohort. Signed tokens protect private document viewing.
                </p>
              </SpotlightCard>
            </div>
          </div>
        )}

        {/* TAB 2: HOW IT WORKS */}
        {activeTab === "how_it_works" && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">Workflow Pipeline</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                From Evidence Upload to Authoritative Ledger
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                How every achievement moves through intake, verification, and certified ledger recording.
              </p>
            </div>

            <div className="space-y-4">
              <SpotlightCard className="p-6 bg-white dark:bg-[#0D0F14] border border-slate-200 dark:border-zinc-800 rounded-xl flex items-start gap-4 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono font-bold shrink-0">
                  01
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Intake & Cryptographic Fingerprinting</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Member selects an achievement track (Hackathon, DSA Streak, Open Source, Project, Paper) and uploads their proof. The engine hashes the file with SHA-256 and checks for cohort duplicates.
                  </p>
                </div>
              </SpotlightCard>

              <SpotlightCard className="p-6 bg-white dark:bg-[#0D0F14] border border-slate-200 dark:border-zinc-800 rounded-xl flex items-start gap-4 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono font-bold shrink-0">
                  02
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Universal AutoVerify Intelligence</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    The evidence intelligence service inspects the proof against 5 dimensions (identity, event, achievement result, date, and document authenticity). If valid, it is routed to AutoVerify; if ambiguous, it goes to Core Review.
                  </p>
                </div>
              </SpotlightCard>

              <SpotlightCard className="p-6 bg-white dark:bg-[#0D0F14] border border-slate-200 dark:border-zinc-800 rounded-xl flex items-start gap-4 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold shrink-0">
                  03
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Authoritative Rust Scoring & Ledger Commitment</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    The authoritative Rust engine evaluates official TSJ rules. Points are atomically written to the point ledger. If rejected, 0 points are awarded with zero deductions to previous scores.
                  </p>
                </div>
              </SpotlightCard>
            </div>
          </div>
        )}

        {/* TAB 3: AUTOVERIFY ENGINE (SIGNATURE SCANNER) */}
        {activeTab === "autoverify" && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">Interactive Proof Gate</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Cinematic AutoVerify Scanner Demonstration
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                Experience all 3 core evidence scenarios live: Legitimate Certificate, Ambiguous DSA Streak Claim, and Unrelated/Meme Upload.
              </p>
            </div>

            {/* Signature Scanner Component */}
            <SignatureAscendAnimation />
          </div>
        )}

        {/* TAB 4: ZERO-DEDUCTION FAIRNESS */}
        {activeTab === "fairness" && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">Fairness By Design</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                “ASCEND never takes points away. It only prevents unsupported claims from entering the ledger.”
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                Learn why negative penalty scoring creates false fear and discourages team contribution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0D0F14] border border-red-200 dark:border-red-500/30 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-mono text-xs font-bold uppercase">
                  <X className="w-4 h-4" />
                  <span>Traditional Penalizing Systems</span>
                </div>
                <ul className="text-xs text-slate-600 dark:text-zinc-400 space-y-2 leading-relaxed">
                  <li>• Rejection slashes 50% or 90% of a team&apos;s previously earned points</li>
                  <li>• Legitimate submissions are avoided due to fear of arbitrary penalty</li>
                  <li>• Honest mistakes or formatting errors destroy months of team standing</li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#0D0F14] border border-emerald-200 dark:border-emerald-500/40 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold uppercase">
                  <Check className="w-4 h-4" />
                  <span>ASCEND Zero-Deduction Architecture</span>
                </div>
                <ul className="text-xs text-slate-700 dark:text-zinc-300 space-y-2 leading-relaxed">
                  <li>• Invalid proof receives 0 awarded points</li>
                  <li>• Existing verified points are permanently locked and protected</li>
                  <li>• Teams are encouraged to push boundaries and contribute honestly</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY & AUDIT */}
        {activeTab === "security" && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">Trust & Cryptography</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Enterprise Security & Immutable Audit Trail
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                Cryptographic guarantees protecting student data and official standings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SpotlightCard className="p-5 bg-white dark:bg-[#0D0F14] border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2 shadow-xs">
                <Fingerprint className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">SHA-256 Duplicate Guard</h4>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Every uploaded file is checked against all historic cohort proof hashes to prevent recycled submissions.
                </p>
              </SpotlightCard>

              <SpotlightCard className="p-5 bg-white dark:bg-[#0D0F14] border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2 shadow-xs">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Signed Token Viewing</h4>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Proof documents cannot be accessed via public static URLs. Time-limited signed tokens protect student privacy.
                </p>
              </SpotlightCard>

              <SpotlightCard className="p-5 bg-white dark:bg-[#0D0F14] border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2 shadow-xs">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Consensus Sync Layer</h4>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Standardized export payload for university-wide or department-level verification aggregators.
                </p>
              </SpotlightCard>
            </div>
          </div>
        )}

        {/* TAB 6: SCORING RULES & SPRINT CATEGORIES */}
        {activeTab === "categories" && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 font-bold">TSJ-2026-v1 Official Rules</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Sprint Categories & Deterministic Scoring
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                Points awarded based on official criteria committed to the authoritative ledger.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "Major Project Winner", points: "+250 pts", desc: "1st place sprint grand finale project", icon: Trophy },
                { title: "External Hackathon (1st)", points: "+50 pts", desc: "Verified national or global hackathon winner", icon: Award },
                { title: "Research Paper Published", points: "+50 pts", desc: "Peer-reviewed publication or conference proceeding", icon: BookOpen },
                { title: "Open Source PR Merged", points: "+25 pts", desc: "Verified pull request merged into active repo", icon: GitPullRequest },
                { title: "DSA 7-Day Streak", points: "+20 pts", desc: "Consecutive daily problem solving on LeetCode/GFG", icon: Flame },
                { title: "Tech Talk / Community Session", points: "+20 pts", desc: "Delivered technical talk to cohort members", icon: Sparkles },
              ].map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <div key={i} className="p-4 rounded-xl bg-white dark:bg-[#0D0F14] border border-slate-200 dark:border-zinc-800 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-zinc-850 border border-blue-200 dark:border-zinc-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{cat.title}</div>
                        <div className="text-[11px] text-slate-600 dark:text-zinc-400">{cat.desc}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 shrink-0 ml-2">
                      {cat.points}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* SECTION 4: CALL TO ACTION FOOTER */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center border-t border-slate-200 dark:border-zinc-800/80">
        <div className="space-y-4">
          <AscendLogo size="lg" showSubtitle={false} />
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Ready to Begin Your Team Ascent?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
            Experience authoritative verification, zero-deduction scoring, and certified team recognition.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleEnter}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm tracking-wide transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>ENTER WORKSPACE</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/login"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white dark:bg-[#0D0F14] hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs sm:text-sm font-medium transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Zap className="w-4 h-4 text-blue-500" />
              <span>SIGN IN WITH ACCESS CODE</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Official Bottom Line */}
      <footer className="relative z-10 py-6 px-4 text-center border-t border-slate-200 dark:border-zinc-900 bg-white dark:bg-[#07080A] text-[11px] font-mono text-slate-600 dark:text-zinc-400">
        ASCEND // AUTHORITATIVE ACHIEVEMENT & VERIFICATION SYSTEM • TECH SPRINT 2026
      </footer>
    </div>
  );
}
