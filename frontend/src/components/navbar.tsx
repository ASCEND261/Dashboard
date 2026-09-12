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
  const { user, logout, demoAccounts, loginWithDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [guideOpen, setGuideOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "CORE_MEMBER":
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/50 font-mono font-semibold">
            CORE
          </span>
        );
      case "ADMIN":
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-400 border border-purple-800/50 font-mono font-semibold">
            ADMIN
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono font-semibold">
            MEMBER
          </span>
        );
    }
  };

  const handleSelectDemo = (account: any) => {
    loginWithDemo(account);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    if (account.role === "CORE_MEMBER" || account.role === "ADMIN") {
      router.push("/core");
    } else {
      router.push("/dashboard");
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
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#07080A]/90 backdrop-blur-xl">
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
                    ? "text-zinc-100 bg-zinc-800/80 border border-zinc-700/80 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
                }`}
              >
                Platform
              </button>

              {/* How it works (Interactive ASCEND Guide Trigger) */}
              <button
                onClick={handleHowItWorksClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60 transition font-medium cursor-pointer group"
                title="Ask the interactive ASCEND Guide"
              >
                <Sparkles className="w-3 h-3 text-blue-400 group-hover:scale-110 transition-transform" />
                <span>How it works</span>
              </button>

              {/* Leaderboard */}
              <button
                onClick={handleLeaderboardClick}
                className={`px-3 py-1.5 rounded-md text-xs transition font-medium cursor-pointer ${
                  pathname === "/leaderboard"
                    ? "text-zinc-100 bg-zinc-800/80 border border-zinc-700/80 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
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
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 text-xs transition text-zinc-200 font-medium group"
                >
                  <span>{userFirstName}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-400 group-hover:text-zinc-200 transition" />
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0D0F14] border border-zinc-800 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-zinc-300">
                      {/* User Identity Header */}
                      <div className="px-3 py-2 border-b border-zinc-800/80 mb-1 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white text-xs">{user.name}</div>
                          <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[160px]">
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
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-white transition"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
                          <span>My Workspace</span>
                        </Link>

                        <Link
                          href="/dashboard/history"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-white transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Submissions & Proofs</span>
                        </Link>

                        {/* Admin Access Queue if authorized */}
                        {(user.role === "ADMIN" || user.role === "CORE_MEMBER") && (
                          <Link
                            href="/admin/access-requests"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-white transition text-blue-300"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                            <span>Access Request Queue</span>
                          </Link>
                        )}

                        {/* Theme Toggle in Menu */}
                        <button
                          onClick={() => {
                            toggleTheme();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-800 hover:text-white transition text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            {theme === "dark" ? (
                              <Sun className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Moon className="w-3.5 h-3.5 text-blue-400" />
                            )}
                            <span>Theme</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 uppercase">
                            {theme}
                          </span>
                        </button>
                      </div>

                      {/* Demo Persona Switcher Section */}
                      {demoAccounts.filter((a) => a.email !== user?.email).length > 0 && (
                        <div className="mt-1 pt-1.5 border-t border-zinc-800/80">
                          <div className="px-3 py-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                            Switch Account
                          </div>
                          <div className="space-y-0.5">
                            {demoAccounts
                              .filter((a) => a.email !== user?.email)
                              .map((acc) => (
                                <button
                                  key={acc.id}
                                  onClick={() => handleSelectDemo(acc)}
                                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 transition"
                                >
                                  <span className="truncate">{acc.name}</span>
                                  {getRoleBadge(acc.role)}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

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
          <div className="md:hidden border-t border-zinc-800/80 bg-[#0A0C10] px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handlePlatformClick(e);
                }}
                className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 hover:text-white text-left transition"
              >
                Platform
              </button>
              <button
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleHowItWorksClick(e);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 hover:text-white text-left transition"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>How it works (ASCEND Guide)</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/40">
                  AI
                </span>
              </button>
              <button
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleLeaderboardClick(e);
                }}
                className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 hover:text-white text-left transition"
              >
                Leaderboard
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
              <Link
                href={workspaceUrl}
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
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
