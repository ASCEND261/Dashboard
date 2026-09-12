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
    <div className="p-6 rounded-xl bg-[#0E0E11] border border-zinc-800 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
              <span>ASCEND JOURNEY</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
              Milestone Tracker
            </span>
          </div>
          <h2 className="text-lg font-bold text-zinc-100 mt-1">Upward Trajectory</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Collective ascent across verified hackathons, research, and technical achievements.
          </p>
        </div>

        {/* Milestone Card */}
        <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 shrink-0 font-mono shadow-sm">
          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Current Milestone</div>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-zinc-100">{currentPoints.toLocaleString()}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400">{targetPoints.toLocaleString()}</span>
            </div>
          </div>
          <div className="h-7 w-px bg-zinc-800"></div>
          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Next Threshold</div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{pointsRemaining} pts needed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Progress Bar */}
      <div className="mt-5 space-y-1.5">
        <div className="flex justify-between text-xs text-zinc-400 font-mono">
          <span>Tier 2 (1,000 pts)</span>
          <span className="text-zinc-200 font-semibold">{completionPct}% Complete</span>
          <span>Tier 3 ({targetPoints.toLocaleString()} pts)</span>
        </div>
        <div className="w-full h-2 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden p-0.5">
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
        <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Flag className="w-3.5 h-3.5 text-zinc-400" />
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
                className={`relative rounded-lg p-3.5 border transition duration-150 ${
                  isCurrent
                    ? "bg-zinc-900 border-zinc-700 shadow-sm"
                    : isCompleted
                    ? "bg-zinc-900/60 border-zinc-800"
                    : "bg-zinc-950 border-zinc-850 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-mono font-semibold tracking-wider text-zinc-400">
                    STEP 0{idx + 1}
                  </div>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {isCurrent && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                  {isUpcoming && <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>}
                </div>

                <div className={`text-xs font-bold font-mono tracking-tight ${isCurrent ? "text-white" : isCompleted ? "text-zinc-200" : "text-zinc-400"}`}>
                  {step.label}
                </div>

                <div className="mt-1 font-mono text-xs font-bold text-zinc-300">
                  {step.points.toLocaleString()} PTS
                </div>

                <p className="mt-1 text-[11px] text-zinc-400 leading-tight font-sans">
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
