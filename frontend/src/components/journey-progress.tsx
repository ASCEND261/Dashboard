"use client";

import React from "react";
import { CheckCircle2, ChevronRight, TrendingUp, Flag, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface MilestoneProps {
  currentPoints: number;
  targetPoints: number;
  pointsRemaining: number;
  completionPct: number;
}

export default function JourneyProgress({ currentPoints, targetPoints, pointsRemaining, completionPct }: MilestoneProps) {
  const steps = [
    { label: "COHORT START", points: 0, status: "completed", desc: "Tech Journey kicked off" },
    { label: "TIER 1 BASE", points: 500, status: "completed", desc: "Foundation milestones unlocked" },
    { label: "TIER 2 ASCENT", points: 1000, status: "completed", desc: "Advanced competitions verified" },
    { label: "CURRENT POSITION", points: currentPoints, status: "current", desc: "Ascent active in Tier 3" },
    { label: "TIER 3 MILESTONE", points: targetPoints, status: "upcoming", desc: `${pointsRemaining} pts needed to cross threshold` },
  ];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 relative overflow-hidden shadow-xs transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-slate-500 dark:text-zinc-400 uppercase flex items-center gap-1.5">
              <span>ASCEND JOURNEY</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 font-mono font-semibold">
              Milestone Tracker
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-1 tracking-tight">Upward Trajectory</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
            Collective ascent across verified hackathons, research, and technical achievements.
          </p>
        </div>

        {/* Milestone Card */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 shrink-0 font-mono shadow-xs">
          <div>
            <div className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">Current Milestone</div>
            <div className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-slate-900 dark:text-zinc-100">{currentPoints.toLocaleString()}</span>
              <span className="text-slate-400 dark:text-zinc-600">/</span>
              <span className="text-slate-600 dark:text-zinc-400">{targetPoints.toLocaleString()}</span>
            </div>
          </div>
          <div className="h-7 w-px bg-slate-200 dark:bg-zinc-800"></div>
          <div>
            <div className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">Next Threshold</div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{pointsRemaining} pts needed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Progress Bar */}
      <div className="mt-5 space-y-1.5">
        <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400 font-mono font-semibold">
          <span>Tier 2 (1,000 pts)</span>
          <span className="text-slate-900 dark:text-zinc-200 font-bold">{completionPct}% Complete</span>
          <span>Tier 3 ({targetPoints.toLocaleString()} pts)</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-hidden p-0.5">
          <motion.div
            className="h-full rounded-full bg-blue-600"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(100, completionPct)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Upward Stepped Circuit Visualization */}
      <div className="mt-6 pt-4">
        <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2 font-bold">
          <Flag className="w-3.5 h-3.5 text-blue-500" />
          <span>Ascent Circuit Nodes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {steps.map((step, idx) => {
            const isCompleted = step.status === "completed";
            const isCurrent = step.status === "current";
            const isUpcoming = step.status === "upcoming";

            return (
              <div
                key={idx}
                className={`relative rounded-xl p-3.5 border transition duration-150 ${
                  isCurrent
                    ? "bg-blue-50/80 border-blue-300 dark:bg-zinc-900 dark:border-zinc-700 shadow-xs"
                    : isCompleted
                    ? "bg-slate-50 border-slate-200 dark:bg-zinc-900/60 dark:border-zinc-800"
                    : "bg-white border-slate-200/80 dark:bg-zinc-950 dark:border-zinc-850 opacity-70"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-mono font-bold tracking-wider text-slate-500 dark:text-zinc-400">
                    STEP 0{idx + 1}
                  </div>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  {isCurrent && <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>}
                  {isUpcoming && <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700"></div>}
                </div>

                <div className={`text-xs font-bold font-mono tracking-tight ${isCurrent ? "text-blue-900 dark:text-white" : isCompleted ? "text-slate-800 dark:text-zinc-200" : "text-slate-500 dark:text-zinc-400"}`}>
                  {step.label}
                </div>

                <div className="mt-1 font-mono text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {step.points.toLocaleString()} PTS
                </div>

                <p className="mt-1 text-[11px] text-slate-600 dark:text-zinc-400 leading-tight font-sans">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
