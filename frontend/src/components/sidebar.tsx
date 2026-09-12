"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Home,
  Trophy,
  PlusCircle,
  Inbox,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
  BarChart3,
  Scale,
  RefreshCw,
  FileText,
  Clock,
  Users,
  Building,
  Settings,
  CheckSquare,
  History
} from "lucide-react";
import AscendLogo from "./ascend-logo";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  highlight?: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isCore = user?.role === "CORE_MEMBER" || user?.role === "ADMIN";

  // Member Workspace Links
  const memberNav: NavItem[] = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Submit Achievement", href: "/dashboard/submit", icon: PlusCircle, highlight: true },
    { label: "My Submissions", href: "/dashboard/submissions", icon: CheckSquare },
    { label: "Team Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
    { label: "Points History", href: "/dashboard/history", icon: History },
  ];

  // Core Member / Verifier Workspace Links
  const coreNav: NavItem[] = [
    { label: "Verifier Overview", href: "/core", icon: LayoutDashboard },
    { label: "Verification Queue", href: "/core/queue", icon: CheckSquare, highlight: true },
    { label: "Members Leaderboard", href: "/admin/members", icon: Trophy, highlight: true },
    { label: "Verification History", href: "/core/history", icon: History },
    { label: "Cohort Analytics", href: "/core/analytics", icon: BarChart3 },
    { label: "Audit Log", href: "/core/audit", icon: FileText },
  ];

  const activeLinks: NavItem[] = isCore ? coreNav : memberNav;

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0E0E11] min-h-[calc(100vh-3.5rem)] p-4 font-mono transition-colors">
      {/* Workspace Scope Header */}
      <div className="px-3 py-2.5 mb-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            {isCore ? "Core Verifier Workspace" : "Member Workspace"}
          </div>
          <AscendLogo size="xs" showText={false} />
        </div>
        <div className="text-xs font-semibold text-slate-900 dark:text-zinc-200 mt-1.5 flex items-center justify-between">
          <span className="font-sans font-bold truncate pr-2">{user?.name || "Team ASCEND"}</span>
          <div className="flex items-center gap-1">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
              (user?.branch || "").includes("AI")
                ? "bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60"
                : (user?.branch || "").includes("VLSI")
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60"
                : (user?.branch || "").includes("CYBER")
                ? "bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/60"
                : "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60"
            }`}>
              {user?.branch || user?.department?.code || user?.department_unit || (isCore ? "ADMIN" : "MEMBER")}
            </span>
            {user?.section && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-slate-200/80 text-slate-700 border border-slate-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 font-mono">
                Sec {user.section}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="space-y-1 flex-1 font-sans">
        {activeLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/core" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-bold shadow-sm translate-x-1"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-850 hover:translate-x-1"
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-zinc-400"}`} />
              <span className="flex-1">{item.label}</span>
              {item.highlight && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="mt-auto pt-3 border-t border-slate-200 dark:border-zinc-800 px-2 text-[11px] text-slate-500 dark:text-zinc-400">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Rules Engine:</span>
          </span>
          <span className="text-slate-800 dark:text-zinc-300 font-semibold font-mono">2026-v1</span>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span>Consensus Ledger:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-[10px]">LIVE</span>
        </div>
      </div>
    </aside>
  );
}
