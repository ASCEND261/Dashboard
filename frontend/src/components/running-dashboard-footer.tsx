"use client";

import React, { useEffect, useState } from "react";
import {
  Trophy,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  Radio,
} from "lucide-react";
import { getISTMetrics, ISTMetrics } from "@/lib/time-utils";

export default function RunningDashboardFooter() {
  const [metrics, setMetrics] = useState<ISTMetrics>(getISTMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getISTMetrics());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const tickerItems = [
    {
      icon: Radio,
      color: "text-emerald-400",
      label: "ASCEND AUTHORITATIVE NETWORK",
      val: "ONLINE",
      badge: "LIVE 60 FPS",
    },
    {
      icon: Clock,
      color: "text-blue-400",
      label: "REAL-TIME IST (UTC+5:30)",
      val: `${metrics.time12Str}`,
      badge: metrics.statusLabel.toUpperCase(),
    },
    {
      icon: Trophy,
      color: "text-amber-400",
      label: "LEADERBOARD TIER 1",
      val: "1. Code Crafters (1,955 PTS)",
      badge: "RANK #1",
    },
    {
      icon: Zap,
      color: "text-purple-400",
      label: "DETERMINISTIC ENGINE",
      val: "TSJ-2026-v1",
      badge: "27 ACTIVE RULES",
    },
    {
      icon: ShieldCheck,
      color: "text-emerald-400",
      label: "AUDIT PROTOCOL",
      val: "Zero-Deduction Guarantee",
      badge: "IMMUTABLE LEDGER",
    },
    {
      icon: Sparkles,
      color: "text-cyan-400",
      label: "AUTOVERIFY AI",
      val: "OCR Multi-Signal Active",
      badge: "0.8ms LATENCY",
    },
    {
      icon: Flame,
      color: "text-orange-400",
      label: "CURRENT SPRINT",
      val: "Tech Sprint Journey 2026",
      badge: "5 COHORT TEAMS",
    },
    {
      icon: CheckCircle2,
      color: "text-emerald-400",
      label: "VERIFICATION PIPELINE",
      val: "Dual-Entry Accounting",
      badge: "100% BALANCED",
    },
  ];

  return (
    <div className="relative mt-8 mb-16 lg:mb-6 rounded-2xl overflow-hidden border border-zinc-800/80 bg-[#090A0D]/90 backdrop-blur-xl shadow-2xl group">
      {/* Decorative top gradient accent */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      {/* Header Bar */}
      <div className="px-4 py-2 bg-black/40 border-b border-zinc-800/50 flex items-center justify-between text-[10px] font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-zinc-200 uppercase tracking-wider">
            ASCEND Live Telemetry & Mission Control Stream
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-zinc-500 hidden sm:inline">Hover to pause stream</span>
          <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/40 text-blue-400 font-bold">
            IST {metrics.timeStr}
          </span>
        </div>
      </div>

      {/* Continuous Marquee Ticker Track */}
      <div className="relative flex overflow-x-hidden py-3">
        <div className="flex animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]">
          {tickerItems.concat(tickerItems).map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="inline-flex items-center gap-2.5 mx-5 px-3 py-1.5 rounded-xl bg-[#0D0F14]/80 border border-zinc-800/60 hover:border-zinc-700 transition"
              >
                <Icon className={`w-3.5 h-3.5 ${item.color} shrink-0`} />
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-zinc-400 text-[11px] uppercase">{item.label}:</span>
                  <span className="text-white font-bold">{item.val}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 font-semibold uppercase tracking-wider">
                    {item.badge}
                  </span>
                </div>
                <span className="text-zinc-700 ml-2">/</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inline styles for keyframe marquee animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
      `}</style>
    </div>
  );
}
