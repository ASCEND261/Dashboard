"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck,
  AlertCircle, CheckCircle2, BookOpen, ChevronDown, Sparkles,
  KeyRound, ArrowLeft, RotateCcw
} from "lucide-react";
import AscendLogo from "@/components/ascend-logo";
import PrismaticGlassCard from "@/components/react-bits/PrismaticGlassCard";
import BorderBeam from "@/components/react-bits/BorderBeam";
import Meteors from "@/components/react-bits/Meteors";

const DEPARTMENTS = [
  { key: "T", name: "TECHNICAL",  color: "#2563EB" },
  { key: "E", name: "EVENT MGT", color: "#7C3AED" },
  { key: "R", name: "R&D",        color: "#0891B2" },
  { key: "S", name: "SOCIAL",     color: "#059669" },
  { key: "D", name: "DESIGN",     color: "#D97706" },
  { key: "P", name: "PR",         color: "#DC2626" },
];

const BRANCHES = ["CSE", "AI&ML", "AI&DS", "VLSI", "CS-CYBER", "CSAM"];
const SECTIONS = ["A", "B", "C"];

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithAccessCode } = useAuth();

  const [tab, setTab] = useState<"signin" | "code" | "register">("signin");

  // Sign In
  const [siEmail, setSiEmail]       = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siShowPw, setSiShowPw]     = useState(false);

  // Access Code
  const [accessCode, setAccessCode] = useState("");

  // Register
  const [regName, setRegName]             = useState("");
  const [regEmail, setRegEmail]           = useState("");
  const [regPassword, setRegPassword]     = useState("");
  const [regShowPw, setRegShowPw]         = useState(false);
  const [regEnrollment, setRegEnrollment] = useState("");
  const [regBranch, setRegBranch]         = useState("CSE");
  const [regSection, setRegSection]       = useState("A");
  const [regDept, setRegDept]             = useState("TECHNICAL");

  // Forgot Password
  const [forgotMode, setForgotMode] = useState(false);
  const [fpStep, setFpStep] = useState<1 | 2>(1);
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPw, setFpNewPw] = useState("");
  const [fpConfirmPw, setFpConfirmPw] = useState("");
  const [fpShowPw, setFpShowPw] = useState(false);

  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await api.forgotPassword(fpEmail.trim());
      setSuccess(res.message + (res.dev_otp ? ` (Dev code: ${res.dev_otp})` : ""));
      setFpStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (fpNewPw !== fpConfirmPw) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.resetPassword({
        email: fpEmail.trim(),
        otp: fpOtp.trim(),
        new_password: fpNewPw,
      });
      setSuccess(res.message);
      setTimeout(() => {
        setForgotMode(false);
        setFpStep(1);
        setFpOtp("");
        setFpNewPw("");
        setFpConfirmPw("");
        setSiEmail(fpEmail.trim());
        setSiPassword("");
        setSuccess(null);
        setTab("signin");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(siEmail.trim(), siPassword);
      if (user.status === "PENDING") {
        router.push("/access-pending");
      } else if (user.role === "ADMIN") {
        router.push("/admin");
      } else if (user.role === "CORE_MEMBER") {
        router.push("/core");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { redirectUrl, user } = await loginWithAccessCode(accessCode.trim());
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else if (user.role === "CORE_MEMBER") {
        router.push("/core");
      } else {
        router.push(redirectUrl || "/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid or expired access code.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await api.register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        enrollment_number: regEnrollment.trim() || undefined,
        branch: regBranch,
        section: regSection,
        department: regDept,
      });
      setSuccess(res.message);
      setTimeout(() => {
        setTab("signin");
        setSiEmail(regEmail.trim());
        setSuccess(null);
      }, 1800);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 sm:p-6 relative bg-transparent overflow-hidden">
      {/* Animated meteors background */}
      <Meteors number={14} />

      <div className="w-full max-w-md relative z-10">
        <PrismaticGlassCard className="shadow-xl dark:shadow-2xl">
          <BorderBeam size={280} duration={7} colorFrom="#3b82f6" colorTo="#8b5cf6" />

          <div className="space-y-5">
            {/* ── Brand Header ── */}
            <div className="text-center flex flex-col items-center space-y-2">
              <AscendLogo size="lg" showSubtitle={true} />
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-wide pt-1">
                Member Authentication Gate
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                Verifiable identity · Authorized cohort access
              </p>
            </div>

            {/* ── Tab Switcher ── */}
            <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100 dark:bg-[#090A0D] border border-slate-200 dark:border-zinc-800/80">
              <button
                type="button"
                onClick={() => { setTab("signin"); setError(null); setSuccess(null); }}
                className={`py-2 text-[10px] sm:text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  tab === "signin"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 dark:bg-zinc-800 dark:text-white dark:border-zinc-700/50"
                    : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </button>
              <button
                type="button"
                onClick={() => { setTab("code"); setError(null); setSuccess(null); }}
                className={`py-2 text-[10px] sm:text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  tab === "code"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 dark:bg-zinc-800 dark:text-white dark:border-zinc-700/50"
                    : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Code</span>
              </button>
              <button
                type="button"
                onClick={() => { setTab("register"); setError(null); setSuccess(null); }}
                className={`py-2 text-[10px] sm:text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  tab === "register"
                    ? "bg-blue-600 text-white shadow-xs dark:bg-blue-600/20 dark:text-blue-300 dark:border dark:border-blue-500/30"
                    : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Create Account</span>
                <span className="sm:hidden">Signup</span>
              </button>
            </div>

            {/* ── Alerts ── */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-red-950/30 border border-rose-200 dark:border-red-800/50 text-xs text-rose-700 dark:text-red-300">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-600 dark:text-red-400" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            {/* ─────────────── SIGN IN FORM ─────────────── */}
            {tab === "signin" && !forgotMode && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={siEmail}
                      onChange={(e) => setSiEmail(e.target.value)}
                      placeholder="you@college.edu"
                      className="w-full bg-white dark:bg-[#090A0D] border border-slate-300 dark:border-zinc-800 focus:border-blue-500 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={siShowPw ? "text" : "password"}
                      required
                      value={siPassword}
                      onChange={(e) => setSiPassword(e.target.value)}
                      placeholder="Your password"
                      className="w-full bg-white dark:bg-[#090A0D] border border-slate-300 dark:border-zinc-800 focus:border-blue-500 rounded-xl pl-8 pr-10 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setSiShowPw(!siShowPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                    >
                      {siShowPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in…
                    </span>
                  ) : (
                    <>Sign In <ArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(true);
                      setFpStep(1);
                      setFpEmail(siEmail);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>
            )}

            {/* ─────────────── FORGOT PASSWORD FLOW ─────────────── */}
            {forgotMode && tab === "signin" && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(false);
                    setFpStep(1);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to Sign In
                </button>

                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                    <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Reset Password</h2>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                      {fpStep === 1 ? "Step 1 — Enter your email" : "Step 2 — Enter code & new password"}
                    </p>
                  </div>
                </div>

                {/* Step indicator */}
                <div className="flex gap-2">
                  <div className={`h-1 flex-1 rounded-full transition-all ${fpStep >= 1 ? 'bg-amber-500' : 'bg-slate-200 dark:bg-zinc-800'}`} />
                  <div className={`h-1 flex-1 rounded-full transition-all ${fpStep >= 2 ? 'bg-amber-500' : 'bg-slate-200 dark:bg-zinc-800'}`} />
                </div>

                {fpStep === 1 && (
                  <form onSubmit={handleForgotRequest} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={fpEmail}
                          onChange={(e) => setFpEmail(e.target.value)}
                          placeholder="you@college.edu"
                          className="w-full bg-white dark:bg-[#090A0D] border border-slate-300 dark:border-zinc-800 focus:border-amber-500 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition shadow-xs"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-600/25"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending code…
                        </span>
                      ) : (
                        <>Send Reset Code <ArrowRight className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  </form>
                )}

                {fpStep === 2 && (
                  <form onSubmit={handleResetPassword} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        6-Digit Reset Code
                      </label>
                      <div className="relative">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          inputMode="numeric"
                          value={fpOtp}
                          onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="Enter 6-digit code"
                          className="w-full bg-white dark:bg-[#090A0D] border border-slate-300 dark:border-zinc-800 focus:border-amber-500 rounded-xl pl-8 pr-4 py-2.5 text-center text-lg font-mono font-bold tracking-[0.3em] text-amber-600 dark:text-amber-400 placeholder-slate-300 dark:placeholder-zinc-700 focus:outline-none transition shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={fpShowPw ? "text" : "password"}
                          required
                          minLength={6}
                          value={fpNewPw}
                          onChange={(e) => setFpNewPw(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full bg-white dark:bg-[#090A0D] border border-slate-300 dark:border-zinc-800 focus:border-amber-500 rounded-xl pl-8 pr-10 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setFpShowPw(!fpShowPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                        >
                          {fpShowPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={fpShowPw ? "text" : "password"}
                          required
                          minLength={6}
                          value={fpConfirmPw}
                          onChange={(e) => setFpConfirmPw(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full bg-white dark:bg-[#090A0D] border border-slate-300 dark:border-zinc-800 focus:border-amber-500 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition shadow-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || fpOtp.length !== 6}
                      className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-600/25"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Resetting…
                        </span>
                      ) : (
                        <>Reset Password <KeyRound className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ─────────────── REGISTER FORM ─────────────── */}
            {tab === "register" && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Name + Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text" required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Yogya Jain"
                        className="w-full bg-white dark:bg-[#090A0D] border border-slate-300 dark:border-zinc-800 focus:border-blue-500 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition shadow-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email" required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@college.edu"
                        className="w-full bg-white dark:bg-[#090A0D] border border-slate-300 dark:border-zinc-800 focus:border-blue-500 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Password + Enrollment row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={regShowPw ? "text" : "password"} required minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="w-full bg-white dark:bg-[#090A0D] border border-slate-300 dark:border-zinc-800 focus:border-blue-500 rounded-xl pl-8 pr-9 py-2.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setRegShowPw(!regShowPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                      >
                        {regShowPw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Enrollment No.</label>
                    <div className="relative">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={regEnrollment}
                        onChange={(e) => setRegEnrollment(e.target.value)}
                        placeholder="02315602722"
                        className="w-full bg-white dark:bg-[#090A0D] border border-slate-300 dark:border-zinc-800 focus:border-blue-500 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition shadow-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Branch + Section */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Branch</label>
                    <div className="relative">
                      <select
                        value={regBranch}
                        onChange={(e) => setRegBranch(e.target.value)}
                        className="w-full appearance-none bg-white dark:bg-[#090A0D] border border-slate-300 dark:border-zinc-800 focus:border-blue-500 rounded-xl px-3 pr-7 py-2.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none transition shadow-xs"
                      >
                        {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Section</label>
                    <div className="relative">
                      <select
                        value={regSection}
                        onChange={(e) => setRegSection(e.target.value)}
                        className="w-full appearance-none bg-white dark:bg-[#090A0D] border border-slate-300 dark:border-zinc-800 focus:border-blue-500 rounded-xl px-3 pr-7 py-2.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none transition shadow-xs"
                      >
                        {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Department — colorful card picker */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">Department</label>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-blue-600 dark:text-cyan-400">SELECT ONE</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {DEPARTMENTS.map((dept) => {
                      const isSelected = regDept === dept.name;
                      return (
                        <button
                          key={dept.key}
                          type="button"
                          onClick={() => setRegDept(dept.name)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center ${
                            isSelected
                              ? "border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 shadow-xs"
                              : "bg-slate-50 dark:bg-[#090A0D] border-slate-200 dark:border-zinc-800/90 hover:border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          <span
                            className="text-sm font-bold font-mono"
                            style={{ color: isSelected ? dept.color : "#64748B" }}
                          >
                            {dept.key}
                          </span>
                          <span
                            className="text-[8px] font-mono tracking-tight uppercase truncate mt-0.5 w-full text-center font-semibold"
                            style={{ color: isSelected ? dept.color : "#64748B" }}
                          >
                            {dept.name.split(" ")[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/25"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account…
                    </span>
                  ) : (
                    <>Create Account & Sign In <ArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </form>
            )}

            {/* ── Access Code Tab ── */}
            {tab === "code" && (
              <form onSubmit={handleCodeLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Access Code
                  </label>
                  <div className="relative group">
                    <ShieldCheck className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-3.5 transition-colors group-focus-within:text-blue-500" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      inputMode="numeric"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 6-digit Code"
                      className="w-full bg-white dark:bg-[#090A0D] border border-slate-300 dark:border-zinc-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-center text-lg font-mono font-bold tracking-[0.3em] text-blue-600 dark:text-blue-400 placeholder-slate-300 dark:placeholder-zinc-700 focus:outline-none transition shadow-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || accessCode.length !== 6}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 active:scale-[0.98]"
                >
                  <span>{loading ? "Verifying..." : "Access Cohort"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* ── Footer ── */}
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800/70 flex flex-col items-center space-y-2">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-red-400 transition group py-1 font-semibold"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 group-hover:animate-ping" />
                <span>Admin Authority</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Encrypted Session · Deterministic Scoring Audit Ledger</span>
              </div>
            </div>
          </div>
        </PrismaticGlassCard>
      </div>
    </div>
  );
}
