"use client";

import React from "react";

interface AscendLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
  animated?: boolean;
}

export default function AscendLogo({
  size = "md",
  showText = true,
  showSubtitle = false,
  className = "",
  animated = true,
}: AscendLogoProps) {
  const dimensions = {
    xs: { container: "w-7 h-7", text: "text-xs font-bold", sub: "text-[8px]", iconPad: "p-0.5" },
    sm: { container: "w-9 h-9", text: "text-sm font-bold", sub: "text-[9px]", iconPad: "p-1" },
    md: { container: "w-12 h-12", text: "text-base font-bold", sub: "text-[10px]", iconPad: "p-1.5" },
    lg: { container: "w-14 h-14", text: "text-xl font-extrabold", sub: "text-[11px]", iconPad: "p-2" },
    xl: { container: "w-20 h-20", text: "text-2xl font-black", sub: "text-xs", iconPad: "p-2.5" },
  }[size] || { container: "w-12 h-12", text: "text-base font-bold", sub: "text-[10px]", iconPad: "p-1.5" };

  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* Animated Logo Container */}
      <div className={`relative ${dimensions.container} shrink-0 ${animated ? "animate-[float-gentle_5s_ease-in-out_infinite]" : ""}`}>
        {/* Animated Radial / Conic Ambient Glow */}
        {animated && (
          <div
            className="absolute -inset-1 rounded-xl opacity-60 group-hover:opacity-100 blur-[8px] transition-opacity duration-500 animate-pulse pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(96, 165, 250, 0.45) 0%, rgba(59, 130, 246, 0.15) 60%, transparent 80%)",
            }}
          />
        )}

        {/* Rotating Chromatic Edge Halo */}
        {animated && (
          <div className="absolute -inset-[1.5px] rounded-xl overflow-hidden pointer-events-none">
            <div
              className="absolute -inset-[150%] animate-[laser-sweep_7s_linear_infinite]"
              style={{
                background: "conic-gradient(from 0deg, transparent 0deg, rgba(96, 165, 250, 0.7) 60deg, transparent 120deg, rgba(147, 197, 253, 0.6) 240deg, transparent 360deg)",
              }}
            />
          </div>
        )}

        {/* Outer Glass Card Housing */}
        <div className="relative w-full h-full rounded-xl bg-white dark:bg-[#090B10]/95 border border-slate-200 dark:border-blue-500/25 p-1 flex items-center justify-center shadow-md dark:shadow-lg dark:shadow-blue-950/40 backdrop-blur-md overflow-hidden group-hover:border-blue-500/50 transition-all duration-300">
          {/* Top Specular Sheen */}
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-xl" />

          {/* Actual New Logo Artwork (Preserves exact floating, glow & halo animations) */}
          <img
            src="/logo.png"
            alt="ASCEND"
            className="w-full h-full object-cover rounded-lg relative z-10 filter drop-shadow-[0_2px_8px_rgba(96,165,250,0.3)] transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>

      {/* Brand Text - 100% Solid & Visible in both Light and Dark modes */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-mono tracking-widest font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${dimensions.text}`}>
            ASCEND
          </span>
          {showSubtitle && (
            <span className={`font-mono text-slate-600 dark:text-zinc-400 tracking-wider mt-0.5 flex items-center gap-1 font-bold ${dimensions.sub}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse shrink-0"></span>
              <span>TECH SPRINT 2026</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
