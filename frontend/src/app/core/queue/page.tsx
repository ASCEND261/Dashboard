"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import {
  Inbox,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { PrismaticGlassCard } from "@/components/react-bits/PrismaticGlassCard";
import { BorderBeam } from "@/components/react-bits/BorderBeam";
import { Meteors } from "@/components/react-bits/Meteors";

function VerificationQueueContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "pending";

  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState("");
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getCoreQueue(statusFilter, searchTerm)
      .then((data) => setQueue(data))
      .catch((err) => console.error("Failed to load queue:", err))
      .finally(() => setLoading(false));
  }, [statusFilter, searchTerm]);

  const tabs = [
    { id: "pending", label: "Pending Review" },
    { id: "needs_proof", label: "Needs Proof" },
    { id: "verified", label: "Verified Records" },
    { id: "all", label: "All Records" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <span className="status-pill status-verified"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Verified</span>;
      case "NEEDS_MORE_PROOF":
        return <span className="status-pill status-needs_more_proof"><AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Needs Proof</span>;
      case "REJECTED":
        return <span className="status-pill status-rejected"><XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-red-400" /> Rejected</span>;
      default:
        return <span className="status-pill status-under_review"><Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <PrismaticGlassCard className="p-6 shadow-sm" glowColor="rgba(96, 165, 250, 0.15)">
        <BorderBeam size={180} duration={10} colorFrom="#3b82f6" colorTo="#60a5fa" />
        <Meteors number={12} />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>VERIFICATION TRIAGE WORKSPACE</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>Verification Queue</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 font-bold">
                LIVE
              </span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5 max-w-xl">
              Core Member inspection queue. Evaluate member claims, proof integrity, and AI consistency flags.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-800 dark:text-blue-300 backdrop-blur-md shadow-xs">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-mono text-[11px] font-semibold">Deterministic Point Evaluation Active</span>
          </div>
        </div>
      </PrismaticGlassCard>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-[#141418]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID or title..."
            className="w-full bg-slate-50 dark:bg-[#141418] border border-slate-200 dark:border-zinc-800 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition shadow-xs"
          />
        </div>
      </div>

      {/* Queue Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#141418] text-slate-600 dark:text-gray-400 font-mono uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4">Claim / Title</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Proof & Flags</th>
                <th className="py-3 px-4">Rule Preview</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-zinc-400">
                    <div className="flex items-center justify-center gap-2 font-mono text-xs">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                      <span>Fetching verification records...</span>
                    </div>
                  </td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-gray-400">
                    <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-bold text-slate-900 dark:text-white text-xs">You&apos;re all caught up.</p>
                    <p className="text-[11px] mt-0.5">No achievements are currently waiting in this filter.</p>
                  </td>
                </tr>
              ) : (
                queue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-[#141418]/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600 dark:text-zinc-400">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 dark:text-white truncate">{item.title}</div>
                      <div className="text-[10px] text-slate-500 dark:text-gray-400 font-mono">{item.achievement_date}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-gray-200">{item.member_name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-gray-400 font-mono">{item.department_code || "CSE"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 dark:bg-[#141418] dark:text-gray-300 border border-slate-200 dark:border-zinc-800 font-mono font-medium">
                        {item.category_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {item.proof_count > 0 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-800 flex items-center gap-1 font-mono font-medium">
                            <FileText className="w-3 h-3 text-slate-500 dark:text-zinc-400" />
                            <span>{item.proof_count} Proof</span>
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40 font-mono font-medium">
                            Missing
                          </span>
                        )}
                        {item.has_ai_flags && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-500/30 flex items-center gap-0.5 font-mono font-bold" title="AI Review Assistance Flags Detected">
                            <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                            <span>AI</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      {item.estimated_points ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{item.estimated_points} pts</span>
                      ) : (
                        <span className="text-slate-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/core/review/${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wide transition shadow-xs active:scale-[0.98]"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function VerificationQueuePage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading verification queue...</span>
        </div>
      }
    >
      <VerificationQueueContent />
    </Suspense>
  );
}
