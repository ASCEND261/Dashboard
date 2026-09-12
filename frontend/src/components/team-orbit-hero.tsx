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
    <div className="relative w-full rounded-3xl overflow-hidden bg-[#0D0F12] border border-zinc-800/90 p-6 sm:p-8 text-center flex flex-col items-center justify-center min-h-[360px] shadow-2xl">
      
      {/* Background Concentric Orbits */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-72 h-72 rounded-full border border-blue-500/10 animate-[spin_60s_linear_infinite]" />
        <div className="absolute w-52 h-52 rounded-full border border-zinc-700/20 animate-[spin_40s_linear_infinite_reverse]" />
        <div className="absolute w-36 h-36 rounded-full border border-blue-500/20 animate-[spin_25s_linear_infinite]" />
        {/* Orbiting achievement node */}
        <div className="absolute w-72 h-72 animate-[spin_30s_linear_infinite]">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_#5B8CFF] absolute -top-1.5 left-1/2 -translate-x-1/2" />
        </div>
      </div>

      {/* Stage 1-4 Dot / Network Expansion visual cue */}
      {animationStage < 5 && (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <div
            className={`w-3 h-3 rounded-full bg-blue-500 transition-all duration-500 ${
              animationStage >= 2 ? "scale-150 shadow-[0_0_16px_#5B8CFF]" : "scale-100"
            }`}
          />
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
            {animationStage < 3 ? "Assembling Network" : "Syncing Team Orbit"}
          </span>
        </div>
      )}

      {/* Stage 5 & 6 Full Hero Manifestation */}
      {animationStage >= 5 && (
        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 w-full">
          
          {/* Header Label */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Team Progress &middot; Active Sprint</span>
          </div>

          {/* Concentric Team Rank Badge */}
          <div className="relative mb-2">
            <div className="px-3.5 py-1 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono font-bold text-zinc-200 tracking-wider flex items-center gap-1.5 shadow-inner">
              <span className="text-zinc-500 text-[10px]">RANK</span>
              <span className="text-blue-400 text-sm font-black">#{rank.toString().padStart(2, "0")}</span>
            </div>
          </div>

          {/* Central Digital Convergence Team Score */}
          <div className="my-2 flex flex-col items-center">
            <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white flex items-baseline justify-center">
              <DigitalConvergenceCounter
                value={score}
                digitClassName="text-5xl sm:text-6xl text-white font-black"
              />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 mt-1">
              Official Ledger Points
            </span>
          </div>

          {/* Score Trajectory & Verified Metric */}
          <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-zinc-800/80 w-full max-w-xs">
            <div className="flex items-center gap-1 text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/20 px-2.5 py-0.5 rounded-lg border border-emerald-800/30">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{velocityPct}% Pace</span>
            </div>

            <div className="flex items-center gap-1 text-xs font-mono text-zinc-400 bg-zinc-900/60 px-2.5 py-0.5 rounded-lg border border-zinc-800">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>{verifiedCount} Verified</span>
            </div>
          </div>

          {/* Subtitle / Directed Motion Cue */}
          <p className="text-xs text-zinc-400 max-w-xs text-center mt-3">
            Every submission is cryptographically verified by Rust and anchored to the authoritative team ledger.
          </p>

          {/* Mobile CTA Row */}
          <div className="flex items-center gap-2 mt-5 w-full max-w-xs">
            {onOpenSubmit ? (
              <button
                onClick={onOpenSubmit}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wide transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Prove Claim</span>
              </button>
            ) : (
              <Link
                href="/dashboard/submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wide transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Prove Claim</span>
              </Link>
            )}

            <Link
              href="/dashboard?tab=progress"
              className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition flex items-center gap-1"
            >
              <span>Ascent Path</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
