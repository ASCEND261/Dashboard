"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck,
  AlertCircle, CheckCircle2, BookOpen, ChevronDown, Sparkles
} from "lucide-react";
import AscendLogo from "@/components/ascend-logo";
import PrismaticGlassCard from "@/components/react-bits/PrismaticGlassCard";
import BorderBeam from "@/components/react-bits/BorderBeam";
import GradientText from "@/components/react-bits/GradientText";
import Meteors from "@/components/react-bits/Meteors";

const DEPARTMENTS = [
  { key: "T", name: "TECHNICAL",  color: "#3B82F6" },
  { key: "E", name: "EVENT MGT", color: "#8B5CF6" },
  { key: "R", name: "R&D",        color: "#06B6D4" },
  { key: "S", name: "SOCIAL",     color: "#10B981" },
  { key: "D", name: "DESIGN",     color: "#F59E0B" },
  { key: "P", name: "PR",         color: "#EF4444" },
];

const BRANCHES = ["CSE", "AI&ML", "AI&DS", "VLSI", "CS-CYBER", "CSAM"];
const SECTIONS = ["A", "B", "C"];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [tab, setTab] = useState<"signin" | "register">("signin");

  // Sign In
  const [siEmail, setSiEmail]       = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siShowPw, setSiShowPw]     = useState(false);

  // Register
  const [regName, setRegName]             = useState("");
  const [regEmail, setRegEmail]           = useState("");
  const [regPassword, setRegPassword]     = useState("");
  const [regShowPw, setRegShowPw]         = useState(false);
  const [regEnrollment, setRegEnrollment] = useState("");
  const [regBranch, setRegBranch]         = useState("CSE");
  const [regSection, setRegSection]       = useState("A");
  const [regDept, setRegDept]             = useState("TECHNICAL");

  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      <Meteors number={18} />

      <div className="w-full max-w-md relative z-10">
        <PrismaticGlassCard className="shadow-2xl">
          <BorderBeam size={280} duration={7} colorFrom="#60A5FA" colorTo="#C084FC" />

          <div className="space-y-5">
            {/* ── Brand Header ── */}
            <div className="text-center flex flex-col items-center space-y-2">
              <AscendLogo size="lg" showSubtitle={true} />
              <h1 className="text-base font-bold text-white tracking-wide pt-1">
                <GradientText colors={["#60A5FA", "#FFFFFF", "#C084FC", "#60A5FA"]}>
                  Member Authentication Gate
                </GradientText>
              </h1>
              <p className="text-[11px] text-zinc-400 font-mono">
                Verifiable identity · Authorized cohort access
              </p>
            </div>

            {/* ── Tab Switcher ── */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#090A0D] border border-zinc-800/80">
              <button
                type="button"
                onClick={() => { setTab("signin"); setError(null); setSuccess(null); }}
                className={`py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  tab === "signin"
                    ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/50"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab("register"); setError(null); setSuccess(null); }}
                className={`py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  tab === "register"
                    ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Create Account
              </button>
            </div>

            {/* ── Alerts ── */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/30 border border-red-800/50 text-xs text-red-300">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-xs text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            {/* ─────────────── SIGN IN FORM ─────────────── */}
            {tab === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={siEmail}
                      onChange={(e) => setSiEmail(e.target.value)}
                      placeholder="you@college.edu"
                      className="w-full bg-[#090A0D] border border-zinc-800 focus:border-blue-500 rounded-xl pl-8 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={siShowPw ? "text" : "password"}
                      required
                      value={siPassword}
                      onChange={(e) => setSiPassword(e.target.value)}
                      placeholder="Your password"
                      className="w-full bg-[#090A0D] border border-zinc-800 focus:border-blue-500 rounded-xl pl-8 pr-10 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setSiShowPw(!siShowPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {siShowPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 mt-2"
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
              </form>
            )}

            {/* ─────────────── REGISTER FORM ─────────────── */}
            {tab === "register" && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Name + Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text" required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Yogya Jain"
                        className="w-full bg-[#090A0D] border border-zinc-800 focus:border-blue-500 rounded-xl pl-8 pr-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition shadow-inner"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email" required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@college.edu"
                        className="w-full bg-[#090A0D] border border-zinc-800 focus:border-blue-500 rounded-xl pl-8 pr-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {/* Password + Enrollment row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={regShowPw ? "text" : "password"} required minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="w-full bg-[#090A0D] border border-zinc-800 focus:border-blue-500 rounded-xl pl-8 pr-9 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setRegShowPw(!regShowPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {regShowPw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">Enrollment No.</label>
                    <div className="relative">
                      <BookOpen className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={regEnrollment}
                        onChange={(e) => setRegEnrollment(e.target.value)}
                        placeholder="02315602722"
                        className="w-full bg-[#090A0D] border border-zinc-800 focus:border-blue-500 rounded-xl pl-8 pr-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition shadow-inner font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Branch + Section */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">Branch</label>
                    <div className="relative">
                      <select
                        value={regBranch}
                        onChange={(e) => setRegBranch(e.target.value)}
                        className="w-full appearance-none bg-[#090A0D] border border-zinc-800 focus:border-blue-500 rounded-xl px-3 pr-7 py-2.5 text-xs text-zinc-100 focus:outline-none transition"
                      >
                        {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">Section</label>
                    <div className="relative">
                      <select
                        value={regSection}
                        onChange={(e) => setRegSection(e.target.value)}
                        className="w-full appearance-none bg-[#090A0D] border border-zinc-800 focus:border-blue-500 rounded-xl px-3 pr-7 py-2.5 text-xs text-zinc-100 focus:outline-none transition"
                      >
                        {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
                      </select>
                      <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Department — colorful card picker */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-zinc-300">Department</label>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400">SELECT ONE</span>
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
                            isSelected ? "shadow-sm" : "bg-[#090A0D] border-zinc-800/90 hover:border-zinc-700"
                          }`}
                          style={isSelected ? {
                            background: `${dept.color}18`,
                            borderColor: `${dept.color}55`,
                            boxShadow: `0 0 14px ${dept.color}20`,
                          } : {}}
                        >
                          <span
                            className="text-sm font-bold font-mono"
                            style={{ color: isSelected ? dept.color : "#52525B" }}
                          >
                            {dept.key}
                          </span>
                          <span
                            className="text-[8px] font-mono tracking-tight uppercase truncate mt-0.5 w-full text-center"
                            style={{ color: isSelected ? "#94A3B8" : "#3F3F46" }}
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
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
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

            {/* ── Footer ── */}
            <div className="pt-1 border-t border-zinc-800/70 flex flex-col items-center space-y-2">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-red-400 transition group py-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500/80 group-hover:animate-ping" />
                <span>Administrator or Governance Authority? Admin Portal</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Encrypted Session · Deterministic Scoring Audit Ledger</span>
              </div>
            </div>
          </div>
        </PrismaticGlassCard>
      </div>
    </div>
  );
}
