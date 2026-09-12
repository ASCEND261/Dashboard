"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, Cpu, ArrowRight, Layers } from "lucide-react";
import AscendLogo from "@/components/ascend-logo";

export default function DashboardLeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400">
            OFFICIAL TECH JOURNEY STANDINGS
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <span>ASCEND Cohort Leaderboard</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Authoritative standings certified by the Rust Rules Engine & Consensus Ledger.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <span>QUALIFYING WINDOW ACTIVE</span>
        </div>
      </div>

      {/* The Ascent Board Card */}
      <div className="bg-[#0D0F14] border border-zinc-800 rounded-2xl shadow-xl p-8 sm:p-12 text-center relative overflow-hidden space-y-8">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-3">
          <AscendLogo size="lg" showSubtitle={false} />
          <div className="w-12 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full mt-2" />
        </div>

        <div className="relative z-10 space-y-3 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono uppercase">
            THE ASCENT BOARD IS COMING.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            All fabricated and pre-seeded ranking scores have been cleared. Official cohort positions will dynamically unveil upon completion of the inaugural sprint window, committed only through verified proof documentation.
          </p>
        </div>

        {/* 3 Status Modules */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-4 rounded-xl bg-[#090A0D] border border-zinc-800 space-y-1">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Standings Pipeline</span>
            </div>
            <div className="text-sm font-semibold text-white">Staged for Cutoff</div>
            <div className="text-[11px] text-zinc-400">Locked until evaluation closes</div>
          </div>

          <div className="p-4 rounded-xl bg-[#090A0D] border border-blue-500/30 space-y-1">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-mono">
              <Cpu className="w-3.5 h-3.5" />
              <span>AutoVerify Pipeline</span>
            </div>
            <div className="text-sm font-semibold text-blue-300">Authoritative & Online</div>
            <div className="text-[11px] text-zinc-400">Evaluating incoming submissions</div>
          </div>

          <div className="p-4 rounded-xl bg-[#090A0D] border border-zinc-800 space-y-1">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Deductions</span>
            </div>
            <div className="text-sm font-semibold text-emerald-300">100% Guaranteed</div>
            <div className="text-[11px] text-zinc-400">Zero penalties for unverified proof</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="relative z-10 pt-2 flex items-center justify-center">
          <Link
            href="/dashboard/submissions"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs tracking-wide transition flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <span>Submit Evidence to Enter Official Ledger</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
