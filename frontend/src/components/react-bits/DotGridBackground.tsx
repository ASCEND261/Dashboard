"use client";

import React from "react";

export default function DotGridBackground({
  children,
  className = "",
  showGlow = false,
}: {
  children?: React.ReactNode;
  className?: string;
  showGlow?: boolean;
}) {
  return (
    <div className={`relative w-full overflow-hidden bg-slate-50 dark:bg-[#09090B] ${className}`}>
      {/* Subtle Dot Matrix for light and dark */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-40 dark:opacity-20"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          color: "rgba(100, 116, 139, 0.3)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, #000 60%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, #000 60%, transparent 100%)",
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
