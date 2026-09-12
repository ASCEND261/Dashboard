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
    zinc: "bg-zinc-800 text-zinc-300 border-zinc-700",
    blue: "bg-blue-950/40 text-blue-300 border-blue-800/50",
    emerald: "bg-emerald-950/40 text-emerald-400 border-emerald-500/30",
    amber: "bg-amber-950/40 text-amber-300 border-amber-500/30",
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
