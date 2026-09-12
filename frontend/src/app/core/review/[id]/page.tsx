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
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
} from "lucide-react";
import { PrismaticGlassCard } from "@/components/react-bits/PrismaticGlassCard";
import { BorderBeam } from "@/components/react-bits/BorderBeam";
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

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3b82f6", "#60a5fa", "#10b981"],
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
        <div className="text-xs font-mono text-blue-600 animate-pulse flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
          <span>Loading Verification Inspection Workspace...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !detail) {
    return (
      <div className="ascend-panel p-8 text-center space-y-3 bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-[#22262D]">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Record Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-gray-400">{errorMsg}</p>
        <button
          onClick={() => router.push("/core/queue")}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition shadow-xs"
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
      <PrismaticGlassCard className="p-5 shadow-sm" glowColor="rgba(96, 165, 250, 0.15)">
        <BorderBeam size={160} duration={10} colorFrom="#3b82f6" colorTo="#60a5fa" />
        <Meteors number={10} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/core/queue")}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800 transition shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">{detail.id}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-bold font-mono">
                  {detail.category_name}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-wider font-mono px-2 py-0.5 rounded-full ${
                  isVerified
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/40"
                    : detail.status === "NEEDS_MORE_PROOF"
                    ? "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/40"
                    : detail.status === "REJECTED"
                    ? "bg-rose-100 text-rose-800 border border-rose-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/40"
                    : "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/40"
                }`}>
                  {detail.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Submitted by {detail.member_name} ({detail.department_code || "CSE"})</p>
            </div>
          </div>

          {/* Verification Record Stamp */}
          {detail.point_calculation && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 backdrop-blur-md shadow-xs">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">Deterministic Points</div>
                <div className="text-base font-black font-mono text-emerald-700 dark:text-emerald-400">
                  +{detail.point_calculation.points} PTS AWARDED
                </div>
              </div>
              <div className="h-6 w-px bg-emerald-200 dark:bg-zinc-800"></div>
              <div className="text-[10px] text-slate-600 dark:text-zinc-400 font-mono font-semibold">
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
          <div className="ascend-panel p-5 space-y-4 bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-[#22262D] shadow-sm">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-[#5B8CFF] flex items-center justify-between">
              <span>Claim Profile</span>
              <span className="text-slate-400 dark:text-gray-400 font-normal">{detail.achievement_date}</span>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{detail.title}</h2>
              <p className="text-xs text-slate-700 dark:text-gray-400 mt-1.5 leading-relaxed bg-slate-50 dark:bg-[#07080A] p-3 rounded-xl border border-slate-200 dark:border-[#22262D]">
                {detail.description}
              </p>
            </div>

            {/* Dynamic Metadata Attributes */}
            <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
              {Object.entries(detail.metadata || {}).map(([k, v]) => (
                <div key={k} className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#12151A] border border-slate-200 dark:border-[#22262D]">
                  <span className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-mono block font-semibold">
                    {k.replace("_", " ")}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block mt-0.5">
                    {String(v)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Proof Intelligence Card */}
          <div className="ascend-panel p-5 space-y-3 bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-[#22262D] shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#22262D]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-[#5B8CFF]" />
                <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">PROOF INTELLIGENCE</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-[#5B8CFF]/10 dark:text-[#5B8CFF] font-mono font-bold border border-blue-200 dark:border-[#5B8CFF]/30">
                Assists Core
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#12151A] border border-slate-200 dark:border-[#22262D]">
                <span className="text-slate-600 dark:text-gray-400 font-medium">Name detected</span>
                <span className="text-emerald-700 dark:text-[#31C48D] font-bold font-mono">✓ {aiChecks.name_detected ? "MATCH" : "FLAG"}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#12151A] border border-slate-200 dark:border-[#22262D]">
                <span className="text-slate-600 dark:text-gray-400 font-medium">Event detected</span>
                <span className="text-emerald-700 dark:text-[#31C48D] font-bold font-mono">✓ {aiChecks.event_detected ? "FOUND" : "FLAG"}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#12151A] border border-slate-200 dark:border-[#22262D]">
                <span className="text-slate-600 dark:text-gray-400 font-medium">Date detected</span>
                <span className="text-emerald-700 dark:text-[#31C48D] font-bold font-mono">✓ {aiChecks.date_detected ? "VERIFIED" : "FLAG"}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#12151A] border border-slate-200 dark:border-[#22262D]">
                <span className="text-slate-600 dark:text-gray-400 font-medium">Achievement detected</span>
                <span className="text-emerald-700 dark:text-[#31C48D] font-bold font-mono">✓ {aiChecks.achievement_detected ? "MATCH" : "FLAG"}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#12151A] border border-slate-200 dark:border-[#22262D]">
                <span className="text-slate-600 dark:text-gray-400 font-medium">Document readable</span>
                <span className={`font-bold font-mono ${aiChecks.document_appears_readable ? "text-emerald-700 dark:text-[#31C48D]" : "text-amber-700 dark:text-[#F5B942]"}`}>
                  {aiChecks.document_appears_readable ? "✓ READABLE" : "⚠️ LOW CONTRAST"}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 dark:text-gray-400 italic pt-1 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-[#5B8CFF] shrink-0" />
              <span>AI assists. Core Members decide.</span>
            </div>
          </div>

          {/* Duplicate Detection Alert */}
          {duplicateInfo.is_duplicate_warning ? (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-[#F5B942]/10 border border-amber-200 dark:border-[#F5B942]/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-[#F5B942] font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-[#F5B942]" />
                <span>POTENTIAL DUPLICATE WARNING</span>
              </div>
              <p className="text-slate-700 dark:text-gray-300 text-[11px] leading-relaxed">
                Similar submission found: <span className="font-mono font-bold text-amber-800 dark:text-[#F5B942]">{duplicateInfo.matching_achievement_id}</span>
                <br />
                Similarity Score: <span className="font-mono font-bold text-amber-800 dark:text-[#F5B942]">{duplicateInfo.similarity_pct}%</span>
              </p>
              <div className="text-[10px] text-amber-800 dark:text-[#F5B942] font-mono font-semibold">{duplicateInfo.reason}</div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-[#31C48D]/10 border border-emerald-200 dark:border-[#31C48D]/30 text-xs text-emerald-800 dark:text-[#31C48D] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#31C48D] shrink-0" />
              <span className="font-semibold">Duplicate check passed: No collision detected across cohort.</span>
            </div>
          )}

          {/* Deterministic Point Engine Match */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-[#22262D] space-y-1.5 text-xs shadow-sm">
            <div className="text-[10px] font-mono font-bold text-blue-600 dark:text-[#5B8CFF] uppercase tracking-wider flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              <span>Point Calculation Engine (Rulebook: 2026-v1)</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white">
              Category: {detail.category_name} • Placement: {detail.metadata?.result || "Standard"}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-gray-400">
              Points are evaluated deterministically from verified rules upon verification.
            </p>
          </div>
        </div>

        {/* Right Pane: Proof Document Viewer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col ascend-panel overflow-hidden bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-[#22262D] shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-[#22262D] bg-slate-50/80 dark:bg-[#12151A]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-[#5B8CFF]" />
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs">
                {proof ? proof.file_name : "No Proof Uploaded"}
              </span>
            </div>

            {/* Viewer Controls */}
            {proofUrl && !isPdf && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#07080A] hover:bg-slate-100 dark:hover:bg-[#181C23] text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#22262D] transition shadow-xs"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4 text-blue-600 dark:text-[#5B8CFF]" />
                </button>
                <span className="text-xs font-mono text-slate-600 dark:text-gray-400 font-semibold">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#07080A] hover:bg-slate-100 dark:hover:bg-[#181C23] text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#22262D] transition shadow-xs"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4 text-blue-600 dark:text-[#5B8CFF]" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#07080A] hover:bg-slate-100 dark:hover:bg-[#181C23] text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#22262D] transition shadow-xs"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4 text-blue-600 dark:text-[#5B8CFF]" />
                </button>
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-white dark:bg-[#07080A] hover:bg-slate-100 dark:hover:bg-[#181C23] text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#22262D] transition shadow-xs"
                  title="Full window"
                >
                  <ExternalLink className="w-4 h-4 text-blue-600 dark:text-[#5B8CFF]" />
                </a>
              </div>
            )}
          </div>

          <div className="flex-1 bg-slate-50 dark:bg-[#07080A] p-4 flex items-center justify-center min-h-[450px] overflow-auto">
            {proofUrl ? (
              isPdf ? (
                <iframe
                  src={`${proofUrl}#toolbar=0`}
                  className="w-full h-full min-h-[500px] rounded-xl border border-slate-200 dark:border-[#22262D]"
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
                    className="max-h-[55vh] max-w-full object-contain rounded-xl shadow-lg border border-slate-200 dark:border-[#22262D]"
                  />
                </div>
              )
            ) : (
              <div className="text-center p-8 text-slate-400 space-y-2">
                <FileText className="w-10 h-10 mx-auto opacity-30 text-blue-600 dark:text-[#5B8CFF]" />
                <p className="text-xs font-semibold">No proof document attached to this claim.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Core Actions Bar */}
      <div className="sticky bottom-0 z-30 p-4 rounded-2xl bg-white/95 dark:bg-[#0D0F12]/95 backdrop-blur-md border border-slate-200 dark:border-[#22262D] flex items-center justify-between shadow-lg">
        <div className="text-xs text-slate-600 dark:text-gray-400 flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Core Member Decision Workspace</span>
        </div>

        <div className="flex items-center gap-3">
          {detail.status === "VERIFIED" ? (
            <button
              type="button"
              onClick={() => setRejectModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 dark:border-red-500/50 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-rose-700 dark:text-red-300 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-red-400" />
              <span>Exclude Achievement & Deduct Points</span>
            </button>
          ) : detail.status === "REJECTED" ? (
            <div className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400 text-xs font-mono font-bold">
              EXCLUDED & POINTS DEDUCTED
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setRejectModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:border-[#FF5C6C]/40 dark:bg-[#FF5C6C]/10 dark:hover:bg-[#FF5C6C]/20 dark:text-[#FF5C6C] text-xs font-bold transition shadow-xs"
            >
              Exclude / Reject Claim
            </button>
          )}

          <button
            type="button"
            onClick={() => setRequestProofModalOpen(true)}
            className="px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:border-[#F5B942]/40 dark:bg-[#F5B942]/10 dark:hover:bg-[#F5B942]/20 dark:text-[#F5B942] text-xs font-bold transition shadow-xs"
          >
            Request More Proof
          </button>

          {detail.status !== "VERIFIED" && (
            <button
              type="button"
              onClick={() => setVerifyModalOpen(true)}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wide transition shadow-md shadow-emerald-600/20 flex items-center gap-2 active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Award Points</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal: Verify */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-[#22262D] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-[#31C48D]/15 text-emerald-700 dark:text-[#31C48D] border border-emerald-200 dark:border-[#31C48D]/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Confirm Official Verification</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">Action creates permanent auditable record</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
              Verifying will execute the authoritative Point Rules Engine under <span className="font-mono text-blue-600 dark:text-[#5B8CFF] font-bold">2026-v1</span>. Points will be added to Team ASCEND and recorded in the consensus ledger.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVerifyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerify}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
              >
                {actionLoading ? "Verifying..." : "Confirm Verification"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Request More Proof */}
      {requestProofModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-[#22262D] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-[#F5B942]/15 text-amber-700 dark:text-[#F5B942] border border-amber-200 dark:border-[#F5B942]/30">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Request Additional Proof</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">The member will be notified to upload clearer documentation</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-white mb-1.5">
                Specific Feedback to Member <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="e.g., Please upload an official high-resolution PDF showing your full participant name and date."
                className="w-full bg-slate-50 dark:bg-[#07080A] border border-slate-300 dark:border-[#22262D] rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRequestProofModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestProof}
                disabled={actionLoading || !reasonInput.trim()}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-bold transition shadow-md shadow-amber-600/20"
              >
                {actionLoading ? "Transmitting..." : "Send Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Exclude Achievement & Deduct Points */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#0D0F12] border border-rose-300 dark:border-red-500/30 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Exclude Achievement & Deduct Points</h3>
                <p className="text-xs text-rose-600/90 dark:text-red-300/80">Marks status as REJECTED & reverses all awarded points</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-red-950/30 border border-rose-200 dark:border-red-800/30 text-xs text-rose-800 dark:text-red-300 leading-relaxed">
              Excluding this achievement will revoke its verification status. All points previously awarded for this claim will be <strong>immediately deducted</strong> from both the member and team point balances.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-white mb-1.5">
                Exclusion Reason / Audit Justification <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="e.g., Evidence invalid upon manual inspection or duplicate submission. Deducting points."
                className="w-full bg-slate-50 dark:bg-[#07080A] border border-rose-300 dark:border-red-800/40 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading || !reasonInput.trim()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold transition shadow-md shadow-rose-600/30 flex items-center gap-1.5"
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
