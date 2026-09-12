"use client";

import React from "react";
import { motion } from "framer-motion";

interface AnimatedProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  metricLabel?: string;
  variant?: "blue" | "emerald";
  height?: string;
  showPercent?: boolean;
  className?: string;
}

export default function AnimatedProgressBar({
  value,
  max = 100,
  label,
  metricLabel,
  variant = "blue",
  height = "h-2",
  showPercent = true,
  className = "",
}: AnimatedProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const gradientClass =
    variant === "emerald"
      ? "bg-emerald-500"
      : "bg-blue-600";

  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || showPercent || metricLabel) && (
        <div className="flex items-center justify-between text-xs font-mono">
          {label && <span className="text-zinc-400 font-medium">{label}</span>}
          <div className="flex items-center gap-1.5 ml-auto">
            {metricLabel && <span className="text-zinc-300 font-medium">{metricLabel}</span>}
            {showPercent && (
              <span className={`font-semibold ${variant === "emerald" ? "text-emerald-400" : "text-zinc-200"}`}>
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        </div>
      )}

      <div className={`w-full ${height} rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden p-0.5`}>
        <motion.div
          className={`h-full rounded-full ${gradientClass}`}
          initial={{ width: "0%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
