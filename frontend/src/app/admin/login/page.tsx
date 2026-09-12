"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  ShieldAlert,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import AscendLogo from "@/components/ascend-logo";
import PrismaticGlassCard from "@/components/react-bits/PrismaticGlassCard";
import BorderBeam from "@/components/react-bits/BorderBeam";
import GradientText from "@/components/react-bits/GradientText";
import Meteors from "@/components/react-bits/Meteors";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, loginWithAccessCode } = useAuth();

  const [authMethod, setAuthMethod] = useState<"quick" | "password" | "code">("quick");
  const [email, setEmail] = useState("sarthak@ascend.team");
  const [password, setPassword] = useState("ascend2026");
  const [accessCode, setAccessCode] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickLaunch = async () => {
    setError(null);
    setLoading(true);
    try {
      // First try access code 123456
      const { user, redirectUrl } = await loginWithAccessCode("123456");
      router.push(redirectUrl || "/admin");
    } catch {
      try {
        // Fallback to password login with sarthak@ascend.team
        await login("sarthak@ascend.team", "ascend2026");
        router.push("/admin");
      } catch (err: any) {
        setError(err.message || "Failed to authenticate administrator session.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError(null);
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      const roleUpper = (user.role || "").toUpperCase();
      if (!roleUpper.includes("ADMIN") && !roleUpper.includes("CORE")) {
        setError("Account is authenticated but lacks Administrator governance permissions.");
        return;
      }
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid administrator email or master password.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = accessCode.trim();
    if (clean.length !== 6) {
      setError("Please enter the 6-digit administrator access code.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { user, redirectUrl } = await loginWithAccessCode(clean);
      const roleUpper = (user.role || "").toUpperCase();
      if (!roleUpper.includes("ADMIN") && !roleUpper.includes("CORE")) {
        setError("This access code does not belong to an Administrator role.");
        return;
      }
      router.push(redirectUrl || "/admin");
    } catch (err: any) {
      setError(err.message || "Invalid administrator security code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 sm:p-6 relative bg-transparent overflow-hidden">
      <Meteors number={14} />

      <div className="w-full max-w-lg relative z-10">
        <PrismaticGlassCard className="shadow-2xl border-red-500/20" glowColor="rgba(239, 68, 68, 0.15)">
          <BorderBeam size={280} duration={8} colorFrom="#ef4444" colorTo="#f97316" />

          <div className="space-y-6">
            {/* Header */}
            <div className="text-center flex flex-col items-center space-y-2">
              <AscendLogo size="lg" showSubtitle={true} />
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/60 border border-red-800/60 text-[10px] font-mono font-bold text-red-400 mt-1">
                <ShieldAlert className="w-3 h-3 text-red-400" />
                <span>RESTRICTED GOVERNANCE CONSOLE</span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight pt-1">
                <GradientText colors={["#f87171", "#ffffff", "#fb923c", "#f87171"]}>
                  Administrator Authentication Terminal
                </GradientText>
              </h1>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                Direct access for system administrators to audit score consensus, approve access requests, and manage cohort rules.
              </p>
            </div>

            {/* Auth Method Tabs */}
            <div className="grid grid-cols-3 p-1 rounded-xl bg-[#090A0D] border border-zinc-800/80">
              <button
                type="button"
                onClick={() => setAuthMethod("quick")}
                className={`py-2 px-2 text-xs font-semibold rounded-lg transition text-center ${
                  authMethod === "quick"
                    ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                1-Click Launch
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("code")}
                className={`py-2 px-2 text-xs font-semibold rounded-lg transition text-center ${
                  authMethod === "code"
                    ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Access Code
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("password")}
                className={`py-2 px-2 text-xs font-semibold rounded-lg transition text-center ${
                  authMethod === "password"
                    ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Credentials
              </button>
            </div>

            {/* Method 1: Pre-Seeded Quick Launch */}
            {authMethod === "quick" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#090A0D]/90 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800/60 flex items-center justify-center font-bold text-red-400 text-sm font-mono">
                        S
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Sarthak</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800/80">
                            ADMIN
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">sarthak@ascend.team</div>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-zinc-500 block text-[9px] uppercase">Access Code</span>
                      <span className="text-red-400 font-bold tracking-widest text-xs">123456</span>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <span className="text-zinc-500 block text-[9px] uppercase">Master Password</span>
                      <span className="text-zinc-300 font-bold text-xs">ascend2026</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleQuickLaunch}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-[0.99]"
                >
                  <Terminal className="w-4 h-4" />
                  <span>{loading ? "Authenticating Session..." : "Authorize Admin Governance Terminal"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Method 2: Direct 6-Digit Access Code */}
            {authMethod === "code" && (
              <form onSubmit={handleCodeLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>Superadmin Security Passcode</span>
                    <span className="text-[10px] font-mono text-red-400">Pre-seeded: 123456</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      maxLength={6}
                      inputMode="numeric"
                      required
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full bg-[#090A0D] border border-zinc-800 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-center text-lg font-mono font-bold tracking-[0.3em] text-red-400 placeholder-zinc-700 focus:outline-none transition shadow-inner"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || accessCode.length !== 6}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/25"
                >
                  <span>{loading ? "Verifying Code..." : "Authenticate via Passcode"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Method 3: Password Login */}
            {authMethod === "password" && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sarthak@ascend.team"
                      className="w-full bg-[#090A0D] border border-zinc-800 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition shadow-inner font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Master Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#090A0D] border border-zinc-800 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition shadow-inner font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/25"
                >
                  <span>{loading ? "Authenticating..." : "Sign In to Governance Console"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Back Navigation & Status */}
            <div className="pt-2 border-t border-zinc-800/70 flex flex-col items-center space-y-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-blue-400 transition"
              >
                <span>← Return to General Member / Student Registration</span>
              </Link>
              <div className="text-[10px] text-zinc-400 flex items-center justify-center gap-1.5 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Authoritative DB Connected • Role RBAC Hardware Isolation</span>
              </div>
            </div>
          </div>
        </PrismaticGlassCard>
      </div>
    </div>
  );
}
