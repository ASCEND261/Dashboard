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
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{
        background: "rgba(9, 9, 11, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(39,39,42,0.8)",
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
                isActive ? "text-white" : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {/* Active pill background */}
              {isActive && (
                <span className="absolute inset-0 rounded-xl bg-zinc-800/80 border border-zinc-700/50" />
              )}

              {/* Highlight dot for submit/queue */}
              {item.highlight && !isActive && (
                <span className="absolute top-1.5 right-2.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}

              <Icon
                className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? "text-blue-400" : "text-zinc-600"
                }`}
              />
              <span
                className={`text-[10px] font-medium relative z-10 ${
                  isActive ? "text-zinc-200" : "text-zinc-600"
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
