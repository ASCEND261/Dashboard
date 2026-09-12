"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import JourneyProgress from "@/components/journey-progress";
import ProofViewerModal from "@/components/proof-viewer-modal";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import InteractiveChip from "@/components/react-bits/InteractiveChip";
import PageTransition from "@/components/react-bits/PageTransition";
import AnimatedCounter from "@/components/react-bits/AnimatedCounter";
import AnimatedProgressBar from "@/components/react-bits/AnimatedProgressBar";
import ShimmerBadge from "@/components/react-bits/ShimmerBadge";
import { useRealtimePoints } from "@/lib/use-realtime-points";
import TeamOrbitHero from "@/components/team-orbit-hero";
import VerticalAscentPath from "@/components/vertical-ascent-path";

import AscendNetworkField from "@/components/ascend-network-field";
import PrismaticGlassCard from "@/components/react-bits/PrismaticGlassCard";
import BorderBeam from "@/components/react-bits/BorderBeam";
import GradientText from "@/components/react-bits/GradientText";
import Meteors from "@/components/react-bits/Meteors";
import RunningDashboardFooter from "@/components/running-dashboard-footer";
import { getISTGreeting } from "@/lib/time-utils";
import {
  PlusCircle,
  Trophy,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Sparkles,
  Layers,
  Inbox,
  Clock,
  AlertCircle,
  XCircle,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  Minus,
  FileText,
  Target,
  RefreshCw,
  Code2,
  BookOpen,
  Award,
  Flame,
  GitPullRequest,
  Search,
  Filter,
  ArrowRight
} from "lucide-react";

type DashboardTab = "overview" | "history" | "achievements" | "leaderboard" | "progress";

function MemberDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as DashboardTab) || "overview";

  const { user } = useAuth();
  const realtime = useRealtimePoints(3000);
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [progressData, setProgressData] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");

  // Reactive data fallback to realtime stream
  const currentProgress = realtime.progressData || progressData;
  const currentSubmissions = (realtime.submissions && realtime.submissions.length > 0) ? realtime.submissions : submissions;
  const currentLeaderboard = realtime.leaderboard || leaderboard;

  // Proof Modal state for achievements tab
  const [selectedProof, setSelectedProof] = useState<{
    fileName: string;
    viewToken?: string;
    proofId?: string;
    mimeType: string;
  } | null>(null);

  useEffect(() => {
    const currentTab = (searchParams.get("tab") as DashboardTab) || "overview";
    setActiveTab(currentTab);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getTeamProgress().catch(() => null),
      api.getMySubmissions().catch(() => []),
      api.getLeaderboard().catch(() => null),
    ])
      .then(([progress, subs, lb]) => {
        if (progress) setProgressData(progress);
        if (subs) setSubmissions(subs);
        if (lb) setLeaderboard(lb);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleTabChange = (tab: DashboardTab | string) => {
    setActiveTab(tab as DashboardTab);
    const url = tab === "overview" ? "/dashboard" : `/dashboard?tab=${tab}`;
    router.push(url, { scroll: false });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="status-pill status-verified">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Verified
          </span>
        );
      case "NEEDS_MORE_PROOF":
        return (
          <span className="status-pill status-needs_more_proof">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            Needs Proof
          </span>
        );
      case "REJECTED":
        return (
          <span className="status-pill status-rejected">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            Ineligible
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="status-pill status-under_review">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Under Review
          </span>
        );
      default:
        return (
          <span className="status-pill status-submitted">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            Submitted
          </span>
        );
    }
  };

  const preSeedChips = [
    {
      label: "Hackathon Podium",
      sublabel: "1st/2nd/3rd Place Trophy",
      badge: "+250 pts",
      icon: Trophy,
      categorySlug: "hackathons",
    },
    {
      label: "Open Source PR",
      sublabel: "Merged Production Code",
      badge: "+50 pts",
      icon: GitPullRequest,
      categorySlug: "open-source",
    },
    {
      label: "Research Paper",
      sublabel: "Peer-Reviewed Publication",
      badge: "+150 pts",
      icon: BookOpen,
      categorySlug: "research-papers",
    },
    {
      label: "Industry Certification",
      sublabel: "Cloud / AI Pro Credential",
      badge: "+100 pts",
      icon: Award,
      categorySlug: "certifications",
    },
    {
      label: "Sprint Milestone",
      sublabel: "Validated Track Deliverable",
      badge: "+100 pts",
      icon: Flame,
      categorySlug: "sprint-milestones",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Real-time score increase banner */}
      {realtime.hasScoreIncreased && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 shadow-lg shadow-emerald-950/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
            <span className="font-bold text-white">+{realtime.scoreDelta} PTS Awarded!</span>
            <span className="text-emerald-300 text-[11px]">Real-time ledger score updated live.</span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-900 border border-emerald-400/40 text-emerald-200">
            REALTIME SYNC
          </span>
        </div>
      )}

      {/* Header Greeting & Submission CTA */}
      <PrismaticGlassCard className="shadow-2xl">
        <BorderBeam size={220} duration={8} colorFrom="#60A5FA" colorTo="#A855F7" />
        <Meteors number={12} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            {/* Dynamic Academic & Branch Identity Bar (Mobbin/iOS style) */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold text-white tracking-wide">Team ASCEND</span>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                (user?.branch || "").includes("AI")
                  ? "bg-purple-950/80 text-purple-300 border border-purple-800/60 shadow-sm shadow-purple-900/40"
                  : (user?.branch || "").includes("VLSI")
                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 shadow-sm shadow-emerald-900/40"
                  : (user?.branch || "").includes("CYBER")
                  ? "bg-red-950/80 text-red-300 border border-red-800/60 shadow-sm shadow-red-900/40"
                  : "bg-blue-950/80 text-blue-300 border border-blue-800/60 shadow-sm shadow-blue-900/40"
              }`}>
                {user?.branch || user?.department?.code || user?.department_unit || "MEMBER"}
              </span>
              {user?.section && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                  Sec {user.section}
                </span>
              )}
              {user?.enrollment_number && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hidden sm:inline-block">
                  Enr: {user.enrollment_number}
                </span>
              )}
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center gap-1.5 ml-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{realtime.teamScore} PTS LIVE</span>
              </span>
            </div>

            <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>{getISTGreeting(user?.name)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <GradientText colors={["#FFFFFF", "#60A5FA", "#C084FC", "#FFFFFF"]}>
                ASCEND is climbing.
              </GradientText>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5 max-w-xl">
              Official achievement tracking and verifiable points engine for Tech Sprint Journey 2026.
            </p>
          </div>

          <Link
            href="/dashboard/submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm sm:text-xs font-bold tracking-wide transition shadow-lg shadow-blue-600/25 active:scale-[0.98] shrink-0 w-full sm:w-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Submit Achievement</span>
          </Link>
        </div>
      </PrismaticGlassCard>

      {/* Interactive Pre-Seed Action Chips */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Quick-Start Claim Presets</span>
          </span>
          <span className="text-[10px] text-zinc-400 hidden sm:block">Deterministic Scoring Catalog</span>
        </div>
        {/* Mobile: horizontal scroll; Desktop: grid */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
          {preSeedChips.map((chip) => (
            <div key={chip.label} className="snap-start shrink-0 w-[200px] sm:w-auto">
              <InteractiveChip
                label={chip.label}
                sublabel={chip.sublabel}
                badge={chip.badge}
                icon={chip.icon}
                onClick={() => router.push(`/dashboard/submit?cat=${chip.categorySlug}`)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Persistent Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0E0E11] border border-zinc-800 overflow-x-auto">
        <button
          onClick={() => handleTabChange("overview")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
            activeTab === "overview"
              ? "bg-zinc-800 text-white border border-zinc-800 "
              : "text-gray-400 hover:text-white hover:bg-[#141418]"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-zinc-400" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => handleTabChange("history")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
            activeTab === "history"
              ? "bg-zinc-800 text-white border border-zinc-800 "
              : "text-gray-400 hover:text-white hover:bg-[#141418]"
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span>Submission History</span>
          {currentSubmissions.length > 0 && (
            <span className="px-1.5 py-0.2 rounded bg-[#141418] text-gray-300 font-mono text-[10px] border border-zinc-800">
              {currentSubmissions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange("achievements")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
            activeTab === "achievements"
              ? "bg-zinc-800 text-white border border-zinc-800 "
              : "text-gray-400 hover:text-white hover:bg-[#141418]"
          }`}
        >
          <Inbox className="w-3.5 h-3.5 text-zinc-400" />
          <span>My Achievements</span>
        </button>

        <button
          onClick={() => handleTabChange("leaderboard")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
            activeTab === "leaderboard"
              ? "bg-zinc-800 text-white border border-zinc-800 "
              : "text-gray-400 hover:text-white hover:bg-[#141418]"
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Cohort Leaderboard</span>
        </button>

        <button
          onClick={() => handleTabChange("progress")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
            activeTab === "progress"
              ? "bg-zinc-800 text-white border border-zinc-800 "
              : "text-gray-400 hover:text-white hover:bg-[#141418]"
          }`}
        >
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          <span>Journey Milestones</span>
        </button>
      </div>

      {/* Tab Content with Framer Motion Page Transition */}
      <PageTransition transitionKey={activeTab}>
        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Cinematic Team Orbit Hero with Directed Motion & Digital Convergence */}
            <TeamOrbitHero
              score={realtime.teamScore}
              rank={realtime.teamRank}
              velocityPct={84}
              verifiedCount={realtime.verifiedCount}
              onOpenSubmit={() => router.push("/dashboard/submit")}
            />

            {/* Team Overview Cards with SpotlightCard Cursor Glow */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <SpotlightCard className="p-4 sm:p-5 active:scale-[0.98] transition-transform">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">
                  Overall Rank
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1">
                  {currentProgress?.rank || "#01"}
                </div>
                <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 font-mono">
                  <span className="text-emerald-400 font-semibold">Live</span>
                  <span>Active Sprint</span>
                </div>
              </SpotlightCard>

              <SpotlightCard className="p-4 sm:p-5 active:scale-[0.98] transition-transform">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Team Points
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-zinc-100 mt-1">
                  <AnimatedCounter value={realtime.teamScore} />
                </div>
                <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 font-mono">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                  <span>Live ledger sum</span>
                </div>
              </SpotlightCard>

              <SpotlightCard className="p-4 sm:p-5 active:scale-[0.98] transition-transform">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Verified Records
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                  <AnimatedCounter value={realtime.verifiedCount} />
                </div>
                <div className="text-[11px] text-gray-400 mt-1 font-mono">100% proof certified</div>
              </SpotlightCard>

              <SpotlightCard className="p-4 sm:p-5 active:scale-[0.98] transition-transform">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">
                  This Week
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-zinc-100 mt-1">
                  {realtime.teamScore > 0 ? `+${realtime.teamScore}` : (currentProgress?.this_week_gain ?? "+0")}
                </div>
                <div className="text-[11px] text-gray-400 mt-1 font-mono">Real-time velocity</div>
              </SpotlightCard>
            </div>

            {/* Rubric Progress Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Sprint Target Execution</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Deterministic progression toward the 500 pts Tier 1 milestone
                  </p>
                </div>
                <ShimmerBadge variant="blue">Tier 1 Target</ShimmerBadge>
              </div>

              <AnimatedProgressBar
                value={currentProgress?.milestone?.completion_pct ?? (realtime.teamScore > 0 ? Math.min(100, Math.round((realtime.teamScore / 500) * 100)) : 0)}
                label="Overall Journey Completion"
                metricLabel={`${realtime.teamScore} / ${currentProgress?.milestone?.target_points ?? 500} pts`}
                variant="blue"
                height="h-2.5"
              />
            </div>

            {/* Main Visual: ASCEND JOURNEY Progress */}
            {currentProgress?.milestone && (
              <JourneyProgress
                currentPoints={realtime.teamScore}
                targetPoints={currentProgress.milestone.target_points}
                pointsRemaining={Math.max(0, currentProgress.milestone.target_points - realtime.teamScore)}
                completionPct={currentProgress.milestone.completion_pct}
              />
            )}

            {/* Recent Team-Level Activity Feed */}
            <div className="p-5 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-zinc-400" />
                  <h2 className="text-sm font-bold text-white tracking-wide">Recent Team-Level Velocity</h2>
                </div>
                <span className="text-[11px] font-mono text-gray-400">Aggregated Stream</span>
              </div>

              <div className="divide-y divide-zinc-800/80">
                {(!currentProgress?.recent_activity || currentProgress.recent_activity.length === 0) ? (
                  <div className="py-6 text-center text-xs text-zinc-500 font-mono">
                    System initialized at 0 PTS. No verified claims yet — real scores will log here live as achievements are certified.
                  </div>
                ) : (
                  currentProgress.recent_activity.map((act: any) => (
                    <div key={act.id} className="py-3 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                        <div>
                          <div className="text-xs font-semibold text-gray-200">{act.title}</div>
                          <div className="text-[11px] text-emerald-400 font-mono mt-0.5">{act.impact}</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-400 shrink-0 font-mono">{act.timestamp}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick History Snapshot Widget */}
            <div className="p-5 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <h2 className="text-sm font-bold text-white tracking-wide">Recent Submission History</h2>
                </div>
                <button
                  onClick={() => handleTabChange("history")}
                  className="text-xs text-zinc-400 hover:text-zinc-200 font-medium flex items-center gap-1 transition"
                >
                  <span>View Full History ({currentSubmissions.length})</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {currentSubmissions.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  No submissions yet. Submit your first achievement to start your audit history.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/80">
                  {currentSubmissions.slice(0, 3).map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141418] text-gray-300 border border-zinc-800">
                            {item.category}
                          </span>
                          <span className="text-xs font-bold text-white truncate max-w-xs">{item.title}</span>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          Claim ID: {item.id} • {item.date_of_activity}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {item.points_awarded !== null ? (
                          <div className="text-xs font-mono font-bold text-emerald-400">+{item.points_awarded} pts</div>
                        ) : (
                          <div className="text-xs font-mono text-gray-400">Under Review</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Submission History */}
        {activeTab === "history" && (
          <div className="space-y-6">
            {/* History Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-[#0E0E11] border border-zinc-800">
                <div className="text-[10px] font-mono uppercase text-gray-400">Total Submissions</div>
                <div className="text-2xl font-black font-mono text-white mt-1">{currentSubmissions.length}</div>
                <div className="text-[10px] text-gray-500 font-mono">All-time claims</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0E0E11] border border-emerald-500/20">
                <div className="text-[10px] font-mono uppercase text-emerald-400">Verified & Sealed</div>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                  {currentSubmissions.filter((s) => s.status === "VERIFIED").length}
                </div>
                <div className="text-[10px] text-emerald-500/70 font-mono">100% Core certified</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0E0E11] border border-zinc-800">
                <div className="text-[10px] font-mono uppercase text-zinc-400">Points Minted</div>
                <div className="text-2xl font-black font-mono text-zinc-100 mt-1">
                  {currentSubmissions
                    .filter((s) => s.status === "VERIFIED")
                    .reduce((acc, s) => acc + (s.points_awarded || 0), 0)}
                </div>
                <div className="text-[10px] text-zinc-400/70 font-mono">TSJ-2026-v1 Rulebook</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0E0E11] border border-amber-500/20">
                <div className="text-[10px] font-mono uppercase text-amber-400">Under Review</div>
                <div className="text-2xl font-black font-mono text-amber-300 mt-1">
                  {currentSubmissions.filter((s) => s.status === "SUBMITTED" || s.status === "UNDER_REVIEW" || s.status === "NEEDS_MORE_PROOF").length}
                </div>
                <div className="text-[10px] text-amber-500/70 font-mono">In verifier triage</div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-xl bg-[#0E0E11] border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search history by title, ID, category..."
                  className="w-full bg-[#141418] border border-zinc-800 rounded-xl pl-8 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                {[
                  { id: "all", label: "All" },
                  { id: "VERIFIED", label: "Verified" },
                  { id: "UNDER_REVIEW", label: "Under Review" },
                  { id: "NEEDS_MORE_PROOF", label: "Needs Proof" },
                  { id: "REJECTED", label: "Rejected" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setHistoryFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition shrink-0 ${
                      historyFilter === f.id
                        ? "bg-blue-600 text-white"
                        : "bg-[#141418] text-gray-400 hover:text-white border border-zinc-800"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submissions History List */}
            <div className="rounded-2xl bg-[#0E0E11] border border-zinc-800 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-[#141418]">
                <span className="text-xs font-mono font-bold text-gray-300 uppercase">
                  Submission & Verification Audit Records
                </span>
                <Link
                  href="/dashboard/submit"
                  className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-semibold"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Submit New Claim</span>
                </Link>
              </div>

              {submissions
                .filter((item) => {
                  const matchesSearch =
                    !historySearch ||
                    item.title?.toLowerCase().includes(historySearch.toLowerCase()) ||
                    item.category?.toLowerCase().includes(historySearch.toLowerCase()) ||
                    item.id?.toLowerCase().includes(historySearch.toLowerCase());
                  const matchesFilter =
                    historyFilter === "all" ||
                    item.status === historyFilter ||
                    (historyFilter === "UNDER_REVIEW" && item.status === "SUBMITTED");
                  return matchesSearch && matchesFilter;
                })
                .map((item) => (
                  <div key={item.id} className="p-5 border-b border-zinc-800 hover:bg-[#141418]/50 transition space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 font-mono">
                        <span className="text-xs font-bold text-zinc-400">{item.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#141418] text-gray-300 border border-zinc-800 uppercase">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-gray-400">Activity: {item.date_of_activity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white">{item.title}</h3>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.description}</p>
                    </div>

                    {/* Reviewer remarks if present */}
                    {item.reviewer_note && (
                      <div className="p-3 rounded-xl bg-zinc-850 border border-zinc-800 text-xs text-zinc-100 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-zinc-200 font-mono">Verifier Note: </span>
                          <span>{item.reviewer_note}</span>
                        </div>
                      </div>
                    )}
                    {item.proof_request_reason && (
                      <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-300 font-mono">More Proof Required: </span>
                          <span>{item.proof_request_reason}</span>
                        </div>
                      </div>
                    )}

                    {/* Footer with points, rules, proof viewer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-zinc-800">
                      <div className="flex items-center gap-3 text-xs font-mono">
                        {item.points_awarded !== null ? (
                          <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>+{item.points_awarded} Points Awarded</span>
                            <span className="text-[10px] text-gray-500 font-normal">(Rule TSJ-2026-v1)</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Score derivation in queue</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {item.proof_documents && item.proof_documents.length > 0 && (
                          <button
                            onClick={() =>
                              setSelectedProof({
                                fileName: item.proof_documents[0].file_name || "proof.pdf",
                                viewToken: item.proof_documents[0].view_token,
                                mimeType: item.proof_documents[0].mime_type || "application/pdf",
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-zinc-800 border border-zinc-800 text-xs text-gray-200 hover:text-white transition flex items-center gap-1.5 font-mono"
                          >
                            <FileText className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Inspect Proof File</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 2: My Achievements */}
        {activeTab === "achievements" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#0E0E11] border border-zinc-800 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-[#141418]">
                <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider font-mono">
                  My Submitted Achievements ({currentSubmissions.length})
                </div>
                <Link
                  href="/dashboard/submit"
                  className="text-xs font-medium text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                >
                  <span>+ New Record</span>
                </Link>
              </div>

              {currentSubmissions.length === 0 ? (
                <div className="p-12 text-center">
                  <Inbox className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No achievements recorded yet.</p>
                  <Link
                    href="/dashboard/submit"
                    className="inline-block mt-3 text-xs text-zinc-400 hover:underline"
                  >
                    Submit an achievement to start earning points
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/80">
                  {currentSubmissions.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-[#141418]/60 transition flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141418] text-gray-300 border border-zinc-800">
                            {item.category}
                          </span>
                          <span className="text-xs font-mono text-gray-400">{item.date_of_activity}</span>
                          {getStatusBadge(item.status)}
                        </div>
                        <h3 className="text-sm font-bold text-gray-100">{item.title}</h3>
                        <p className="text-xs text-gray-400">{item.description}</p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-mono font-bold text-gray-200">
                            {item.points_awarded !== null ? (
                              <span className="text-emerald-400 font-semibold">+{item.points_awarded} pts</span>
                            ) : (
                              <span className="text-gray-400 text-xs">Pending Review</span>
                            )}
                          </div>
                        </div>

                        {item.proof_documents && item.proof_documents.length > 0 && (
                          <button
                            onClick={() =>
                              setSelectedProof({
                                fileName: item.proof_documents[0].file_name || "proof.pdf",
                                viewToken: item.proof_documents[0].view_token,
                                mimeType: item.proof_documents[0].mime_type || "application/pdf",
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-[#141418] hover:bg-[#18181B] border border-zinc-800 text-xs text-gray-300 hover:text-white transition flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Proof</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Cohort Leaderboard */}
        {activeTab === "leaderboard" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#0E0E11] border border-zinc-800 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-[#141418]">
                <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider font-mono">
                  Cohort Alpha Standings
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Deterministic Rules Engine</span>
                </div>
              </div>

              <div className="divide-y divide-zinc-800/80">
                {leaderboard?.teams?.map((team: any) => {
                  const isAscend = team.is_user_team || team.team_id === "ASCEND";
                  return (
                    <div
                      key={team.team_id}
                      className={`flex items-center justify-between px-5 py-3.5 transition ${
                        isAscend
                          ? "bg-zinc-850 border-l-2 border-l-blue-500"
                          : "hover:bg-[#141418]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            team.rank === "01"
                              ? "bg-amber-950/40 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                              : team.rank === "02"
                              ? "bg-zinc-800 text-zinc-200 border border-zinc-800 "
                              : "bg-[#141418] text-gray-400 border border-zinc-800"
                          }`}
                        >
                          {team.rank}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${isAscend ? "text-white" : "text-gray-300"}`}>
                              {team.name}
                            </span>
                            {isAscend && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-bold font-mono">
                                YOUR TEAM
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono">Team ID: {team.team_id}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-base font-black font-mono text-gray-100">
                            {team.points.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                            Official Pts
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Journey Milestones */}
        {activeTab === "progress" && (
          <div className="space-y-6">
            {/* Cinematic Vertical Ascent Path */}
            <VerticalAscentPath />

            {progressData?.milestone && (
              <JourneyProgress
                currentPoints={progressData.milestone.current_points}
                targetPoints={progressData.milestone.target_points}
                pointsRemaining={progressData.milestone.points_remaining}
                completionPct={progressData.milestone.completion_pct}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SpotlightCard className="p-5">
                <div className="text-xs font-mono font-bold uppercase text-zinc-400">Sprint Target</div>
                <div className="text-2xl font-mono font-black text-white mt-1">2,000 Pts</div>
                <p className="text-xs text-gray-400 mt-1">Target for top tier cohort placement</p>
              </SpotlightCard>
              <SpotlightCard className="p-5">
                <div className="text-xs font-mono font-bold uppercase text-zinc-100">Velocity</div>
                <div className="text-2xl font-mono font-black text-white mt-1">+180 pts/wk</div>
                <p className="text-xs text-gray-400 mt-1">Pacing 14% ahead of average team trajectory</p>
              </SpotlightCard>
              <SpotlightCard className="p-5">
                <div className="text-xs font-mono font-bold uppercase text-emerald-400">Audit Status</div>
                <div className="text-2xl font-mono font-black text-emerald-400 mt-1">100% Certified</div>
                <p className="text-xs text-gray-400 mt-1">All verified points backed by uploaded proof</p>
              </SpotlightCard>
            </div>
          </div>
        )}
      </PageTransition>

      {/* Proof Viewer Modal */}
      {selectedProof && (
        <ProofViewerModal
          isOpen={!!selectedProof}
          fileName={selectedProof.fileName}
          viewToken={selectedProof.viewToken}
          proofId={selectedProof.proofId}
          mimeType={selectedProof.mimeType}
          onClose={() => setSelectedProof(null)}
        />
      )}

      {/* Running Telemetry Mission Control Stream Footer */}
      <RunningDashboardFooter />

      {/* Living Network Field */}
      <AscendNetworkField />

    </div>
  );
}

export default function MemberDashboard() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
          <span>Loading member workspace...</span>
        </div>
      }
    >
      <MemberDashboardContent />
    </Suspense>
  );
}
