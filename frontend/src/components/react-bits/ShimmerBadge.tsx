"use client";

import React from "react";

export default function ShimmerBadge({
  children,
  className = "",
  variant = "zinc",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "zinc" | "blue" | "emerald" | "amber";
}) {
  const variantStyles = {
    zinc: "dark:bg-zinc-800 bg-slate-100 dark:text-zinc-300 text-slate-700 dark:border-zinc-700 border-slate-300",
    blue: "dark:bg-blue-950/40 bg-blue-50 dark:text-blue-300 text-blue-700 dark:border-blue-800/50 border-blue-200",
    emerald: "dark:bg-emerald-950/40 bg-emerald-50 dark:text-emerald-400 text-emerald-700 dark:border-emerald-500/30 border-emerald-200",
    amber: "dark:bg-amber-950/40 bg-amber-50 dark:text-amber-300 text-amber-800 dark:border-amber-500/30 border-amber-200",
  }[variant];

  return (
    <span
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border overflow-hidden ${variantStyles} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-1.5">{children}</span>
      {/* Shimmer sweep */}
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"
        aria-hidden="true"
      />
    </span>
  );
}
