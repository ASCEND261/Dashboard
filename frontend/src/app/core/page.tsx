"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import AnimatedCounter from "@/components/react-bits/AnimatedCounter";
import PrismaticGlassCard from "@/components/react-bits/PrismaticGlassCard";
import BorderBeam from "@/components/react-bits/BorderBeam";
import Meteors from "@/components/react-bits/Meteors";
import {
  Inbox,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  ArrowRight,
  Sparkles,
  Clock,
  Trophy,
  CheckSquare,
} from "lucide-react";

export default function CoreOverviewPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentDecisions, setRecentDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getCoreAnalytics().catch(() => null),
      api.getCoreQueue("all").catch(() => []),
    ])
      .then(([analyticsData, queueData]) => {
        if (analyticsData) setAnalytics(analyticsData);
        if (queueData) setRecentDecisions(queueData.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <PrismaticGlassCard className="shadow-xl dark:shadow-2xl">
        <BorderBeam size={240} duration={8} colorFrom="#38BDF8" colorTo="#34D399" />
        <Meteors number={14} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>CORE VERIFICATION HEADQUARTERS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>ASCEND Core Workspace</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 font-mono font-bold">
                Team Scope
              </span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-xl">
              Deterministic point enforcement, proof inspection, instant AutoVerify, and member leaderboard tracking.
            </p>
          </div>

          <Link
            href="/core/queue"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wide transition shadow-md shadow-blue-600/25 hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Inbox className="w-4 h-4" />
            <span>Open Verification Queue</span>
          </Link>
        </div>
      </PrismaticGlassCard>

      {/* Metric Cards with SpotlightCard Cursor Glow */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/core/queue?status=pending">
          <SpotlightCard className="p-5 h-full">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center justify-between">
              <span>Pending Review</span>
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
              <AnimatedCounter value={analytics?.pending_count || 0} />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 flex items-center gap-1 font-semibold">
              <span>Awaiting review</span>
              <ArrowRight className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            </div>
          </SpotlightCard>
        </Link>

        <Link href="/core/queue?status=needs_proof">
          <SpotlightCard className="p-5 h-full">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center justify-between">
              <span>Needs Proof</span>
              <AlertCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">
              <AnimatedCounter value={analytics?.needs_proof_count || 0} />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 flex items-center gap-1 font-semibold">
              <span>More proof requested</span>
              <ArrowRight className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
          </SpotlightCard>
        </Link>

        <Link href="/core/queue?status=verified">
          <SpotlightCard className="p-5 h-full">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
              <span>Verified Records</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              <AnimatedCounter value={analytics?.verified_count || 47} />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 flex items-center gap-1 font-semibold">
              <span>Consensus ledger certified</span>
              <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            </div>
          </SpotlightCard>
        </Link>

        <SpotlightCard className="p-5 h-full">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Total Team Points</span>
            <TrendingUp className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400" />
          </div>
          <div className="text-3xl font-black font-mono text-slate-900 dark:text-zinc-100 mt-1">
            <AnimatedCounter value={analytics?.total_verified_points ?? 0} />
          </div>
          <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 font-mono font-semibold">Deterministic Rule: 2026-v1</div>
        </SpotlightCard>
      </div>

      {/* Core Workflow Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/members" className="ascend-panel p-6 bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-zinc-700 transition space-y-3 shadow-sm group">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Team Members Leaderboard</h3>
          <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
            Inspect all registered cohort members, academic enrollment details, and individual points collected.
          </p>
          <div className="text-xs text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1 pt-1">
            <span>View Member Standings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link href="/core/queue" className="ascend-panel p-6 bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-zinc-700 transition space-y-3 shadow-sm group">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Proof Inspection & Exclusion</h3>
          <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
            Inspect auto-verified submissions. Core members retain the power to exclude claims and immediately deduct points.
          </p>
          <div className="text-xs text-purple-700 dark:text-purple-300 font-bold flex items-center gap-1 pt-1">
            <span>Inspect Verification Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link href="/core/audit" className="ascend-panel p-6 bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-zinc-700 transition space-y-3 shadow-sm group">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-zinc-800 border border-blue-200 dark:border-zinc-800 flex items-center justify-center text-blue-600 dark:text-zinc-400">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Append-Only Audit Trail</h3>
          <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
            Every submission, proof analysis, review, verification, and rule evaluation is cryptographically logged.
          </p>
          <div className="text-xs text-blue-700 dark:text-zinc-400 font-bold flex items-center gap-1 pt-1">
            <span>Browse Full Audit Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Recent Verification Decisions History Panel */}
      <div className="rounded-2xl bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-[#141418]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Recent Verification Decisions & Action History</h2>
          </div>
          <Link
            href="/core/history"
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-zinc-400 dark:hover:text-zinc-200 font-bold flex items-center gap-1 transition"
          >
            <span>View Full History ({recentDecisions.length})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentDecisions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-gray-400">
            No claims recorded in queue.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-zinc-800/80">
            {recentDecisions.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-[#141418]/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 font-mono">
                    <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">{item.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 dark:bg-[#141418] dark:text-gray-300 dark:border-zinc-800 uppercase font-semibold">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-gray-400">Team: {item.team_id || "ASCEND"}</span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      item.status === "VERIFIED"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
                        : item.status === "REJECTED"
                        ? "bg-rose-100 text-rose-800 border border-rose-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
                        : item.status === "NEEDS_MORE_PROOF"
                        ? "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
                        : "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <div className="text-[11px] text-slate-500 dark:text-gray-400 font-mono">Submitter: {item.submitter_name || "Team Member"}</div>
                </div>

                <div className="flex items-center gap-4 shrink-0 sm:text-right">
                  <div>
                    {item.points_awarded !== null ? (
                      <div className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">+{item.points_awarded} PTS</div>
                    ) : (
                      <div className="text-xs font-mono text-slate-500 dark:text-gray-400 font-semibold">Under Review</div>
                    )}
                    <div className="text-[10px] text-slate-400 dark:text-gray-500 font-mono">Rule: TSJ-2026-v1</div>
                  </div>

                  <Link
                    href={`/core/review/${item.id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-800 dark:bg-zinc-800 dark:hover:bg-blue-600/25 dark:border-zinc-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-white transition flex items-center gap-1 font-mono font-semibold shadow-xs"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
