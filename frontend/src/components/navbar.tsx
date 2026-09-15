"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LogOut,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Sun,
  Moon,
  UserCheck,
  FileText,
  LayoutDashboard,
  Shield,
  Sparkles,
} from "lucide-react";
import AscendLogo from "./ascend-logo";
import AccessCodeBadge from "./access-code-badge";
import AscendGuideAgentPanel from "./ascend-guide-agent-panel";
import { useTheme } from "@/lib/theme-context";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [guideOpen, setGuideOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "CORE_MEMBER":
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 font-mono font-semibold">
            CORE
          </span>
        );
      case "ADMIN":
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 font-mono font-semibold">
            ADMIN
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 font-mono font-semibold">
            MEMBER
          </span>
        );
    }
  };


  const workspaceUrl = user
    ? user.role === "CORE_MEMBER" || user.role === "ADMIN"
      ? "/core"
      : "/dashboard"
    : "/login";

  const handlePlatformClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login?redirect=/dashboard");
    } else {
      router.push(workspaceUrl);
    }
  };

  const handleHowItWorksClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setGuideOpen(true);
  };

  const handleLeaderboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/leaderboard");
  };

  const userFirstName = user?.name ? user.name.split(" ")[0] : "Account";

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-[#07080A]/90 backdrop-blur-xl shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          {/* Left: Brand + Primary Navigation */}
          <div className="flex items-center gap-8 lg:gap-10">
            {/* ASCEND Identity */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group transition-transform duration-200 hover:scale-[1.01]"
              title="ASCEND Home"
            >
              <AscendLogo size="md" showSubtitle={true} animated={true} />
            </Link>

            {/* Primary Desktop Navigation: Platform, How it works, Leaderboard */}
            <nav className="hidden md:flex items-center gap-1.5">
              {/* Platform */}
              <button
                onClick={handlePlatformClick}
                className={`px-3 py-1.5 rounded-md text-xs transition font-medium cursor-pointer ${
                  pathname === "/dashboard" || pathname === "/core"
                    ? "dark:text-zinc-100 text-slate-900 dark:bg-zinc-800/80 bg-slate-100 dark:border-zinc-700/80 border-slate-300 shadow-xs font-semibold"
                    : "dark:text-zinc-400 text-slate-600 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900/60"
                }`}
              >
                Platform
              </button>

              {/* How it works (Interactive ASCEND Guide Trigger) */}
              <button
                onClick={handleHowItWorksClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs dark:text-zinc-400 text-slate-600 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition font-medium cursor-pointer group"
                title="Ask the interactive ASCEND Guide"
              >
                <Sparkles className="w-3 h-3 text-blue-500 group-hover:scale-110 transition-transform" />
                <span>How it works</span>
              </button>

              {/* Leaderboard */}
              <button
                onClick={handleLeaderboardClick}
                className={`px-3 py-1.5 rounded-md text-xs transition font-medium cursor-pointer ${
                  pathname === "/leaderboard"
                    ? "dark:text-zinc-100 text-slate-900 dark:bg-zinc-800/80 bg-slate-100 dark:border-zinc-700/80 border-slate-300 shadow-xs font-semibold"
                    : "dark:text-zinc-400 text-slate-600 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900/60"
                }`}
              >
                Leaderboard
              </button>
            </nav>
          </div>

          {/* Right: Primary Action + Utility Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Primary Action: Workspace → */}
            <Link
              href={workspaceUrl}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium tracking-wide transition shadow-sm shadow-blue-600/20 hover:scale-[1.01] active:scale-[0.99]"
              title="Enter your active Workspace"
            >
              <span>Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Utility: Compact 6-Digit CODE Control */}
            {user && <AccessCodeBadge />}

            {/* Utility: Compact User Dropdown (Alex ▾) */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 text-xs transition text-slate-800 dark:text-zinc-200 font-semibold shadow-xs group"
                >
                  <span>{userFirstName}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500 dark:text-zinc-400 group-hover:text-slate-700 dark:group-hover:text-zinc-200 transition" />
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-[#0D0F14] border border-slate-200 dark:border-zinc-800 shadow-xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800 dark:text-zinc-300">
                      {/* User Identity Header */}
                      <div className="px-3 py-2 border-b border-slate-200 dark:border-zinc-800/80 mb-1 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white text-xs">{user.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono truncate max-w-[160px]">
                            {user.email}
                          </div>
                        </div>
                        {getRoleBadge(user.role)}
                      </div>

                      {/* Menu Links */}
                      <div className="space-y-0.5 py-1 text-xs">
                        <Link
                          href={workspaceUrl}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-blue-500" />
                          <span>My Workspace</span>
                        </Link>

                        <Link
                          href="/dashboard/history"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                          <span>Submissions & Proofs</span>
                        </Link>

                        {/* Admin Access Queue if authorized */}
                        {(user.role === "ADMIN" || user.role === "CORE_MEMBER") && (
                          <Link
                            href="/admin/access-requests"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-blue-600 dark:text-blue-300 transition"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                            <span>Access Request Queue</span>
                          </Link>
                        )}

                        {/* Theme Toggle in Menu */}
                        <button
                          onClick={() => {
                            toggleTheme();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            {theme === "dark" ? (
                              <Sun className="w-3.5 h-3.5 text-amber-500" />
                            ) : (
                              <Moon className="w-3.5 h-3.5 text-blue-500" />
                            )}
                            <span>Theme</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase font-semibold">
                            {theme}
                          </span>
                        </button>
                      </div>


                      {/* Sign Out */}
                      <div className="mt-1.5 pt-1.5 border-t border-zinc-800/80">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                            router.push("/login");
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/20 text-xs transition"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-sm shadow-blue-600/20"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-zinc-800 transition ml-1"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-zinc-800/80 bg-white/95 dark:bg-[#0A0C10] backdrop-blur-xl px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150 transition-colors shadow-lg">
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handlePlatformClick(e);
                }}
                className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white text-left transition shadow-xs"
              >
                Platform
              </button>
              <button
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleHowItWorksClick(e);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white text-left transition shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>How it works (ASCEND Guide)</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800/40 font-bold">
                  AI
                </span>
              </button>
              <button
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleLeaderboardClick(e);
                }}
                className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white text-left transition shadow-xs"
              >
                Leaderboard
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800/80 flex items-center gap-2">
              <Link
                href={workspaceUrl}
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Interactive ASCEND Guide Agent Panel */}
      <AscendGuideAgentPanel isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
}
