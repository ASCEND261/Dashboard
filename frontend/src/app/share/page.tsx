"use client";

import React, { useState } from "react";
import Link from "next/link";
import AscendLogo from "@/components/ascend-logo";
import AscendNetworkField from "@/components/ascend-network-field";
import TeamOrbitHero from "@/components/team-orbit-hero";
import CinematicProofScanner from "@/components/cinematic-proof-scanner";
import VerticalAscentPath from "@/components/vertical-ascent-path";
import { useRealtimePoints } from "@/lib/use-realtime-points";
import {
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  X,
  Smartphone,
} from "lucide-react";

export default function ShareShowcasePage() {
  const realtime = useRealtimePoints(4000);
  const [activeView, setActiveView] = useState<"simulator" | "path" | "ledger">("simulator");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "ASCEND — Team Achievement Infrastructure",
          text: "Check out Team ASCEND's live sprint progress, verified achievements, and cryptographic scoring ledger!",
          url: window.location.href,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#07080A] text-slate-900 dark:text-zinc-100 selection:bg-blue-600 selection:text-white pb-24">
      {/* Living Network Background */}
      <AscendNetworkField />

      {/* Top Floating Header */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#07080A]/85 backdrop-blur-xl shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AscendLogo size="sm" showSubtitle={true} />
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/20 active:scale-[0.98]"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share App</span>
            </button>

            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition shadow-xs"
            >
              <span>Member App</span>
              <ArrowRight className="w-3 h-3 text-slate-500 dark:text-zinc-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Showcase Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 pt-6 sm:pt-8 space-y-6">
        
        {/* Banner Pill */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-400 text-[10px] font-mono uppercase tracking-widest font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse" />
            <span>Official Sprint Showcase &middot; TSJ-2026-v1</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
            Team ASCEND Showcase
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-lg mx-auto mt-1">
            Real-time achievement verification & scoring infrastructure. Every point is authoritatively committed by Rust into the ledger.
          </p>
        </div>

        {/* Live Team Orbit Hero */}
        <TeamOrbitHero
          score={realtime.teamScore}
          rank={realtime.teamRank}
          velocityPct={84}
          verifiedCount={realtime.verifiedCount}
          onOpenSubmit={() => setShareModalOpen(true)}
        />

        {/* Interactive View Switcher Tabs */}
        <div className="flex items-center justify-center p-1 bg-slate-100 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md mx-auto text-xs font-mono shadow-xs">
          <button
            onClick={() => setActiveView("simulator")}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 font-semibold ${
              activeView === "simulator"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verification Scan</span>
          </button>

          <button
            onClick={() => setActiveView("path")}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 font-semibold ${
              activeView === "path"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Ascent Path</span>
          </button>

          <button
            onClick={() => setActiveView("ledger")}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 font-semibold ${
              activeView === "ledger"
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ledger</span>
          </button>
        </div>

        {/* Tab 1: Cinematic Verification Simulator */}
        {activeView === "simulator" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="text-center text-xs text-slate-600 dark:text-zinc-400 font-mono font-medium">
              Try the 3 canonical verification scenarios below to test how ASCEND evaluates evidence:
            </div>
            <CinematicProofScanner />
          </div>
        )}

        {/* Tab 2: Vertical Ascent Constellation */}
        {activeView === "path" && (
          <div className="animate-in fade-in duration-200">
            <VerticalAscentPath />
          </div>
        )}

        {/* Tab 3: Official Ledger View */}
        {activeView === "ledger" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-zinc-800 space-y-4 max-w-xl mx-auto animate-in fade-in duration-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Immutable Point Ledger</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Zero-point deduction model</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800/40 font-bold">
                100% Certified
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-900 dark:text-white font-bold">Global AI Hackathon 2026</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-500">EXTERNAL_HACKATHON_1ST &middot; Scope: TEAM</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-600 dark:text-emerald-400 font-black">+50 PTS</div>
                  <div className="text-[9px] text-slate-400 dark:text-zinc-500">COMMITTED</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-900 dark:text-white font-bold">7-Day Consecutive DSA Streak</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-500">DSA_7_DAY_STREAK &middot; Scope: INDIVIDUAL + TEAM</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-600 dark:text-emerald-400 font-black">+20 PTS</div>
                  <div className="text-[9px] text-slate-400 dark:text-zinc-500">COMMITTED</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-900 dark:text-white font-bold">Rust Core Upstream PR Merged</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-500">OPEN_SOURCE_MERGED &middot; Scope: TEAM</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-600 dark:text-emerald-400 font-black">+20 PTS</div>
                  <div className="text-[9px] text-slate-400 dark:text-zinc-500">COMMITTED</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-900 dark:text-white font-bold">Sprint Kickoff Meetup</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-500">MEETUP_ATTENDANCE &middot; 4 Members Present</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-600 dark:text-emerald-400 font-black">+20 PTS</div>
                  <div className="text-[9px] text-slate-400 dark:text-zinc-500">COMMITTED</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Floating Share App FAB on Mobile */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShareModalOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xl shadow-blue-600/30 border border-blue-400/30 transition-transform active:scale-95"
        >
          <Share2 className="w-4 h-4" />
          <span>Share ASCEND</span>
        </button>
      </div>

      {/* Share Modal Dialog */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-5 relative shadow-2xl">
            <button
              onClick={() => setShareModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center mx-auto mb-3 text-blue-600 dark:text-blue-400">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Share Team ASCEND</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                Share this live verified achievement showcase with mentors, judges, and teammates.
              </p>
            </div>

            {/* QR Code Presentation Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141418] border border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-2">
              <div className="w-32 h-32 bg-white rounded-xl p-2 flex items-center justify-center shadow-xs border border-slate-200">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                  <path
                    fill="currentColor"
                    d="M10 10h30v30h-30z M50 10h10v10h-10z M70 10h20v20h-20z M20 20h10v10h-10z M10 50h10v10h-10z M30 50h20v10h-20z M60 50h10v20h-10z M80 50h10v10h-10z M10 70h30v20h-30z M20 80h10v10h-10z M50 70h10v20h-10z M70 70h20v20h-20z M80 80h10v10h-10z"
                  />
                </svg>
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 flex items-center gap-1 font-semibold">
                <Smartphone className="w-3 h-3" />
                <span>Scan with mobile camera to view</span>
              </span>
            </div>

            {/* Copy Link Input & Button */}
            <div className="space-y-2">
              <button
                onClick={handleNativeShare}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? "Link Copied to Clipboard!" : "Share Link / Native App"}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 dark:border-zinc-800 dark:text-zinc-300 dark:hover:text-white text-xs font-mono font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                <span>Copy Direct Showcase URL</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
