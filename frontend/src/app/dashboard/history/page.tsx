"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Inbox,
  PlusCircle,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Search,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import ProofViewerModal from "@/components/proof-viewer-modal";
import PageTransition from "@/components/react-bits/PageTransition";

export default function MemberHistoryPage() {
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
    api.getMySubmissions()
      .then((data) => setSubmissions(data))
      .catch((err) => console.error("Failed to load submission history:", err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="status-pill status-verified">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Verified & Sealed
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

  const filtered = submissions.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      item.status === filterStatus ||
      (filterStatus === "UNDER_REVIEW" && item.status === "SUBMITTED");
    return matchesSearch && matchesFilter;
  });

  const verifiedTotal = submissions.filter((s) => s.status === "VERIFIED");
  const pointsTotal = verifiedTotal.reduce((acc, s) => acc + (s.points_awarded || 0), 0);
  const pendingTotal = submissions.filter(
    (s) => s.status === "SUBMITTED" || s.status === "UNDER_REVIEW" || s.status === "NEEDS_MORE_PROOF"
  );

  return (
    <PageTransition>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-gray-400">
              <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-white transition flex items-center gap-1 font-semibold">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <span>/</span>
              <span className="text-slate-800 dark:text-zinc-400 font-bold">Submission History</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>My Achievement Audit History</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-800 font-mono font-bold">
                {submissions.length} Records
              </span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-gray-400">
              Chronological log of submitted claims, verifier notes, points minted, and cryptographic proof hashes.
            </p>
          </div>

          <Link
            href="/dashboard/submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/25 shrink-0 hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit New Claim</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-gray-400 font-semibold">Total Submissions</div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">{submissions.length}</div>
            <div className="text-[10px] text-slate-400 dark:text-gray-500 font-mono">All-time claims recorded</div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#0E0E11] border border-emerald-200 dark:border-emerald-500/20 shadow-xs">
            <div className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-semibold">Verified & Sealed</div>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">{verifiedTotal.length}</div>
            <div className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70 font-mono">100% Core certified</div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-zinc-400 font-semibold">Total Points Minted</div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-zinc-100 mt-1">+{pointsTotal}</div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-400/70 font-mono">Deterministic formula</div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#0E0E11] border border-amber-200 dark:border-amber-500/20 shadow-xs">
            <div className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-semibold">In Verification Triage</div>
            <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-300 mt-1">{pendingTotal.length}</div>
            <div className="text-[10px] text-amber-600/70 dark:text-amber-500/70 font-mono">Awaiting core review</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search history by title, ID, category..."
              className="w-full bg-slate-50 dark:bg-[#141418] border border-slate-200 dark:border-zinc-800 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {[
              { id: "all", label: `All (${submissions.length})` },
              { id: "VERIFIED", label: `Verified (${verifiedTotal.length})` },
              { id: "UNDER_REVIEW", label: `In Review (${pendingTotal.length})` },
              { id: "NEEDS_MORE_PROOF", label: "Needs Proof" },
              { id: "REJECTED", label: "Rejected" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition shrink-0 ${
                  filterStatus === f.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-[#141418] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="rounded-2xl bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-[#141418]">
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-gray-300 uppercase">
              Audit Records ({filtered.length})
            </span>
            <span className="text-[10px] text-slate-500 dark:text-gray-500 font-mono">Immutable audit ledger</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-gray-400 font-mono">
              Loading submission history...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Inbox className="w-8 h-8 text-slate-400 dark:text-gray-500 mx-auto" />
              <p className="text-xs text-slate-600 dark:text-gray-400">No matching claims found in your submission history.</p>
              <Link
                href="/dashboard/submit"
                className="inline-block text-xs text-blue-600 dark:text-zinc-400 hover:underline pt-1 font-semibold"
              >
                Submit an achievement to start earning verified points
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filtered.map((item) => (
                <div key={item.id} className="p-5 hover:bg-slate-50/70 dark:hover:bg-[#141418]/50 transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 font-mono">
                      <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">{item.id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#141418] text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-zinc-800 uppercase">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-gray-400">Date: {item.date_of_activity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-1 leading-relaxed">{item.description}</p>
                  </div>

                  {/* Reviewer remarks if present */}
                  {item.reviewer_note && (
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-100 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-zinc-200 font-mono">Verifier Note: </span>
                        <span>{item.reviewer_note}</span>
                      </div>
                    </div>
                  )}
                  {item.proof_request_reason && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-900 dark:text-amber-300 font-mono">Clarification Needed: </span>
                        <span>{item.proof_request_reason}</span>
                      </div>
                    </div>
                  )}
                  {item.rejection_reason && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/30 text-xs text-red-800 dark:text-red-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-red-900 dark:text-red-300 font-mono">Rejection Reason: </span>
                        <span>{item.rejection_reason}</span>
                      </div>
                    </div>
                  )}

                  {/* Footer with points, rules, proof inspection */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3 text-xs font-mono">
                      {item.points_awarded !== null ? (
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>+{item.points_awarded} Points Awarded</span>
                          <span className="text-[10px] text-slate-400 dark:text-gray-500 font-normal">(Rule TSJ-2026-v1)</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 dark:text-gray-400">Score derivation in queue</span>
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
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-[#141418] dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-gray-200 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5 font-mono shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          <span>Inspect Proof Document</span>
                        </button>
                      )}
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
