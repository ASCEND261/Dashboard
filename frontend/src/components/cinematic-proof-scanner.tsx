"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  ShieldCheck,
  Zap,
  ArrowRight,
  RotateCcw,
  Sparkles
} from "lucide-react";

export type ScannerScenario = "valid_winner" | "ambiguous_dsa" | "invalid_unrelated";

interface DimensionCheck {
  id: string;
  name: string;
  label: string;
  status: "pending" | "pass" | "warn" | "fail";
  detail?: string;
}

interface CinematicProofScannerProps {
  initialScenario?: ScannerScenario;
  onVerificationComplete?: (outcome: string, points: number) => void;
  fileName?: string;
  claimTitle?: string;
}

export default function CinematicProofScanner({
  initialScenario = "valid_winner",
  onVerificationComplete,
  fileName,
  claimTitle,
}: CinematicProofScannerProps) {
  const [scenario, setScenario] = useState<ScannerScenario>(initialScenario);
  const [stage, setStage] = useState<"IDLE" | "SCANNING" | "DIMENSIONS" | "RESOLVING" | "COMPLETE">("IDLE");
  const [activeDimensionIndex, setActiveDimensionIndex] = useState<number>(-1);

  const getDimensionSet = (sc: ScannerScenario): DimensionCheck[] => {
    switch (sc) {
      case "valid_winner":
        return [
          { id: "identity", name: "IDENTITY", label: "Submitter name matches certificate", status: "pass", detail: "Sarthak matches claim" },
          { id: "category", name: "CATEGORY", label: "External Hackathon verified", status: "pass", detail: "Global AI Hackathon 2026" },
          { id: "date", name: "DATE", label: "Falls in Sprint window", status: "pass", detail: "Sep 04, 2026 (Active)" },
          { id: "consistency", name: "CONSISTENCY", label: "Standing matches claim", status: "pass", detail: "1st Place Winner verified" },
          { id: "integrity", name: "INTEGRITY", label: "SHA-256 collision resistance", status: "pass", detail: "Unique cohort hash valid" },
        ];
      case "ambiguous_dsa":
        return [
          { id: "identity", name: "IDENTITY", label: "Profile account match", status: "pass", detail: "Account matches member" },
          { id: "category", name: "CATEGORY", label: "Platform: LeetCode verified", status: "pass", detail: "DSA track valid" },
          { id: "date", name: "DATE", label: "Screenshot timestamp", status: "warn", detail: "Date indeterminate" },
          { id: "consistency", name: "CONSISTENCY", label: "Claim vs Evidence match", status: "warn", detail: "Claim: 7-Day Streak" },
          { id: "integrity", name: "STREAK EVIDENCE", label: "Consecutive daily calendar", status: "fail", detail: "500 Total Solved ≠ Streak" },
        ];
      case "invalid_unrelated":
        return [
          { id: "identity", name: "FILE", label: "MIME format readable", status: "pass", detail: "Image/PDF readable" },
          { id: "category", name: "IDENTITY", label: "Account identity markers", status: "warn", detail: "No credential names found" },
          { id: "date", name: "CATEGORY", label: "Technical proof markers", status: "fail", detail: "Lacks achievement proof" },
          { id: "consistency", name: "EVIDENCE", label: "Claim correspondence", status: "fail", detail: "Unrelated image document" },
          { id: "integrity", name: "INTEGRITY", label: "Authoritative check", status: "fail", detail: "Zero technical validity" },
        ];
    }
  };

  const [dimensions, setDimensions] = useState<DimensionCheck[]>(getDimensionSet(scenario));

  const runScan = (sc: ScannerScenario) => {
    setScenario(sc);
    const dims = getDimensionSet(sc);
    setDimensions(dims.map((d) => ({ ...d, status: "pending" })));
    setStage("SCANNING");
    setActiveDimensionIndex(-1);

    // Dimension illumination sequence
    dims.forEach((d, idx) => {
      setTimeout(() => {
        setActiveDimensionIndex(idx);
        setDimensions((prev) =>
          prev.map((item, i) => (i === idx ? { ...item, status: dims[idx].status } : item))
        );
      }, 700 + idx * 450);
    });

    // Stage: Resolving
    setTimeout(() => {
      setStage("RESOLVING");
    }, 700 + dims.length * 450 + 400);

    // Stage: Complete
    setTimeout(() => {
      setStage("COMPLETE");
      if (onVerificationComplete) {
        if (sc === "valid_winner") onVerificationComplete("VERIFIED", 50);
        else if (sc === "ambiguous_dsa") onVerificationComplete("UNDER_REVIEW", 0);
        else onVerificationComplete("REJECTED", 0);
      }
    }, 700 + dims.length * 450 + 1200);
  };

  useEffect(() => {
    runScan(scenario);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto bg-white dark:bg-[#07080A] rounded-3xl border border-slate-200 dark:border-zinc-800 p-5 sm:p-7 shadow-lg dark:shadow-2xl flex flex-col items-center relative overflow-hidden transition-colors">
      
      {/* Interactive Scenario Switcher Pills */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-xl mb-6 text-[10px] font-mono">
        <button
          onClick={() => runScan("valid_winner")}
          className={`px-3 py-1 rounded-lg transition font-medium ${
            scenario === "valid_winner" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          ① AutoVerify (+50)
        </button>
        <button
          onClick={() => runScan("ambiguous_dsa")}
          className={`px-3 py-1 rounded-lg transition font-medium ${
            scenario === "ambiguous_dsa" ? "bg-amber-600 text-white shadow" : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          ② Ambiguous (0 Core)
        </button>
        <button
          onClick={() => runScan("invalid_unrelated")}
          className={`px-3 py-1 rounded-lg transition font-medium ${
            scenario === "invalid_unrelated" ? "bg-red-600 text-white shadow" : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          ③ Invalid (0 Rej)
        </button>
      </div>

      {/* Floating Proof Document Card with Laser Scanning Line */}
      <div className="relative w-full max-w-sm h-48 rounded-2xl bg-slate-50 dark:bg-[#0D0F12] border border-slate-200 dark:border-zinc-700/80 p-4 flex flex-col justify-between overflow-hidden shadow-inner group">
        
        {/* Electric Blue Scanning Laser Beam */}
        {stage === "SCANNING" && (
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_#2563EB] animate-[bounce_2s_infinite] pointer-events-none z-20" />
        )}

        {/* Header of doc card */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-mono">
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="truncate max-w-[180px]">
              {fileName || (scenario === "valid_winner"
                ? "winner_certificate_2026.pdf"
                : scenario === "ambiguous_dsa"
                ? "leetcode_500_solved_profile.png"
                : "unrelated_random_file.jpg")}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold">SHA-256</span>
        </div>

        {/* Center content mock */}
        <div className="py-2 text-center">
          <div className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
            {claimTitle || (scenario === "valid_winner"
              ? "Global AI Hackathon — 1st Place"
              : scenario === "ambiguous_dsa"
              ? "7-Day Consecutive Problem Streak"
              : "Unverified Document Upload")}
          </div>
          <div className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 mt-0.5">
            {scenario === "valid_winner"
              ? "Extracted: Sarthak · 1st Place Winner"
              : scenario === "ambiguous_dsa"
              ? "Extracted: Sarthak · Total Solved: 500"
              : "Extracted: Document lacks technical credentials"}
          </div>
        </div>

        {/* Footer status of doc card */}
        <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-200 dark:border-zinc-800/80">
          <span className="text-slate-400 dark:text-zinc-500">ENGINE</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">RUST EVIDENCE GATE</span>
        </div>
      </div>

      {/* 5 Evidence Dimension Checks */}
      <div className="w-full max-w-sm mt-5 space-y-2">
        {dimensions.map((d, index) => {
          const isCurrent = activeDimensionIndex === index;

          return (
            <div
              key={d.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono transition-all duration-300 ${
                d.status === "pass"
                  ? "bg-emerald-50/70 border-emerald-200 text-slate-800 dark:bg-zinc-900/80 dark:border-zinc-800 dark:text-zinc-200"
                  : d.status === "warn"
                  ? "bg-amber-50/70 border-amber-200 text-slate-800 dark:bg-amber-950/20 dark:border-amber-800/30 dark:text-amber-200"
                  : d.status === "fail"
                  ? "bg-red-50/70 border-red-200 text-slate-800 dark:bg-red-950/20 dark:border-red-800/30 dark:text-red-200"
                  : "bg-slate-100/70 border-slate-200 text-slate-400 dark:bg-zinc-950 dark:border-zinc-900 dark:text-zinc-600 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-[10px] tracking-wider text-slate-500 dark:text-zinc-400">{d.name}</span>
                <span className="text-[11px] text-slate-700 dark:text-zinc-300 truncate max-w-[190px]">{d.detail}</span>
              </div>

              <div>
                {d.status === "pass" && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />}
                {d.status === "warn" && <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.5]" />}
                {d.status === "fail" && <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 stroke-[2.5]" />}
                {d.status === "pending" && <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-zinc-700" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Verification Moment Resolution */}
      {stage === "COMPLETE" && (
        <div className="w-full max-w-sm mt-6 animate-in fade-in zoom-in-95 duration-300">
          {scenario === "valid_winner" && (
            <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-600/40 text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 bg-emerald-100/80 dark:text-emerald-400 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>AUTO VERIFIED</span>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                +50 POINTS AWARDED
              </div>
              <p className="text-[11px] font-mono text-slate-600 dark:text-zinc-400">
                RULE MATCHED: <span className="text-blue-600 dark:text-blue-400 font-bold">EXTERNAL_HACKATHON_1ST</span> &middot; LEDGER COMMITTED
              </p>
            </div>
          )}

          {scenario === "ambiguous_dsa" && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-600/40 text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-700 bg-amber-100/80 dark:text-amber-400 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-md border border-amber-300 dark:border-amber-800/40">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>EVIDENCE REQUIRES REVIEW</span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                0 POINTS PENDING
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                Total problem count (500) demonstrates activity, but does not establish a consecutive 7-day daily streak. Safely routed to Core Member review.
              </p>
              <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-500">
                Existing score untouched &middot; Zero deduction
              </div>
            </div>
          )}

          {scenario === "invalid_unrelated" && (
            <div className="p-4 rounded-2xl bg-red-50/90 border border-red-200 dark:bg-red-950/20 dark:border-red-600/40 text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-red-700 bg-red-100/80 dark:text-red-400 dark:bg-red-950/40 px-2.5 py-0.5 rounded-md border border-red-300 dark:border-red-800/40">
                <XCircle className="w-3.5 h-3.5" />
                <span>EVIDENCE INSUFFICIENT</span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                0 POINTS AWARDED
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                This document does not establish the claimed achievement. No ledger points minted.
              </p>
              <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                Existing team score unchanged &middot; Zero penalty
              </div>
            </div>
          )}

          {/* Re-run button */}
          <button
            onClick={() => runScan(scenario)}
            className="w-full mt-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-950 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-white text-xs font-mono flex items-center justify-center gap-1.5 transition font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Evidence Verification Scan</span>
          </button>
        </div>
      )}
    </div>
  );
}
