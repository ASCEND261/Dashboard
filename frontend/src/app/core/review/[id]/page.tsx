"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Clock,
  User,
  Building,
  Calendar,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink
} from "lucide-react";
import { PrismaticGlassCard } from "@/components/react-bits/PrismaticGlassCard";
import { BorderBeam } from "@/components/react-bits/BorderBeam";
import { GradientText } from "@/components/react-bits/GradientText";
import { Meteors } from "@/components/react-bits/Meteors";

export default function VerificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const achievementId = params?.id as string;

  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals for actions
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [requestProofModalOpen, setRequestProofModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  // Form Inputs
  const [reasonInput, setReasonInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Document Viewer Zoom/Rotation
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!achievementId) return;
    setLoading(true);
    api.getCoreSubmission(achievementId)
      .then((data) => setDetail(data))
      .catch((err) => setErrorMsg(err.message || "Failed to load submission detail."))
      .finally(() => setLoading(false));
  }, [achievementId]);

  const handleVerify = async () => {
    setActionLoading(true);
    try {
      await api.verifySubmission(achievementId, {
        rule_version: "2026-v1",
      });

      // Celebration confetti for verifying achievement
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#5B8CFF", "#7AA2FF", "#31C48D"],
        });
      } catch (e) {
        // Safe fallback
      }

      setVerifyModalOpen(false);
      const updated = await api.getCoreSubmission(achievementId);
      setDetail(updated);
    } catch (err: any) {
      alert("Error verifying submission: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestProof = async () => {
    if (!reasonInput.trim()) return;
    setActionLoading(true);
    try {
      await api.requestProofSubmission(achievementId, reasonInput);
      setRequestProofModalOpen(false);
      setReasonInput("");
      const updated = await api.getCoreSubmission(achievementId);
      setDetail(updated);
    } catch (err: any) {
      alert("Error requesting proof: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reasonInput.trim()) return;
    setActionLoading(true);
    try {
      await api.rejectSubmission(achievementId, reasonInput);
      setRejectModalOpen(false);
      setReasonInput("");
      const updated = await api.getCoreSubmission(achievementId);
      setDetail(updated);
    } catch (err: any) {
      alert("Error rejecting submission: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-xs font-mono text-[#5B8CFF] animate-pulse flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#5B8CFF] animate-spin" />
          <span>Loading Verification Inspection Workspace...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !detail) {
    return (
      <div className="ascend-panel p-8 text-center space-y-3 bg-[#0D0F12] border border-[#22262D]">
        <AlertCircle className="w-8 h-8 text-[#FF5C6C] mx-auto" />
        <h2 className="text-sm font-bold text-white">Record Not Found</h2>
        <p className="text-xs text-gray-400">{errorMsg}</p>
        <button
          onClick={() => router.push("/core/queue")}
          className="px-4 py-2 rounded-xl bg-[#5B8CFF] text-[#07080A] text-xs font-semibold hover:bg-[#7AA2FF] transition"
        >
          Back to Verification Queue
        </button>
      </div>
    );
  }

  const proof = detail.proofs && detail.proofs.length > 0 ? detail.proofs[0] : null;
  const proofUrl = proof?.view_token ? api.getProofViewUrl(proof.view_token) : null;
  const isPdf = proof?.mime_type === "application/pdf" || proof?.file_name?.toLowerCase().endsWith(".pdf");

  const aiChecks = proof?.ai_extracted?.checks || {};
  const duplicateInfo = proof?.duplicate_check || {};
  const isVerified = detail.status === "VERIFIED";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & ID Banner */}
      <PrismaticGlassCard className="p-5" glowColor="rgba(96, 165, 250, 0.15)">
        <BorderBeam size={160} duration={10} colorFrom="#60a5fa" colorTo="#3b82f6" />
        <Meteors number={10} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/core/queue")}
              className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
            >
              <ArrowLeft className="w-4 h-4 text-blue-400" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold font-mono text-white">{detail.id}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold font-mono">
                  {detail.category_name}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-wider font-mono px-2 py-0.5 rounded-full ${
                  isVerified
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40"
                    : detail.status === "NEEDS_MORE_PROOF"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/40"
                    : detail.status === "REJECTED"
                    ? "bg-red-500/15 text-red-400 border border-red-500/40"
                    : "bg-blue-500/15 text-blue-400 border border-blue-500/40"
                }`}>
                  {detail.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">Submitted by {detail.member_name} ({detail.department_code || "CSE"})</p>
            </div>
          </div>

          {/* Verification Record Stamp */}
          {detail.point_calculation && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-md">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Deterministic Points</div>
                <div className="text-base font-extrabold font-mono text-emerald-400">
                  +{detail.point_calculation.points} PTS AWARDED
                </div>
              </div>
              <div className="h-6 w-px bg-zinc-800"></div>
              <div className="text-[10px] text-zinc-400 font-mono">
                Rule: {detail.point_calculation.rule_id}
              </div>
            </div>
          )}
        </div>
      </PrismaticGlassCard>

      {/* 2-Pane Verification Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
        {/* Left Pane: Claim Information & AI Intelligence (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Claim Metadata Card */}
          <div className="ascend-panel p-5 space-y-4 bg-[#0D0F12] border border-[#22262D]">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#5B8CFF] flex items-center justify-between">
              <span>Claim Profile</span>
              <span className="text-gray-400 font-normal">{detail.achievement_date}</span>
            </div>

            <div>
              <h2 className="text-base font-bold text-white">{detail.title}</h2>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed bg-[#07080A] p-3 rounded-xl border border-[#22262D]">
                {detail.description}
              </p>
            </div>

            {/* Dynamic Metadata Attributes */}
            <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
              {Object.entries(detail.metadata || {}).map(([k, v]) => (
                <div key={k} className="p-2.5 rounded-xl bg-[#12151A] border border-[#22262D]">
                  <span className="text-[10px] text-gray-400 uppercase font-mono block">
                    {k.replace("_", " ")}
                  </span>
                  <span className="font-semibold text-white truncate block mt-0.5">
                    {String(v)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Proof Intelligence Card */}
          <div className="ascend-panel p-5 space-y-3 bg-[#0D0F12] border border-[#22262D]">
            <div className="flex items-center justify-between pb-2 border-b border-[#22262D]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5B8CFF]" />
                <span className="text-xs font-bold text-white tracking-wide">PROOF INTELLIGENCE</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5B8CFF]/10 text-[#5B8CFF] font-mono border border-[#5B8CFF]/30">
                Assists Core
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#12151A] border border-[#22262D]">
                <span className="text-gray-400">Name detected</span>
                <span className="text-[#31C48D] font-bold font-mono">✓ {aiChecks.name_detected ? "MATCH" : "FLAG"}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#12151A] border border-[#22262D]">
                <span className="text-gray-400">Event detected</span>
                <span className="text-[#31C48D] font-bold font-mono">✓ {aiChecks.event_detected ? "FOUND" : "FLAG"}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#12151A] border border-[#22262D]">
                <span className="text-gray-400">Date detected</span>
                <span className="text-[#31C48D] font-bold font-mono">✓ {aiChecks.date_detected ? "VERIFIED" : "FLAG"}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#12151A] border border-[#22262D]">
                <span className="text-gray-400">Achievement detected</span>
                <span className="text-[#31C48D] font-bold font-mono">✓ {aiChecks.achievement_detected ? "MATCH" : "FLAG"}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#12151A] border border-[#22262D]">
                <span className="text-gray-400">Document readable</span>
                <span className={`font-bold font-mono ${aiChecks.document_appears_readable ? "text-[#31C48D]" : "text-[#F5B942]"}`}>
                  {aiChecks.document_appears_readable ? "✓ READABLE" : "⚠️ LOW CONTRAST"}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-gray-400 italic pt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5B8CFF] shrink-0" />
              <span>AI assists. Core Members decide.</span>
            </div>
          </div>

          {/* Duplicate Detection Alert */}
          {duplicateInfo.is_duplicate_warning ? (
            <div className="p-4 rounded-xl bg-[#F5B942]/10 border border-[#F5B942]/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#F5B942] font-bold">
                <AlertTriangle className="w-4 h-4 text-[#F5B942]" />
                <span>POTENTIAL DUPLICATE WARNING</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Similar submission found: <span className="font-mono font-bold text-[#F5B942]">{duplicateInfo.matching_achievement_id}</span>
                <br />
                Similarity Score: <span className="font-mono font-bold text-[#F5B942]">{duplicateInfo.similarity_pct}%</span>
              </p>
              <div className="text-[10px] text-[#F5B942] font-mono">{duplicateInfo.reason}</div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#31C48D]/10 border border-[#31C48D]/30 text-xs text-[#31C48D] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#31C48D] shrink-0" />
              <span>Duplicate check passed: No collision detected across cohort.</span>
            </div>
          )}

          {/* Deterministic Point Engine Match */}
          <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#22262D] space-y-1.5 text-xs">
            <div className="text-[10px] font-mono font-bold text-[#5B8CFF] uppercase tracking-wider flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              <span>Point Calculation Engine (Rulebook: 2026-v1)</span>
            </div>
            <div className="font-semibold text-white">
              Category: {detail.category_name} • Placement: {detail.metadata?.result || "Standard"}
            </div>
            <p className="text-[11px] text-gray-400">
              Points are evaluated deterministically from verified rules upon verification.
            </p>
          </div>
        </div>

        {/* Right Pane: Proof Document Viewer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col ascend-panel overflow-hidden bg-[#0D0F12] border border-[#22262D]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#22262D] bg-[#12151A]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#5B8CFF]" />
              <span className="text-xs font-semibold text-white truncate max-w-xs">
                {proof ? proof.file_name : "No Proof Uploaded"}
              </span>
            </div>

            {/* Viewer Controls */}
            {proofUrl && !isPdf && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
                  className="p-1.5 rounded-lg bg-[#07080A] hover:bg-[#181C23] text-gray-400 hover:text-white border border-[#22262D] transition"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4 text-[#5B8CFF]" />
                </button>
                <span className="text-xs font-mono text-gray-400">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
                  className="p-1.5 rounded-lg bg-[#07080A] hover:bg-[#181C23] text-gray-400 hover:text-white border border-[#22262D] transition"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4 text-[#5B8CFF]" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-lg bg-[#07080A] hover:bg-[#181C23] text-gray-400 hover:text-white border border-[#22262D] transition"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4 text-[#5B8CFF]" />
                </button>
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-[#07080A] hover:bg-[#181C23] text-gray-400 hover:text-white border border-[#22262D] transition"
                  title="Full window"
                >
                  <ExternalLink className="w-4 h-4 text-[#5B8CFF]" />
                </a>
              </div>
            )}
          </div>

          <div className="flex-1 bg-[#07080A] p-4 flex items-center justify-center min-h-[450px] overflow-auto">
            {proofUrl ? (
              isPdf ? (
                <iframe
                  src={`${proofUrl}#toolbar=0`}
                  className="w-full h-full min-h-[500px] rounded-xl border border-[#22262D]"
                  title="Proof Document"
                />
              ) : (
                <div
                  className="transition-transform duration-150"
                  style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
                >
                  <img
                    src={proofUrl}
                    alt={proof.file_name}
                    className="max-h-[55vh] max-w-full object-contain rounded-xl shadow-2xl border border-[#22262D]"
                  />
                </div>
              )
            ) : (
              <div className="text-center p-8 text-gray-400 space-y-2">
                <FileText className="w-10 h-10 mx-auto opacity-30 text-[#5B8CFF]" />
                <p className="text-xs">No proof document attached to this claim.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Core Actions Bar */}
      <div className="sticky bottom-0 z-30 p-4 rounded-2xl bg-[#0D0F12]/95 backdrop-blur-md border border-[#22262D] flex items-center justify-between shadow-2xl">
        <div className="text-xs text-gray-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#31C48D] shadow-[0_0_8px_#31C48D]"></span>
          <span>Core Member Decision Workspace</span>
        </div>

        <div className="flex items-center gap-3">
          {detail.status === "VERIFIED" ? (
            <button
              type="button"
              onClick={() => setRejectModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-red-500/50 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-red-950/40"
            >
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span>Exclude Achievement & Deduct Points</span>
            </button>
          ) : detail.status === "REJECTED" ? (
            <div className="px-4 py-2 rounded-xl border border-red-800/40 bg-red-950/20 text-red-400 text-xs font-mono">
              EXCLUDED & POINTS DEDUCTED
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setRejectModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-[#FF5C6C]/40 bg-[#FF5C6C]/10 hover:bg-[#FF5C6C]/20 text-[#FF5C6C] text-xs font-semibold transition"
            >
              Exclude / Reject Claim
            </button>
          )}

          <button
            type="button"
            onClick={() => setRequestProofModalOpen(true)}
            className="px-4 py-2 rounded-xl border border-[#F5B942]/40 bg-[#F5B942]/10 hover:bg-[#F5B942]/20 text-[#F5B942] text-xs font-semibold transition"
          >
            Request More Proof
          </button>

          {detail.status !== "VERIFIED" && (
            <button
              type="button"
              onClick={() => setVerifyModalOpen(true)}
              className="px-6 py-2 rounded-xl bg-[#31C48D] hover:bg-[#31C48D]/90 text-[#07080A] text-xs font-bold tracking-wide transition shadow-lg shadow-[#31C48D]/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Award Points</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal: Verify */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#0D0F12] border border-[#22262D] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#31C48D]/15 text-[#31C48D] border border-[#31C48D]/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Confirm Official Verification</h3>
                <p className="text-xs text-gray-400">Action creates permanent auditable record</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Verifying will execute the authoritative Point Rules Engine under <span className="font-mono text-[#5B8CFF] font-bold">2026-v1</span>. Points will be added to Team ASCEND and recorded in the consensus ledger.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVerifyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerify}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-[#31C48D] hover:bg-[#31C48D]/90 disabled:opacity-40 text-[#07080A] text-xs font-bold transition shadow-lg shadow-[#31C48D]/20"
              >
                {actionLoading ? "Verifying..." : "Confirm Verification"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Request More Proof */}
      {requestProofModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#0D0F12] border border-[#22262D] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#F5B942]/15 text-[#F5B942] border border-[#F5B942]/30">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Request Additional Proof</h3>
                <p className="text-xs text-gray-400">The member will be notified to upload clearer documentation</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1.5">
                Specific Feedback to Member <span className="text-[#FF5C6C]">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="e.g., Please upload an official high-resolution PDF showing your full participant name and date."
                className="w-full bg-[#07080A] border border-[#22262D] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#F5B942]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRequestProofModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestProof}
                disabled={actionLoading || !reasonInput.trim()}
                className="px-5 py-2 rounded-xl bg-[#F5B942] hover:bg-[#F5B942]/90 disabled:opacity-40 text-[#07080A] text-xs font-bold transition shadow-lg shadow-[#F5B942]/20"
              >
                {actionLoading ? "Transmitting..." : "Send Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Exclude Achievement & Deduct Points */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#0D0F12] border border-red-500/30 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-950 text-red-400 border border-red-800">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Exclude Achievement & Deduct Points</h3>
                <p className="text-xs text-red-300/80">Marks status as REJECTED & reverses all awarded points</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/30 text-xs text-red-300 leading-relaxed">
              Excluding this achievement will revoke its verification status. All points previously awarded for this claim will be <strong>immediately deducted</strong> from both the member and team point balances.
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1.5">
                Exclusion Reason / Audit Justification <span className="text-[#FF5C6C]">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="e.g., Evidence invalid upon manual inspection or duplicate submission. Deducting points."
                className="w-full bg-[#07080A] border border-red-800/40 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading || !reasonInput.trim()}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-bold transition shadow-lg shadow-red-600/30 flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{actionLoading ? "Excluding & Deducting..." : "Confirm Exclusion & Deduct Points"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
