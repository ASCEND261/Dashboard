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
  QrCode,
  ExternalLink,
  ShieldCheck,
  Trophy,
  Sparkles,
  ArrowRight,
  TrendingUp,
  X,
  Smartphone,
  Flame,
  Award
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
    <div className="relative min-h-screen bg-[#07080A] text-zinc-100 selection:bg-blue-600 selection:text-white pb-24">
      {/* Living Network Background */}
      <AscendNetworkField />

      {/* Top Floating Header */}
      <header className="sticky top-0 z-30 w-full border-b border-zinc-800/80 bg-[#07080A]/85 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AscendLogo size="sm" showSubtitle={true} />
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/20"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share App</span>
            </button>

            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition"
            >
              <span>Member App</span>
              <ArrowRight className="w-3 h-3 text-zinc-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Showcase Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 pt-6 sm:pt-8 space-y-6">
        
        {/* Banner Pill */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/30 border border-blue-800/40 text-blue-400 text-[10px] font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Official Sprint Showcase &middot; TSJ-2026-v1</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-2">
            Team ASCEND Showcase
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto mt-1">
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
        <div className="flex items-center justify-center p-1 bg-zinc-900/90 border border-zinc-800 rounded-2xl max-w-md mx-auto text-xs font-mono">
          <button
            onClick={() => setActiveView("simulator")}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeView === "simulator"
                ? "bg-blue-600 text-white font-bold shadow"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verification Scan</span>
          </button>

          <button
            onClick={() => setActiveView("path")}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeView === "path"
                ? "bg-blue-600 text-white font-bold shadow"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Ascent Path</span>
          </button>

          <button
            onClick={() => setActiveView("ledger")}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeView === "ledger"
                ? "bg-blue-600 text-white font-bold shadow"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ledger</span>
          </button>
        </div>

        {/* Tab 1: Cinematic Verification Simulator */}
        {activeView === "simulator" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="text-center text-xs text-zinc-400 font-mono">
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
          <div className="p-6 rounded-3xl bg-[#0D0F12] border border-zinc-800 space-y-4 max-w-xl mx-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Immutable Point Ledger</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Zero-point deduction model</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                100% Certified
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Global AI Hackathon 2026</div>
                  <div className="text-[10px] text-zinc-500">EXTERNAL_HACKATHON_1ST &middot; Scope: TEAM</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-black">+50 PTS</div>
                  <div className="text-[9px] text-zinc-500">COMMITTED</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">7-Day Consecutive DSA Streak</div>
                  <div className="text-[10px] text-zinc-500">DSA_7_DAY_STREAK &middot; Scope: INDIVIDUAL + TEAM</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-black">+20 PTS</div>
                  <div className="text-[9px] text-zinc-500">COMMITTED</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Rust Core Upstream PR Merged</div>
                  <div className="text-[10px] text-zinc-500">OPEN_SOURCE_MERGED &middot; Scope: TEAM</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-black">+20 PTS</div>
                  <div className="text-[9px] text-zinc-500">COMMITTED</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Sprint Kickoff Meetup</div>
                  <div className="text-[10px] text-zinc-500">MEETUP_ATTENDANCE &middot; 4 Members Present</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-black">+20 PTS</div>
                  <div className="text-[9px] text-zinc-500">COMMITTED</div>
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
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-2xl shadow-blue-600/40 border border-blue-400/30 transition-transform active:scale-95"
        >
          <Share2 className="w-4 h-4" />
          <span>Share ASCEND</span>
        </button>
      </div>

      {/* Share Modal Dialog */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0E0E11] border border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-5 relative shadow-2xl">
            <button
              onClick={() => setShareModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-3 text-blue-400">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Share Team ASCEND</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Share this live verified achievement showcase with mentors, judges, and teammates.
              </p>
            </div>

            {/* QR Code Presentation Box */}
            <div className="p-4 rounded-2xl bg-[#141418] border border-zinc-800 flex flex-col items-center justify-center gap-2">
              <div className="w-32 h-32 bg-white rounded-xl p-2 flex items-center justify-center shadow">
                {/* SVG QR Code Mockup */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                  <path
                    fill="currentColor"
                    d="M10 10h30v30h-30z M50 10h10v10h-10z M70 10h20v20h-20z M20 20h10v10h-10z M10 50h10v10h-10z M30 50h20v10h-20z M60 50h10v20h-10z M80 50h10v10h-10z M10 70h30v20h-30z M20 80h10v10h-10z M50 70h10v20h-10z M70 70h20v20h-20z M80 80h10v10h-10z"
                  />
                </svg>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                <span>Scan with mobile camera to view</span>
              </span>
            </div>

            {/* Copy Link Input & Button */}
            <div className="space-y-2">
              <button
                onClick={handleNativeShare}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? "Link Copied to Clipboard!" : "Share Link / Native App"}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono transition flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy Direct Showcase URL</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
