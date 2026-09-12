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
  ExternalLink,
  ShieldAlert,
  ArrowLeft,
  Filter,
  Search,
  Sparkles,
  RefreshCw
} from "lucide-react";
import ProofViewerModal from "@/components/proof-viewer-modal";

export default function StandaloneAchievementsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedProof, setSelectedProof] = useState<{
    fileName: string;
    viewToken?: string;
    proofId?: string;
    mimeType: string;
  } | null>(null);

  const loadData = () => {
    setLoading(true);
    api.getMySubmissions()
      .then((data) => setSubmissions(data))
      .catch((err) => console.error("Failed to load achievements:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const filteredSubmissions = submissions.filter((item) => {
    const matchesFilter = statusFilter === "ALL" || item.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Nav Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition px-3.5 py-1.5 rounded-xl bg-[#0E0E11] border border-zinc-800 hover:border-zinc-800"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
          <span>Back to Dashboard</span>
        </Link>
        <Link
          href="/dashboard/submit"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wide transition shadow-lg"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Submission</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl bg-[#0E0E11] border border-zinc-800 p-6 sm:p-8 relative overflow-hidden backdrop-blur-md">
        

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-zinc-400" />
              <span>OFFICIAL SUBMISSION RECORDS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              My Achievements & Proofs
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
              Real-time audit log of your submitted achievements, reviewer notes, verified points, and cryptographic proof attachments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-[#141418] border border-zinc-800 text-xs text-gray-400 hover:text-white transition flex items-center gap-2 font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0E0E11] border border-zinc-800 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-zinc-700/60 focus: transition"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 font-mono">
          {["ALL", "VERIFIED", "UNDER_REVIEW", "NEEDS_MORE_PROOF"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 ${
                statusFilter === filter
                  ? "bg-zinc-800 text-white border border-zinc-800 "
                  : "bg-[#0E0E11] text-gray-400 border border-zinc-800 hover:text-white hover:bg-[#141418]"
              }`}
            >
              {filter.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements List */}
      <div className="rounded-2xl bg-[#0E0E11] border border-zinc-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400" />
            Loading submissions...
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-8 h-8 text-gray-500 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No achievements found</h3>
            <p className="text-xs text-gray-400 mt-1">
              {searchQuery || statusFilter !== "ALL"
                ? "Try clearing filters to see more results."
                : "Submit your first achievement to start earning verified points for your team."}
            </p>
            <Link
              href="/dashboard/submit"
              className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wide transition shadow-lg"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Now</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {filteredSubmissions.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 hover:bg-[#141418]/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141418] text-gray-300 border border-zinc-800">
                      {item.category}
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      {item.date_of_activity}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>

                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>

                  {/* Feedback if any */}
                  {item.feedback_notes && (
                    <div className="mt-2 text-xs p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300">
                      <span className="font-semibold">Verifier Feedback: </span>
                      {item.feedback_notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-zinc-800">
                  {/* Points Awarded */}
                  <div className="text-left md:text-right">
                    <div className="text-sm sm:text-base font-mono font-bold text-white">
                      {item.points_awarded !== null ? (
                        <span className="text-emerald-400 font-bold">+{item.points_awarded} pts</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Pending Review</span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {item.points_awarded !== null ? "Official Points" : "Est. Rule Value"}
                    </div>
                  </div>

                  {/* Proof Button */}
                  {item.proof_documents && item.proof_documents.length > 0 && (
                    <button
                      onClick={() =>
                        setSelectedProof({
                          fileName: item.proof_documents[0].file_name || "proof_document.pdf",
                          viewToken: item.proof_documents[0].view_token,
                          mimeType: item.proof_documents[0].mime_type || "application/pdf",
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-[#141418] hover:bg-[#18181B] border border-zinc-800 text-xs text-gray-300 hover:text-white font-medium transition flex items-center gap-1.5 font-mono"
                    >
                      <FileText className="w-3.5 h-3.5 text-zinc-400" />
                      <span>View Proof</span>
                    </button>
                  )}
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
          fileName={selectedProof.fileName}
          viewToken={selectedProof.viewToken}
          proofId={selectedProof.proofId}
          mimeType={selectedProof.mimeType}
          onClose={() => setSelectedProof(null)}
        />
      )}
    </div>
  );
}
