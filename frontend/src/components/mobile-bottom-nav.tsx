"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Plus,
  Trophy,
  CheckSquare,
  Clock,
  Inbox,
  BarChart3,
} from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  // Don't show on auth pages
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/access-pending") ||
    pathname === "/"
  )
    return null;

  const isCore = user.role === "CORE_MEMBER" || user.role === "ADMIN";

  const memberItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/dashboard/submit", icon: Plus, label: "Submit", highlight: true },
    { href: "/dashboard/submissions", icon: CheckSquare, label: "Mine" },
    { href: "/dashboard/leaderboard", icon: Trophy, label: "Board" },
    { href: "/dashboard/history", icon: Clock, label: "History" },
  ];

  const coreItems = [
    { href: "/core", icon: LayoutDashboard, label: "Home" },
    { href: "/core/queue", icon: Inbox, label: "Queue", highlight: true },
    { href: "/admin/members", icon: Trophy, label: "Members" },
    { href: "/core/analytics", icon: BarChart3, label: "Stats" },
    { href: "/core/history", icon: Clock, label: "History" },
  ];

  const items = isCore ? coreItems : memberItems;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 dark:bg-[#09090B]/95 border-t border-slate-200 dark:border-zinc-800 backdrop-blur-xl shadow-lg transition-colors"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/core" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[56px] relative ${
                isActive ? "text-blue-600 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-zinc-300"
              }`}
            >
              {/* Active pill background */}
              {isActive && (
                <span className="absolute inset-0 rounded-xl bg-blue-50 border border-blue-200 dark:bg-zinc-800/80 dark:border-zinc-700/50" />
              )}

              {/* Highlight dot for submit/queue */}
              {item.highlight && !isActive && (
                <span className="absolute top-1.5 right-2.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}

              <Icon
                className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-zinc-500"
                }`}
              />
              <span
                className={`text-[10px] font-semibold relative z-10 ${
                  isActive ? "text-blue-700 dark:text-zinc-100" : "text-slate-500 dark:text-zinc-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
