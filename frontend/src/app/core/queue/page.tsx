"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import {
  Inbox,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  FileText,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { PrismaticGlassCard } from "@/components/react-bits/PrismaticGlassCard";
import { BorderBeam } from "@/components/react-bits/BorderBeam";
import { GradientText } from "@/components/react-bits/GradientText";
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
        return <span className="status-pill status-verified"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified</span>;
      case "NEEDS_MORE_PROOF":
        return <span className="status-pill status-needs_more_proof"><AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Needs Proof</span>;
      case "REJECTED":
        return <span className="status-pill status-rejected"><XCircle className="w-3.5 h-3.5 text-red-400" /> Rejected</span>;
      default:
        return <span className="status-pill status-under_review"><Clock className="w-3.5 h-3.5 text-amber-400" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <PrismaticGlassCard className="p-6" glowColor="rgba(96, 165, 250, 0.15)">
        <BorderBeam size={180} duration={10} colorFrom="#60a5fa" colorTo="#3b82f6" />
        <Meteors number={12} />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-blue-400/90 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>VERIFICATION TRIAGE WORKSPACE</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Verification Queue</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                LIVE
              </span>
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 max-w-xl">
              Core Member inspection queue. Evaluate member claims, proof integrity, and AI consistency flags.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="font-mono text-[11px]">Deterministic Point Evaluation Active</span>
          </div>
        </div>
      </PrismaticGlassCard>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0E0E11] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? "bg-blue-600 text-white shadow-md "
                  : "text-gray-400 hover:text-white hover:bg-[#141418]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID or title..."
            className="w-full bg-[#141418] border border-zinc-800 rounded-xl pl-8 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-zinc-700/60 focus: transition"
          />
        </div>
      </div>

      {/* Queue Table */}
      <PrismaticGlassCard className="p-0 overflow-hidden" glowColor="rgba(96, 165, 250, 0.08)">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-[#141418] text-gray-400 font-mono uppercase text-[10px] tracking-wider">
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
            <tbody className="divide-y divide-zinc-800/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    <div className="flex items-center justify-center gap-2 font-mono text-xs">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                      <span>Fetching verification records...</span>
                    </div>
                  </td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40 text-zinc-400" />
                    <p className="font-semibold text-white text-xs">You&apos;re all caught up.</p>
                    <p className="text-[11px]">No achievements are currently waiting in this filter.</p>
                  </td>
                </tr>
              ) : (
                queue.map((item) => (
                  <tr key={item.id} className="hover:bg-[#141418]/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-400">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-white truncate">{item.title}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{item.achievement_date}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-200">{item.member_name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{item.department_code || "CSE"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#141418] text-gray-300 border border-zinc-800 font-mono">
                        {item.category_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {item.proof_count > 0 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-800 flex items-center gap-1 font-mono">
                            <FileText className="w-3 h-3 text-zinc-400" />
                            <span>{item.proof_count} Proof</span>
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-800/40 font-mono">
                            Missing
                          </span>
                        )}
                        {item.has_ai_flags && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-500/30 flex items-center gap-0.5 font-mono" title="AI Review Assistance Flags Detected">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            <span>AI</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      {item.estimated_points ? (
                        <span className="text-emerald-400 font-bold">+{item.estimated_points} pts</span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/core/review/${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide transition shadow-sm"
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
      </PrismaticGlassCard>
    </div>
  );
}

export default function VerificationQueuePage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />
          <span>Loading verification queue...</span>
        </div>
      }
    >
      <VerificationQueueContent />
    </Suspense>
  );
}
