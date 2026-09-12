"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ArrowRight, ShieldCheck, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import AscendLogo from "@/components/ascend-logo";
import { PrismaticGlassCard } from "@/components/react-bits/PrismaticGlassCard";
import { BorderBeam } from "@/components/react-bits/BorderBeam";
import { Meteors } from "@/components/react-bits/Meteors";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { loginWithOtp } = useAuth();

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If no email provided, redirect to login
  useEffect(() => {
    if (!email) {
      router.replace("/login");
    }
  }, [email, router]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email]);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...digits];
    // If multiple digits pasted
    if (val.length > 1) {
      const pastedChars = val.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedChars[i] || "";
      }
      setDigits(newDigits);
      const nextIndex = Math.min(pastedChars.length, 5);
      inputRefs.current[nextIndex]?.focus();
      if (newDigits.every((d) => d !== "")) {
        handleVerify(newDigits.join(""));
      }
      return;
    }

    newDigits[index] = val.slice(-1);
    setDigits(newDigits);

    // Auto-advance
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all filled
    if (newDigits.every((d) => d !== "")) {
      handleVerify(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const pasted = pasteData.split("");
      setDigits(pasted);
      inputRefs.current[5]?.focus();
      handleVerify(pasteData);
    }
  };

  const handleVerify = async (otpCode: string) => {
    setError(null);
    setLoading(true);
    try {
      const { user, status } = await loginWithOtp(email, otpCode);

      if (status === "PENDING") {
        router.push("/access-pending");
      } else if (user.role === "ADMIN") {
        router.push("/admin");
      } else if (user.role === "CORE_MEMBER") {
        router.push("/core");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid or expired verification code.");
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      await api.requestOtp(email);
      setResendCooldown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend verification code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080A]/60 text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <PrismaticGlassCard className="w-full max-w-md p-6 sm:p-8 relative z-10 space-y-6" glowColor="rgba(96, 165, 250, 0.2)">
        <BorderBeam size={200} duration={8} colorFrom="#60a5fa" colorTo="#3b82f6" />
        <Meteors number={12} />

        {/* Top Back Navigation */}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition font-mono relative z-10"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
          <span>Back to email entry</span>
        </button>

        {/* Brand Header */}
        <div className="text-center flex flex-col items-center space-y-3 relative z-10">
          <AscendLogo size="lg" showSubtitle={true} animated={true} />
          <h1 className="text-xl font-bold text-white tracking-tight pt-1">Enter Verification Code</h1>
          <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
            We sent a 6-digit passcode to{" "}
            <span className="text-blue-400 font-mono font-medium">{email}</span>
          </p>
        </div>

        {/* OTP Input Boxes */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify(digits.join(""));
          }}
          className="space-y-6 relative z-10"
        >
          <div className="flex items-center justify-between gap-1.5 sm:gap-2.5">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                disabled={loading}
                className="w-11 h-13 sm:w-13 sm:h-15 text-center text-lg sm:text-2xl font-mono font-bold bg-[#090A0D]/90 border border-zinc-800 focus:border-blue-500 rounded-xl text-white focus:outline-none transition shadow-inner focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              />
            ))}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || digits.some((d) => d === "")}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.99]"
          >
            {loading ? "Verifying Code..." : "Verify & Ascend"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Resend Actions */}
        <div className="text-center space-y-2 pt-1 border-t border-zinc-800/80 relative z-10">
          <p className="text-xs text-zinc-400">
            Didn&apos;t receive the code?{" "}
            {resendCooldown > 0 ? (
              <span className="text-zinc-400 font-mono">
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-blue-400 hover:text-blue-300 font-medium transition inline-flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                <span>Resend Code</span>
              </button>
            )}
          </p>

          <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Passcode expires in 10 minutes</span>
          </div>
        </div>
      </PrismaticGlassCard>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07080A] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
