"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Key, Copy, Check, ShieldCheck, Zap } from "lucide-react";

export default function AccessCodeBadge() {
  const [code, setCode] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCode = async () => {
    setLoading(true);
    try {
      const res = await api.getMyAccessCode();
      setCode(res.access_code);
    } catch (err) {
      console.error("Failed to load access code:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !code) {
      fetchCode();
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Access Code"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-white dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500/40 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition shadow-xs group"
      >
        <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:scale-110 transition-transform">⌁</span>
        <span className="tracking-wider">CODE</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-[#0E1015] border border-slate-200 dark:border-zinc-800 shadow-xl dark:shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Key className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">Quick Access Code</h4>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">Instant sign-in credential</p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 font-bold">
                ACTIVE
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-[#08090C] border border-slate-200 dark:border-zinc-800/90 rounded-lg p-3 text-center space-y-1">
              <div className="text-[10px] uppercase font-mono tracking-widest text-slate-500 dark:text-zinc-400 font-semibold">
                6-Digit Access Code
              </div>
              <div className="text-2xl font-mono font-bold tracking-[0.25em] text-blue-600 dark:text-blue-400">
                {loading ? "••••••" : code || "••••••"}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={loading || !code}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 hover:text-slate-950 dark:hover:text-white text-xs font-semibold transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                  <span>Copy Access Code</span>
                </>
              )}
            </button>

            <div className="text-[10px] text-slate-500 dark:text-zinc-400 leading-relaxed flex items-start gap-1.5 pt-1 border-t border-slate-200 dark:border-zinc-800/60 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span>Use this code on the login screen to enter directly without waiting for an email OTP.</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
