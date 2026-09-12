"use client";

import React, { useEffect, useState } from "react";
import { Clock, Activity, Sparkles, ShieldCheck, ChevronDown, Sun, Moon } from "lucide-react";
import { getISTMetrics, ISTMetrics } from "@/lib/time-utils";

interface RealtimeStatusClockProps {
  theme?: string;
  onToggleTheme?: () => void;
}

export default function RealtimeStatusClock({ theme, onToggleTheme }: RealtimeStatusClockProps) {
  const [metrics, setMetrics] = useState<ISTMetrics>(getISTMetrics());
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    // Tick every second to keep time exact
    const interval = setInterval(() => {
      setMetrics(getISTMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-[#0E0E11]/90 border border-slate-200 dark:border-zinc-800/80 shadow-xs backdrop-blur-md transition-colors">
        {/* Main Live Time & Status Trigger */}
        <button
          onClick={() => setPopoverOpen((prev) => !prev)}
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition group text-left"
          title="Click to view Live IST Session & Network Status"
        >
          {/* Pulsing Beacon Indicator */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>

          {/* Time & Session State */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900 dark:text-white tracking-wider">
              <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>{metrics.timeStr}</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-400 font-semibold">
                IST
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-1 text-[9px] font-mono text-slate-500 dark:text-zinc-400 leading-tight">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{metrics.statusLabel}</span>
            </div>
          </div>

          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition shrink-0 ml-0.5" />
        </button>

        {/* Integrated Compact Theme Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-blue-600" />
            )}
          </button>
        )}
      </div>

      {/* Popover Card */}
      {popoverOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setPopoverOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#0B0C10]/95 border border-slate-200 dark:border-zinc-800 shadow-xl dark:shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl text-slate-800 dark:text-zinc-200">
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">Live ASCEND Metrics</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Real-time IST Sync</div>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            </div>

            {/* Metrics List */}
            <div className="space-y-2.5 py-3 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/50">
                <span className="text-slate-500 dark:text-zinc-400">Indian Standard Time</span>
                <span className="text-slate-900 dark:text-white font-bold">{metrics.time12Str} IST</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/50">
                <span className="text-slate-500 dark:text-zinc-400">Date</span>
                <span className="text-slate-800 dark:text-zinc-300 font-medium">{metrics.dateStr}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/50">
                <span className="text-slate-500 dark:text-zinc-400">Current Phase</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{metrics.statusLabel}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/50">
                <span className="text-slate-500 dark:text-zinc-400">Authoritative Ruleset</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">TSJ-2026-v1</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/50">
                <span className="text-slate-500 dark:text-zinc-400">AutoVerify Engine</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  0.8ms Latency
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/50">
                <span className="text-slate-500 dark:text-zinc-400">Ledger Guarantee</span>
                <span className="text-purple-600 dark:text-purple-400 font-semibold">Zero Deductions</span>
              </div>
            </div>

            {/* Footer Note */}
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800/80 text-[10px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
              <span>Timezone: Asia/Kolkata (UTC+5:30)</span>
              <button
                onClick={() => setPopoverOpen(false)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
