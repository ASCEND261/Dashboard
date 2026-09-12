"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Shield, Clock, CheckCircle2, RefreshCw, ArrowRight, KeyRound, AlertTriangle } from "lucide-react";
import AscendLogo from "@/components/ascend-logo";
import PrismaticGlassCard from "@/components/react-bits/PrismaticGlassCard";
import BorderBeam from "@/components/react-bits/BorderBeam";
import GradientText from "@/components/react-bits/GradientText";
import Meteors from "@/components/react-bits/Meteors";

export default function AccessPendingPage() {
  const router = useRouter();
  const { user, refreshUser, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const res = await api.getAccessStatus();
      setLastChecked(new Date());
      if (res.status === "APPROVED") {
        await refreshUser();
        if (res.role === "ADMIN") {
          router.push("/admin");
        } else if (res.role === "CORE_MEMBER") {
          router.push("/core");
        } else {
          router.push("/dashboard");
        }
      } else if (res.status === "REJECTED") {
        setStatusMessage("Your registration was not approved by the administrator. Contact your team lead.");
      } else {
        setStatusMessage("Status verified: Registration is currently in the administrator review queue.");
      }
    } catch (err: any) {
      console.error("Failed to check status:", err);
    } finally {
      setChecking(false);
    }
  };

  // Background auto-polling every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkStatus();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Meteors */}
      <Meteors number={16} />

      <div className="w-full max-w-lg relative z-10">
        <PrismaticGlassCard className="shadow-2xl">
          <BorderBeam size={240} duration={7} colorFrom="#60A5FA" colorTo="#34D399" />
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center flex flex-col items-center space-y-3">
              <AscendLogo size="lg" showSubtitle={false} />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-medium mt-1">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                ACCESS REQUEST QUEUED
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                <GradientText colors={["#60A5FA", "#FFFFFF", "#34D399", "#60A5FA"]}>
                  Verification is on the way
                </GradientText>
              </h1>
              <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                Your email has been verified. To safeguard team integrity and official scoring, each new account is authorized by an administrator before cohort dashboards are unlocked.
              </p>
            </div>

        {/* 4-Step Timeline */}
        <div className="bg-[#090A0D] border border-zinc-800/80 rounded-xl p-5 space-y-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between pb-2 border-b border-zinc-800/60">
            <span>Access Clearance Pipeline</span>
            <span className="text-blue-400">Step 3 of 4</span>
          </div>

          <div className="space-y-3.5">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-zinc-200">Email Authenticated</div>
                <div className="text-[11px] text-zinc-400">One-time security passcode verified successfully</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-zinc-200">Request Registered in Core Ledger</div>
                <div className="text-[11px] text-zinc-400">Identity payload staged for administrative clearance</div>
              </div>
            </div>

            {/* Step 3 - Current Active */}
            <div className="flex items-start gap-3 relative">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-400 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-blue-500/40">
                <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-blue-300 flex items-center gap-2">
                  <span>Administrator Evaluation</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300">
                    PENDING REVIEW
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Lead evaluators review identity against active sprint rosters
                </div>
              </div>
            </div>

            {/* Step 4 - Final */}
            <div className="flex items-start gap-3 opacity-50">
              <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-zinc-400">Dashboard Clearance & Access Code Issued</div>
                <div className="text-[11px] text-zinc-400">Unlocks submissions, AutoVerify queue, and instant access code</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status notice */}
        {statusMessage && (
          <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-800/40 text-xs text-blue-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={checkStatus}
            disabled={checking}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
            <span>{checking ? "Checking Access Status..." : "Check Status Now"}</span>
          </button>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 font-mono">
            <span>Auto-polling active (every 8s)</span>
            <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-zinc-400 hover:text-zinc-200 transition flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Use 6-Digit Code</span>
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="text-zinc-400 hover:text-zinc-300 transition"
          >
            Switch Account
          </button>
        </div>
          </div>
        </PrismaticGlassCard>
      </div>
    </div>
  );
}
