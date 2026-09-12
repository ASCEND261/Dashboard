"use client";

import React, { useEffect, useState } from "react";
import DigitalConvergenceCounter from "./digital-convergence-counter";
import { TrendingUp, ShieldCheck, Zap, Plus, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface TeamOrbitHeroProps {
  score?: number;
  rank?: number;
  velocityPct?: number;
  verifiedCount?: number;
  onOpenSubmit?: () => void;
}

export default function TeamOrbitHero({
  score = 0,
  rank = 1,
  velocityPct = 0,
  verifiedCount = 0,
  onOpenSubmit,
}: TeamOrbitHeroProps) {
  const [animationStage, setAnimationStage] = useState<number>(1);

  useEffect(() => {
    // 6-stage assembly sequence on first mount
    const t1 = setTimeout(() => setAnimationStage(2), 150);
    const t2 = setTimeout(() => setAnimationStage(3), 350);
    const t3 = setTimeout(() => setAnimationStage(4), 550);
    const t4 = setTimeout(() => setAnimationStage(5), 750);
    const t5 = setTimeout(() => setAnimationStage(6), 950);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-zinc-800/90 p-6 sm:p-8 text-center flex flex-col items-center justify-center min-h-[360px] shadow-sm dark:shadow-2xl transition-colors">
      
      {/* Background Concentric Orbits */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-72 h-72 rounded-full border border-blue-500/15 animate-[spin_60s_linear_infinite]" />
        <div className="absolute w-52 h-52 rounded-full border border-slate-300/40 dark:border-zinc-700/20 animate-[spin_40s_linear_infinite_reverse]" />
        <div className="absolute w-36 h-36 rounded-full border border-blue-500/20 animate-[spin_25s_linear_infinite]" />
        {/* Orbiting achievement node */}
        <div className="absolute w-72 h-72 animate-[spin_30s_linear_infinite]">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_#2563EB] absolute -top-1.5 left-1/2 -translate-x-1/2" />
        </div>
      </div>

      {/* Stage 1-4 Dot / Network Expansion visual cue */}
      {animationStage < 5 && (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <div
            className={`w-3 h-3 rounded-full bg-blue-500 transition-all duration-500 ${
              animationStage >= 2 ? "scale-150 shadow-[0_0_16px_#2563EB]" : "scale-100"
            }`}
          />
          <span className="text-[10px] font-mono tracking-widest text-slate-500 dark:text-zinc-500 uppercase font-semibold">
            {animationStage < 3 ? "Assembling Network" : "Syncing Team Orbit"}
          </span>
        </div>
      )}

      {/* Stage 5 & 6 Full Hero Manifestation */}
      {animationStage >= 5 && (
        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 w-full">
          
          {/* Header Label */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-zinc-400 mb-4 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Team Progress &middot; Active Sprint</span>
          </div>

          {/* Concentric Team Rank Badge */}
          <div className="relative mb-2">
            <div className="px-3.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-bold text-slate-800 dark:text-zinc-200 tracking-wider flex items-center gap-1.5 shadow-xs">
              <span className="text-slate-500 dark:text-zinc-500 text-[10px]">RANK</span>
              <span className="text-blue-600 dark:text-blue-400 text-sm font-black">#{rank.toString().padStart(2, "0")}</span>
            </div>
          </div>

          {/* Central Digital Convergence Team Score */}
          <div className="my-2 flex flex-col items-center">
            <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-slate-900 dark:text-white flex items-baseline justify-center">
              <DigitalConvergenceCounter
                value={score}
                digitClassName="text-5xl sm:text-6xl text-slate-900 dark:text-white font-black"
              />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 dark:text-zinc-400 mt-1 font-semibold">
              Official Ledger Points
            </span>
          </div>

          {/* Score Trajectory & Verified Metric */}
          <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800/80 w-full max-w-xs">
            <div className="flex items-center gap-1 text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>+{velocityPct}% Pace</span>
            </div>

            <div className="flex items-center gap-1 text-xs font-mono text-slate-700 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-900/60 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-800">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{verifiedCount} Verified</span>
            </div>
          </div>

          {/* Subtitle / Directed Motion Cue */}
          <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-xs text-center mt-3 leading-relaxed">
            Every submission is cryptographically verified by Rust and anchored to the authoritative team ledger.
          </p>

          {/* Mobile CTA Row */}
          <div className="flex items-center gap-2 mt-5 w-full max-w-xs">
            {onOpenSubmit ? (
              <button
                onClick={onOpenSubmit}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wide transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Prove Claim</span>
              </button>
            ) : (
              <Link
                href="/dashboard/submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wide transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Prove Claim</span>
              </Link>
            )}

            <Link
              href="/dashboard?tab=progress"
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:hover:text-white dark:border-zinc-800 text-xs font-medium transition flex items-center gap-1 shadow-xs"
            >
              <span>Ascent Path</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
