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
    <div className={`relative w-full overflow-hidden bg-[#09090B] ${className}`}>
      {/* Subtle Neutral Dot Matrix */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, #000 60%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, #000 60%, transparent 100%)",
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
