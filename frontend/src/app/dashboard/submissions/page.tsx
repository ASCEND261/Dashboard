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
  Sparkles
} from "lucide-react";
import ProofViewerModal from "@/components/proof-viewer-modal";
import { PrismaticGlassCard } from "@/components/react-bits/PrismaticGlassCard";
import { BorderBeam } from "@/components/react-bits/BorderBeam";
import { GradientText } from "@/components/react-bits/GradientText";
import { Meteors } from "@/components/react-bits/Meteors";

export default function SubmissionCenterPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Proof Modal state
  const [selectedProof, setSelectedProof] = useState<{
    fileName: string;
    viewToken?: string;
    proofId?: string;
    mimeType: string;
  } | null>(null);

  useEffect(() => {
    api.getMySubmissions()
      .then((data) => setSubmissions(data))
      .catch((err) => console.error("Failed to load my submissions:", err))
      .finally(() => setLoading(false));
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
            Needs More Proof
          </span>
        );
      case "REJECTED":
        return (
          <span className="status-pill status-rejected">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            Ineligible / Rejected
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

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <PrismaticGlassCard className="p-5" glowColor="rgba(96, 165, 250, 0.15)">
        <BorderBeam size={160} duration={9} colorFrom="#60a5fa" colorTo="#3b82f6" />
        <Meteors number={10} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono font-medium uppercase tracking-wider text-blue-400/90 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>MEMBER VERIFICATION STATUS</span>
            </div>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              <span>Submission Center</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                AUDITED
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5 max-w-xl">
              Real-time status of your submitted achievements. Review Core Member feedback, verification logs, and awarded points.
            </p>
          </div>

          <Link
            href="/dashboard/submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Submission</span>
          </Link>
        </div>
      </PrismaticGlassCard>

      {/* Submission List */}
      <PrismaticGlassCard className="overflow-hidden p-0" glowColor="rgba(96, 165, 250, 0.08)">
        <div className="px-5 py-3.5 border-b border-zinc-800/80 flex items-center justify-between bg-[#14171E]/60 backdrop-blur-md">
          <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-2">
            <span>Your Submissions</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-700">
              {submissions.length}
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            <span>Deterministic Team Aggregation</span>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <Inbox className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Your achievement journey starts here.</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Submit your hackathon placements, certifications, or open-source PRs to ascend team standings.
            </p>
            <Link
              href="/dashboard/submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition mt-2 shadow-sm"
            >
              + Submit Your First Achievement
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {submissions.map((sub) => (
              <div key={sub.id} className="p-5 hover:bg-zinc-900/30 transition space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-medium text-zinc-400">{sub.id}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-medium">
                      {sub.category_name}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      {sub.achievement_date}
                    </span>
                  </div>
                  <div>{getStatusBadge(sub.status)}</div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 tracking-wide">{sub.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{sub.description}</p>
                </div>

                {/* Feedback reason banner if Needs More Proof */}
                {sub.feedback_reason && (
                  <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/50 text-xs text-amber-200 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-amber-300">Core Verifier Feedback:</div>
                      <p className="mt-0.5 text-amber-200/90">{sub.feedback_reason}</p>
                    </div>
                  </div>
                )}

                {/* Attached Proofs */}
                {sub.proofs && sub.proofs.length > 0 && (
                  <div className="pt-1 flex items-center gap-2.5">
                    <span className="text-[11px] text-zinc-500 font-medium font-mono">Attached Proof:</span>
                    {sub.proofs.map((p: any) => (
                      <button
                        key={p.id}
                        onClick={() =>
                          setSelectedProof({
                            fileName: p.file_name,
                            viewToken: p.view_token,
                            proofId: p.id,
                            mimeType: p.mime_type,
                          })
                        }
                        className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white font-mono bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-800 hover:border-zinc-700 transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{p.file_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </PrismaticGlassCard>

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
