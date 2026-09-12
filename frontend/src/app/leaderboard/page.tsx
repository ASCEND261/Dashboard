"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ShieldCheck, Cpu, Lock, ArrowRight, Layers } from "lucide-react";
import AscendLogo from "@/components/ascend-logo";
import PrismaticGlassCard from "@/components/react-bits/PrismaticGlassCard";
import BorderBeam from "@/components/react-bits/BorderBeam";
import GradientText from "@/components/react-bits/GradientText";
import Meteors from "@/components/react-bits/Meteors";

export default function StandaloneLeaderboardPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-transparent text-zinc-100 p-4 sm:p-8 flex flex-col justify-center relative overflow-hidden">
      {/* Dynamic Shooting Star Meteors */}
      <Meteors number={22} />

      <div className="max-w-3xl mx-auto w-full relative z-10 space-y-6">
        {/* Top Nav Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition px-3 py-1.5 rounded-lg bg-[#0D0F14]/80 border border-zinc-800 hover:border-zinc-700 backdrop-blur-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            ACTIVE SPRINT QUALIFICATION
          </div>
        </div>

        {/* The Ascent Board Card */}
        <PrismaticGlassCard className="shadow-2xl">
          <BorderBeam size={280} duration={9} colorFrom="#60A5FA" colorTo="#A855F7" />
          <div className="text-center relative overflow-hidden space-y-8 py-4 sm:py-6">
            {/* Central Monogram */}
            <div className="relative z-10 flex flex-col items-center space-y-3">
              <AscendLogo size="lg" showSubtitle={false} />
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full mt-2 animate-pulse" />
            </div>

            {/* Typography */}
            <div className="relative z-10 space-y-3 max-w-xl mx-auto">
              <div className="text-[11px] font-mono tracking-widest text-blue-400 font-semibold uppercase">
                ASCEND LEADERBOARD
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono uppercase">
                <GradientText colors={["#FFFFFF", "#60A5FA", "#C084FC", "#FFFFFF"]}>
                  COMING SOON
                </GradientText>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-mono">
                Team rankings will appear here once verified sprint activity is live.
              </p>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                ASCEND strictly excludes mock scores or unverified standings. All team points enter the ledger exclusively through cryptographic proof validation under official TSJ-2026-v1 rules.
              </p>
            </div>

            {/* Status Dimensions Grid */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-4 rounded-xl bg-[#08090C]/80 border border-zinc-800/80 space-y-1 hover:border-blue-500/30 transition">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Cohort Standings</span>
                </div>
                <div className="text-sm font-semibold text-white">Staging Pipeline</div>
                <div className="text-[11px] text-zinc-400">Locked until window cutoff</div>
              </div>

              <div className="p-4 rounded-xl bg-[#08090C]/80 border border-blue-500/30 space-y-1 hover:border-blue-400/50 transition">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-mono">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>AutoVerify Engine</span>
                </div>
                <div className="text-sm font-semibold text-blue-300">Active & Evaluating</div>
                <div className="text-[11px] text-zinc-400">11/11 audit checkpoints online</div>
              </div>

              <div className="p-4 rounded-xl bg-[#08090C]/80 border border-zinc-800/80 space-y-1 hover:border-emerald-500/30 transition">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Scoring Ledger</span>
                </div>
                <div className="text-sm font-semibold text-emerald-300">Zero-Deduction Model</div>
                <div className="text-[11px] text-zinc-400">100% verified points committed</div>
              </div>
            </div>

            {/* CTA Action */}
            <div className="relative z-10 pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard/submissions"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Submit Proof for Official Ledger</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-medium text-xs transition flex items-center justify-center gap-2"
              >
                <span>Return to Dashboard</span>
              </Link>
            </div>
          </div>
        </PrismaticGlassCard>
      </div>
    </div>
  );
}
