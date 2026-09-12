"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Inbox,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Search,
  ArrowRight,
  ShieldCheck,
  FileText,
  ArrowLeft,
} from "lucide-react";
import ProofViewerModal from "@/components/proof-viewer-modal";
import PageTransition from "@/components/react-bits/PageTransition";

export default function CoreHistoryPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Proof Modal state
  const [selectedProof, setSelectedProof] = useState<{
    fileName: string;
    viewToken?: string;
    proofId?: string;
    mimeType: string;
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getCoreQueue("all")
      .then((data) => setSubmissions(data))
      .catch((err) => console.error("Failed to load core history:", err))
      .finally(() => setLoading(false));
  }, []);

  const getDecisionBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="status-pill status-verified">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Verified & Sealed
          </span>
        );
      case "NEEDS_MORE_PROOF":
        return (
          <span className="status-pill status-needs_more_proof">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Proof Requested
          </span>
        );
      case "REJECTED":
        return (
          <span className="status-pill status-rejected">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-red-400" />
            Rejected
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="status-pill status-under_review">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Under Review
          </span>
        );
      default:
        return (
          <span className="status-pill status-submitted">
            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-gray-400" />
            Pending Triage
          </span>
        );
    }
  };

  const filtered = submissions.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.submitter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.team_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      item.status === filterStatus ||
      (filterStatus === "decided" && (item.status === "VERIFIED" || item.status === "REJECTED" || item.status === "NEEDS_MORE_PROOF"));
    return matchesSearch && matchesFilter;
  });

  const verifiedList = submissions.filter((s) => s.status === "VERIFIED");
  const rejectedList = submissions.filter((s) => s.status === "REJECTED");
  const proofReqList = submissions.filter((s) => s.status === "NEEDS_MORE_PROOF");
  const pointsTotal = verifiedList.reduce((acc, s) => acc + (s.points_awarded || 0), 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 backdrop-blur-md relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-gray-400 mb-1">
              <Link href="/core" className="hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1 font-semibold">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Core Overview</span>
              </Link>
              <span>/</span>
              <span className="text-blue-600 dark:text-zinc-400 font-bold">Verification History</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>Verification Decisions & History Log</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 font-mono font-bold">
                {submissions.length} Claims Total
              </span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-gray-400 mt-1 max-w-xl">
              Authoritative, auditable record of all core triage reviews, point derivations, and cryptographic proof verifications.
            </p>
          </div>

          <Link
            href="/core/queue"
            className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/20 shrink-0"
          >
            <Inbox className="w-4 h-4" />
            <span>Open Triage Queue</span>
          </Link>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-gray-400 font-semibold">Total Ingested</div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">{submissions.length}</div>
            <div className="text-[10px] text-slate-400 font-mono">Cohort-wide claims</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-[#0E0E11] border border-emerald-200 dark:border-emerald-500/20 shadow-xs">
            <div className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400 font-semibold">Verified & Sealed</div>
            <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1">{verifiedList.length}</div>
            <div className="text-[10px] text-emerald-700/80 dark:text-emerald-500/70 font-mono font-medium">Ledger Applied & Certified</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="text-[10px] font-mono uppercase text-slate-600 dark:text-zinc-400 font-semibold">Points Minted</div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-zinc-100 mt-1">+{pointsTotal}</div>
            <div className="text-[10px] text-slate-500 dark:text-zinc-400/70 font-mono font-medium">TSJ-2026-v1 Rulebook</div>
          </div>
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-[#0E0E11] border border-amber-200 dark:border-amber-500/20 shadow-xs">
            <div className="text-[10px] font-mono uppercase text-amber-700 dark:text-amber-400 font-semibold">Proof Requests</div>
            <div className="text-2xl font-black font-mono text-amber-800 dark:text-amber-300 mt-1">{proofReqList.length}</div>
            <div className="text-[10px] text-amber-700/80 dark:text-amber-500/70 font-mono font-medium">Clarifications issued</div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student, team, claim ID, category..."
              className="w-full bg-slate-50 dark:bg-[#141418] border border-slate-300 dark:border-zinc-800 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {[
              { id: "all", label: `All (${submissions.length})` },
              { id: "VERIFIED", label: `Verified (${verifiedList.length})` },
              { id: "NEEDS_MORE_PROOF", label: `Needs Proof (${proofReqList.length})` },
              { id: "REJECTED", label: `Rejected (${rejectedList.length})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition shrink-0 ${
                  filterStatus === f.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 dark:bg-[#141418] dark:text-gray-400 dark:border-zinc-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Decisions History Table */}
        <div className="rounded-2xl bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-[#141418]">
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-gray-300 uppercase">
              Authoritative Verification Decisions ({filtered.length})
            </span>
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Tamper-Evident Ledger</span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-gray-400 font-mono">
              Loading verification history records...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-gray-400">
              No verification records matching your search query.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-zinc-800/80">
              {filtered.map((item) => (
                <div key={item.id} className="p-5 hover:bg-slate-50/80 dark:hover:bg-[#141418]/50 transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 font-mono">
                      <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">{item.id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 dark:bg-[#141418] dark:text-gray-300 dark:border-zinc-800 uppercase font-semibold">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-gray-400">
                        Team: {item.team_id || "ASCEND"} • Submitter: {item.submitter_name || "Team Member"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDecisionBadge(item.status)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">{item.description}</p>
                  </div>

                  {/* Review justification / verifier remarks */}
                  {item.reviewer_note && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-100 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-zinc-200 font-mono">Core Verifier Note: </span>
                        <span>{item.reviewer_note}</span>
                      </div>
                    </div>
                  )}
                  {item.rejection_reason && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-red-950/30 border border-rose-200 dark:border-red-500/30 text-xs text-rose-800 dark:text-red-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-rose-800 dark:text-red-300 font-mono">Ineligibility Justification: </span>
                        <span>{item.rejection_reason}</span>
                      </div>
                    </div>
                  )}
                  {item.proof_request_reason && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-800 dark:text-amber-300 font-mono">Clarification Directive: </span>
                        <span>{item.proof_request_reason}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 text-xs font-mono">
                      {item.points_awarded !== null ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          +{item.points_awarded} PTS Derivation Sealed
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-gray-400">0 Points Awarded</span>
                      )}
                      <span className="text-slate-400 dark:text-gray-500 text-[10px]">Rulebook: TSJ-2026-v1</span>
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
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-800 dark:bg-[#141418] dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-gray-200 dark:hover:text-white transition flex items-center gap-1.5 font-mono font-semibold shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                          <span>Inspect Proof Document</span>
                        </button>
                      )}

                      <Link
                        href={`/core/review/${item.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-xs text-slate-800 hover:text-blue-700 dark:bg-zinc-800 dark:hover:bg-blue-600/25 dark:border-zinc-800 dark:text-zinc-200 dark:hover:text-white transition flex items-center gap-1 font-mono font-semibold shadow-xs"
                      >
                        <span>Re-inspect Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Proof Viewer Modal */}
        {selectedProof && (
          <ProofViewerModal
            isOpen={!!selectedProof}
            onClose={() => setSelectedProof(null)}
            fileName={selectedProof.fileName}
            viewToken={selectedProof.viewToken}
            proofId={selectedProof.proofId}
            mimeType={selectedProof.mimeType}
          />
        )}
      </div>
    </PageTransition>
  );
}
