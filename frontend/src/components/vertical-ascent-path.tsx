"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Lock,
  Clock,
  ArrowUp,
  Sparkles,
  Award,
  Code2,
  GitPullRequest,
  Users,
  Compass
} from "lucide-react";

interface MilestoneNode {
  id: string;
  category: string;
  title: string;
  points: number;
  scope: string;
  status: "VERIFIED" | "IN_PROGRESS" | "UPCOMING";
  date: string;
  proofType: string;
  ruleCode: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MILESTONES: MilestoneNode[] = [
  {
    id: "m-1",
    category: "Meetup Attendance",
    title: "Sprint Kickoff & Architecture Alignment",
    points: 20,
    scope: "TEAM",
    status: "VERIFIED",
    date: "Sep 01, 2026",
    proofType: "Signed Attendance Register",
    ruleCode: "MEETUP_ATTENDANCE",
    icon: Users,
  },
  {
    id: "m-2",
    category: "DSA Consecutive Streak",
    title: "7-Day Consecutive Problem Solving Streak",
    points: 20,
    scope: "INDIVIDUAL & TEAM",
    status: "VERIFIED",
    date: "Sep 03, 2026",
    proofType: "LeetCode Daily Calendar",
    ruleCode: "DSA_7_DAY_STREAK",
    icon: Code2,
  },
  {
    id: "m-3",
    category: "Open Source Contribution",
    title: "Merged PR in Upstream Infrastructure",
    points: 20,
    scope: "TEAM",
    status: "VERIFIED",
    date: "Sep 04, 2026",
    proofType: "GitHub Merged PR URL",
    ruleCode: "OPEN_SOURCE_MERGED",
    icon: GitPullRequest,
  },
  {
    id: "m-4",
    category: "External Hackathon",
    title: "Global AI Hackathon — 1st Place Winner",
    points: 50,
    scope: "TEAM",
    status: "VERIFIED",
    date: "Sep 04, 2026",
    proofType: "Official Winner Certificate",
    ruleCode: "EXTERNAL_HACKATHON_1ST",
    icon: Award,
  },
  {
    id: "m-5",
    category: "Sprint Capstone Project",
    title: "ASCEND Verification Core & Production Engine",
    points: 250,
    scope: "TEAM",
    status: "IN_PROGRESS",
    date: "Target: Sep 20, 2026",
    proofType: "Architecture Audit & Deployed System",
    ruleCode: "MAJOR_PROJECT_WINNER",
    icon: Compass,
  },
];

export default function VerticalAscentPath() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("m-4");

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-3">
      {/* Top Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 text-blue-700 dark:text-blue-400 text-[10px] font-mono uppercase tracking-wider mb-2 font-bold">
          <ArrowUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          <span>Vertical Ascent Path</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Team Ascent Constellation</h2>
        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
          Scroll upward through the team&apos;s journey. Every milestone physically anchors verified points into the official ledger.
        </p>
      </div>

      {/* The Ascent Spine */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[27px] sm:before:left-[35px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-t before:from-blue-600/40 before:via-blue-500 before:to-slate-300 dark:before:to-zinc-800">
        {MILESTONES.map((node, index) => {
          const isSelected = selectedNodeId === node.id;
          const isVerified = node.status === "VERIFIED";
          const isInProgress = node.status === "IN_PROGRESS";
          const Icon = node.icon;

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className="relative group cursor-pointer transition-all duration-200"
            >
              {/* Node Marker along the Spine */}
              <div
                className={`absolute -left-[27px] sm:-left-[35px] top-3.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-transform duration-300 ${
                  isVerified
                    ? "bg-blue-600 border-white dark:border-[#0D0F12] text-white shadow-[0_0_12px_rgba(37,99,235,0.6)] scale-110"
                    : isInProgress
                    ? "bg-white dark:bg-[#0D0F12] border-blue-500 text-blue-600 dark:text-blue-400 animate-pulse"
                    : "bg-slate-100 dark:bg-[#0D0F12] border-slate-300 dark:border-zinc-700 text-slate-400 dark:text-zinc-500"
                }`}
              >
                {isVerified ? (
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : isInProgress ? (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                ) : (
                  <Lock className="w-2.5 h-2.5" />
                )}
              </div>

              {/* Node Card */}
              <div
                className={`ml-4 p-4 rounded-2xl border transition-all duration-300 ${
                  isSelected
                    ? "bg-blue-50/80 dark:bg-[#12151A] border-blue-300 dark:border-blue-500/50 shadow-md shadow-blue-500/5"
                    : "bg-white hover:bg-slate-50 border-slate-200 dark:bg-[#0D0F12] dark:hover:bg-[#12151A] dark:border-zinc-800 shadow-xs"
                }`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold">
                      {node.category}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                      isVerified
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40"
                        : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40"
                    }`}
                  >
                    +{node.points} PTS
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition">
                  {node.title}
                </h3>

                {/* Expanded Details when selected */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800/80 text-[11px] font-mono grid grid-cols-2 gap-2 animate-in fade-in duration-200">
                    <div>
                      <span className="text-slate-500 dark:text-zinc-500 block font-semibold">EVIDENCE</span>
                      <span className="text-slate-800 dark:text-zinc-300">{node.proofType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-zinc-500 block font-semibold">RULE CODE</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{node.ruleCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-zinc-500 block font-semibold">SCOPE</span>
                      <span className="text-slate-800 dark:text-zinc-300">{node.scope}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-zinc-500 block font-semibold">TIMELOCK</span>
                      <span className="text-slate-800 dark:text-zinc-300">{node.date}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
