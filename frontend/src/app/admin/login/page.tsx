"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  ShieldAlert,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import AscendLogo from "@/components/ascend-logo";
import PrismaticGlassCard from "@/components/react-bits/PrismaticGlassCard";
import BorderBeam from "@/components/react-bits/BorderBeam";
import Meteors from "@/components/react-bits/Meteors";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, loginWithAccessCode } = useAuth();

  const [authMethod, setAuthMethod] = useState<"code" | "password">("code");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Removed Quick Launch

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
      <Meteors number={12} />

      <div className="w-full max-w-lg relative z-10">
        <PrismaticGlassCard className="shadow-xl dark:shadow-2xl border-rose-500/20" glowColor="rgba(239, 68, 68, 0.15)">
          <BorderBeam size={280} duration={8} colorFrom="#ef4444" colorTo="#f97316" />

          <div className="space-y-6">
            {/* Header */}
            <div className="text-center flex flex-col items-center space-y-2">
              <AscendLogo size="lg" showSubtitle={true} />
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-red-950/60 border border-rose-200 dark:border-red-800/60 text-[10px] font-mono font-bold text-rose-700 dark:text-red-400 mt-1">
                <ShieldAlert className="w-3 h-3 text-rose-600 dark:text-red-400" />
                <span>RESTRICTED GOVERNANCE CONSOLE</span>
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight pt-1">
                Administrator Authentication Terminal
              </h1>
              <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-sm leading-relaxed">
                Direct access for system administrators to audit score consensus, approve access requests, and manage cohort rules.
              </p>
            </div>

            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-[#090A0D] border border-slate-200 dark:border-zinc-800/80">
              <button
                type="button"
                onClick={() => setAuthMethod("code")}
                className={`py-2 px-2 text-xs font-semibold rounded-lg transition text-center ${
                  authMethod === "code"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                Access Code
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("password")}
                className={`py-2 px-2 text-xs font-semibold rounded-lg transition text-center ${
                  authMethod === "password"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                Credentials
              </button>
            </div>

            {/* Methods Container */}
            {/* Method 2: Direct 6-Digit Access Code */}
            {authMethod === "code" && (
              <form onSubmit={handleCodeLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>Superadmin Security Passcode</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      maxLength={6}
                      inputMode="numeric"
                      required
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 6-digit Code"
                      className="w-full bg-white dark:bg-[#090A0D] border border-slate-300 dark:border-zinc-800 focus:border-rose-500 rounded-xl pl-10 pr-4 py-2.5 text-center text-lg font-mono font-bold tracking-[0.3em] text-rose-600 dark:text-red-400 placeholder-slate-300 dark:placeholder-zinc-700 focus:outline-none transition shadow-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || accessCode.length !== 6}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 shadow-md shadow-rose-600/25"
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sarthak@ascend.team"
                      className="w-full bg-white dark:bg-[#090A0D] border border-slate-300 dark:border-zinc-800 focus:border-rose-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition shadow-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Master Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white dark:bg-[#090A0D] border border-slate-300 dark:border-zinc-800 focus:border-rose-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition shadow-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 shadow-md shadow-rose-600/25"
                >
                  <span>{loading ? "Authenticating..." : "Sign In to Governance Console"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-red-950/40 border border-rose-200 dark:border-red-800/60 text-xs text-rose-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Back Navigation & Status */}
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800/70 flex flex-col items-center space-y-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition font-semibold"
              >
                <span>← Return to General Member / Student Registration</span>
              </Link>
              <div className="text-[10px] text-slate-500 dark:text-zinc-400 flex items-center justify-center gap-1.5 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Authoritative DB Connected • Role RBAC Hardware Isolation</span>
              </div>
            </div>
          </div>
        </PrismaticGlassCard>
      </div>
    </div>
  );
}
