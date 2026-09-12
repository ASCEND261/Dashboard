"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  ShieldAlert,
  Scale,
  Users,
  RefreshCw,
  FileText,
  Building,
  ArrowRight,
  ShieldCheck,
  Plus,
  UserCheck,
  CheckSquare,
  Sparkles,
  Lock,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  GraduationCap,
  Layers,
  AlertCircle,
  ExternalLink,
  Zap,
  Check,
  X,
  Copy
} from "lucide-react";
import PrismaticGlassCard from "@/components/react-bits/PrismaticGlassCard";
import BorderBeam from "@/components/react-bits/BorderBeam";
import GradientText from "@/components/react-bits/GradientText";
import Meteors from "@/components/react-bits/Meteors";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Data states
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [membersLeaderboard, setMembersLeaderboard] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Verification Desk states
  const [activeDeskTab, setActiveDeskTab] = useState<"candidates" | "achievements">("candidates");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<{
    id: string;
    type: "candidate" | "achievement";
    message: string;
    accessCode?: string;
  } | null>(null);

  // Fetch all admin data
  const loadAdminData = useCallback(async (isSilent: boolean = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const [reqs, queue, leaderboard, verData] = await Promise.all([
        api.getAccessRequests().catch(() => []),
        api.getCoreQueue("pending").catch(() => []),
        api.getTeamMembersLeaderboard().catch(() => []),
        api.getRuleVersions().catch(() => []),
      ]);

      setAccessRequests(Array.isArray(reqs) ? reqs : []);
      setPendingQueue(Array.isArray(queue) ? queue : []);
      setMembersLeaderboard(Array.isArray(leaderboard) ? leaderboard : []);
      setVersions(Array.isArray(verData) ? verData : []);
    } catch (err) {
      console.error("Admin data refresh error:", err);
    } finally {
      setDataLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadAdminData();

    // Real-time background sync every 5 seconds
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      loadAdminData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [loadAdminData]);

  // Handle Candidate Approval directly from the front card
  const handleApproveCandidate = async (reqId: string, candidateName: string, candidateEmail: string) => {
    setProcessingId(reqId);
    try {
      const res = await api.approveAccessRequest(reqId);
      setActionSuccessMessage({
        id: reqId,
        type: "candidate",
        message: `Candidate ${candidateName} approved!`,
        accessCode: (res as any)?.access_code,
      });

      // Update state locally immediately
      setAccessRequests((prev) => prev.filter((r) => r.id !== reqId));

      // Re-fetch leaderboard to reflect newly approved member
      api.getTeamMembersLeaderboard()
        .then((data) => setMembersLeaderboard(data || []))
        .catch(() => {});
    } catch (err: any) {
      alert(err.message || "Failed to approve candidate");
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Candidate Rejection directly from the front card
  const handleRejectCandidate = async (reqId: string, candidateName: string) => {
    const reason = prompt(`Reason for rejecting ${candidateName}:`, "Registration details did not meet requirements.");
    if (reason === null) return;

    setProcessingId(reqId);
    try {
      await api.rejectAccessRequest(reqId, reason);
      setActionSuccessMessage({
        id: reqId,
        type: "candidate",
        message: `Candidate ${candidateName} was rejected.`,
      });
      setAccessRequests((prev) => prev.filter((r) => r.id !== reqId));
    } catch (err: any) {
      alert(err.message || "Failed to reject candidate");
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Achievement Quick Verification directly from front card
  const handleQuickVerifyAchievement = async (achievementId: string, claimTitle: string) => {
    setProcessingId(achievementId);
    try {
      await api.verifySubmission(achievementId, {
        rule_version: "TSJ-2026-v1",
        override_reason: "Fast verified by Administrator",
      });

      setActionSuccessMessage({
        id: achievementId,
        type: "achievement",
        message: `Achievement "${claimTitle}" verified! Points awarded to team ledger.`,
      });

      setPendingQueue((prev) => prev.filter((item) => item.id !== achievementId));

      // Refresh leaderboard
      api.getTeamMembersLeaderboard()
        .then((data) => setMembersLeaderboard(data || []))
        .catch(() => {});
    } catch (err: any) {
      alert(err.message || "Failed to verify achievement");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-xs font-mono text-zinc-400 animate-pulse flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>Loading Superadmin Governance Console...</span>
        </div>
      </div>
    );
  }

  const roleUpper = (user?.role || "").toUpperCase();
  const isAdmin = roleUpper.includes("ADMIN") || roleUpper.includes("CORE");

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-6">
        <PrismaticGlassCard className="p-8 text-center space-y-4 border-red-500/30">
          <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-800 text-red-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Administrator Access Required</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The System Governance Console is restricted to authorized platform administrators. Please sign in via the Admin Terminal.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition shadow-lg shadow-red-600/30"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Go to Admin Governance Terminal</span>
            </Link>
          </div>
        </PrismaticGlassCard>
      </div>
    );
  }

  const pendingCandidates = accessRequests.filter((r) => r.status === "PENDING");
  const totalPendingVerifications = pendingCandidates.length + pendingQueue.length;

  return (
    <div className="max-w-6xl mx-auto px-3.5 py-4 sm:px-6 sm:py-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-zinc-200 dark:border-white/8">
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SYSTEM GOVERNANCE CONSOLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mt-1 flex items-center gap-2.5 flex-wrap">
            <GradientText colors={["#DC2626", "#EA580C", "#2563EB", "#7C3AED"]}>
              ASCEND Administration
            </GradientText>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 font-mono font-bold">
              SUPERADMIN
            </span>
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Authorize candidate accounts, verify achievements with real-time points, inspect leaderboard standings, and audit cryptographically signed ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => loadAdminData(false)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 transition hover:text-zinc-900 dark:hover:text-white shadow-sm"
            title="Refresh Realtime Sync"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-500" : "text-zinc-400"}`} />
            <span className="font-mono text-[11px] font-medium">{isRefreshing ? "Syncing..." : "Sync Live"}</span>
          </button>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-xs text-red-700 dark:text-red-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-mono text-[11px]">Sarthak (Full Governance)</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🚀 PROMINENT FRONT VERIFICATION DESK CARD (FAST APPROVAL & TRIAGE)        */}
      {/* ========================================================================= */}
      <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-gradient-to-b dark:from-[#0e131f] dark:via-[#090b11] dark:to-[#08090d] border border-blue-200 dark:border-blue-500/30 p-4 sm:p-6 shadow-xl shadow-slate-200/50 dark:shadow-blue-950/40">
        <BorderBeam size={250} duration={8} colorFrom="#38bdf8" colorTo="#3b82f6" />
        <Meteors number={8} />

        {/* Action Success Toast Banner */}
        {actionSuccessMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium">{actionSuccessMessage.message}</span>
              {actionSuccessMessage.accessCode && (
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-400/50 text-emerald-900 dark:text-white font-mono font-bold tracking-widest text-[11px]">
                  CODE: {actionSuccessMessage.accessCode}
                </span>
              )}
            </div>
            <button
              onClick={() => setActionSuccessMessage(null)}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-white text-xs p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-400/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/10">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  Fast Verification Action Desk
                </h2>
                {totalPendingVerifications > 0 ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 animate-pulse">
                    {totalPendingVerifications} AWAITING ACTION
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" /> ALL VERIFIED
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Verify student access requests and validate submitted achievements in seconds directly from the front dashboard.
              </p>
            </div>
          </div>

          {/* Desk Tabs Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/10 w-full sm:w-auto justify-center sm:justify-start shrink-0">
            <button
              onClick={() => setActiveDeskTab("candidates")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeDeskTab === "candidates"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Candidates</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                pendingCandidates.length > 0 ? "bg-blue-800 dark:bg-blue-900 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400"
              }`}>
                {pendingCandidates.length}
              </span>
            </button>

            <button
              onClick={() => setActiveDeskTab("achievements")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeDeskTab === "achievements"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Claims</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                pendingQueue.length > 0 ? "bg-purple-800 dark:bg-purple-900 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400"
              }`}>
                {pendingQueue.length}
              </span>
            </button>
          </div>
        </div>

        {/* Desk Body Content */}
        <div className="pt-4 relative z-10">
          {/* TAB 1: CANDIDATE ACCESS REQUESTS */}
          {activeDeskTab === "candidates" && (
            <div>
              {pendingCandidates.length === 0 ? (
                <div className="py-8 text-center rounded-xl bg-slate-50/80 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800/60 p-6 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-600/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No Pending Candidate Requests</div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                    All candidates have been authorized. When a new candidate registers, their details will appear here immediately for instant verification.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-mono text-zinc-400 flex items-center justify-between">
                    <span>{pendingCandidates.length} candidate(s) awaiting verification</span>
                    <span className="text-[10px] text-blue-400">1-Click Fast Approval Enabled</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {pendingCandidates.map((req) => (
                      <div
                        key={req.id}
                        className="rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-blue-500/40 p-4 transition-all duration-200 space-y-3 relative group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                              {req.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white leading-tight">{req.name}</div>
                              <div className="text-[11px] font-mono text-zinc-400">{req.email}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-700/50 shrink-0">
                            PENDING
                          </span>
                        </div>

                        {/* Academic metadata tags */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                          {req.enrollment_number && (
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                              Enr: {req.enrollment_number}
                            </span>
                          )}
                          {req.branch && (
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-blue-300">
                              {req.branch} {req.section ? `(Sec ${req.section})` : ""}
                            </span>
                          )}
                          {req.department && (
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-300">
                              Dept: {req.department}
                            </span>
                          )}
                        </div>

                        {/* Fast Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
                          <button
                            onClick={() => handleRejectCandidate(req.id, req.name)}
                            disabled={processingId === req.id}
                            className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 text-red-300 text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>

                          <button
                            onClick={() => handleApproveCandidate(req.id, req.name, req.email)}
                            disabled={processingId === req.id}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                          >
                            {processingId === req.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Approve & Grant Code</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PENDING ACHIEVEMENT SUBMISSIONS */}
          {activeDeskTab === "achievements" && (
            <div>
              {pendingQueue.length === 0 ? (
                <div className="py-8 text-center rounded-xl bg-zinc-950/40 border border-zinc-800/60 p-6 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-purple-950/40 border border-purple-600/30 text-purple-400 flex items-center justify-center mx-auto">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-zinc-200">Verification Queue Clear</div>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto">
                    All submitted achievements have been evaluated. Newly submitted evidence will appear here for immediate triage.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-mono text-zinc-400 flex items-center justify-between">
                    <span>{pendingQueue.length} claim(s) awaiting verification</span>
                    <Link href="/core/queue" className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
                      <span>Open Full Queue</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {pendingQueue.slice(0, 4).map((claim) => (
                      <div
                        key={claim.id}
                        className="rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-purple-500/40 p-4 transition-all duration-200 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                              {claim.category_name || "ACHIEVEMENT CLAIM"}
                            </div>
                            <h4 className="text-sm font-bold text-white line-clamp-1 mt-0.5">{claim.title}</h4>
                            <div className="text-[11px] text-zinc-400 mt-0.5">By: {claim.member_name || "Team Member"}</div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-700/50 shrink-0">
                            PENDING REVIEW
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                          <Link
                            href={`/core/submissions/${claim.id}`}
                            className="text-xs text-zinc-400 hover:text-zinc-200 font-mono flex items-center gap-1"
                          >
                            <span>Inspect Proof</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>

                          <button
                            onClick={() => handleQuickVerifyAchievement(claim.id, claim.title)}
                            disabled={processingId === claim.id}
                            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
                          >
                            {processingId === claim.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Quick Verify</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Candidate Access Control Queue */}
        <div className="ascend-panel p-4 sm:p-5 space-y-3 relative overflow-hidden border-blue-500/30 hover:border-blue-500/60 transition shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <UserCheck className="w-5 h-5" />
            </div>
            {pendingCandidates.length > 0 && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40 animate-pulse">
                {pendingCandidates.length} PENDING
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Access Authorization Queue</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
              Authorize student candidates, branch & section mappings before access codes are granted.
            </p>
          </div>
          <div className="pt-1">
            <Link
              href="/admin/access-requests"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              <span>Manage Access Requests</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 2. Verification Review Queue */}
        <div className="ascend-panel p-4 sm:p-5 space-y-3 relative overflow-hidden border-purple-500/30 hover:border-purple-500/60 transition shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            {pendingQueue.length > 0 && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/40 animate-pulse">
                {pendingQueue.length} CLAIMS
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Verification Triage Queue</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
              Inspect submitted certificates, auto-verified proofs, and exclude claims with point deduction.
            </p>
          </div>
          <div className="pt-1">
            <Link
              href="/core/queue"
              className="inline-flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold"
            >
              <span>Open Review Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 3. Team Members Leaderboard */}
        <div className="ascend-panel p-4 sm:p-5 space-y-3 relative overflow-hidden border-amber-500/30 hover:border-amber-500/60 transition shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
              {membersLeaderboard.length} Members
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Team Members Management</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
              Inspect all registered cohort members, live points, and remove inactive or invalid accounts.
            </p>
          </div>
          <div className="pt-1">
            <Link
              href="/admin/members"
              className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
            >
              <span>Open Members & Remove</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4. Append-Only System Audit Ledger */}
        <div className="ascend-panel p-4 sm:p-5 space-y-3 relative overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">System Security & Audit</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
              Inspect cryptographically recorded audit trail across all actions, scores, and verifiers.
            </p>
          </div>
          <div className="pt-1">
            <Link
              href="/core/audit"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              <span>Inspect Audit Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Live Team Members Leaderboard Table */}
      <div className="ascend-panel p-4 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-white/8">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Live Team Members Points Leaderboard (Clean 0 Baseline)</span>
          </div>
          <Link
            href="/admin/members"
            className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-mono flex items-center gap-1 font-semibold"
          >
            <span>Manage & Remove Members</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {dataLoading && membersLeaderboard.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs">
            Loading team member scores...
          </div>
        ) : membersLeaderboard.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs">
            No registered members found.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left border-collapse min-w-[540px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-14 text-center">Rank</th>
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3">Academic Info</th>
                  <th className="py-2.5 px-3 text-center">Verified</th>
                  <th className="py-2.5 px-3 text-right">Points Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/60 text-xs">
                {membersLeaderboard.slice(0, 10).map((m, idx) => (
                  <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                        idx === 0 && m.points > 0
                          ? "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-600/50 font-bold"
                          : idx === 1 && m.points > 0
                          ? "text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-600/50"
                          : idx === 2 && m.points > 0
                          ? "text-amber-800 dark:text-amber-600 bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40"
                          : "text-zinc-400 dark:text-zinc-500"
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-zinc-900 dark:text-white">{m.name}</div>
                      <div className="text-[11px] text-zinc-600 dark:text-zinc-400 font-mono">{m.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-[11px] font-mono text-zinc-800 dark:text-zinc-300">
                        {m.enrollment_number || "—"}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        {m.branch || "CSE"} • Sec: {m.section || "A"} {m.department ? `• ${m.department}` : ""}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {m.verified_count}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-600/30 text-amber-800 dark:text-amber-300 font-mono font-bold text-xs">
                        <Trophy className="w-3 h-3 text-amber-500" />
                        <span>{m.points}</span>
                        <span className="text-[10px] font-normal text-amber-600 dark:text-amber-400/80">pts</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
