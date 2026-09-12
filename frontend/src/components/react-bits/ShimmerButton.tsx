"use client";

import React from "react";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  className?: string;
}

export default function ShimmerButton({
  children,
  shimmerColor = "#60A5FA",
  shimmerSize = "0.08em",
  borderRadius = "12px",
  shimmerDuration = "2.5s",
  className = "",
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      style={
        {
          "--shimmer-color": shimmerColor,
          "--radius": borderRadius,
          "--speed": shimmerDuration,
          "--cut": shimmerSize,
        } as React.CSSProperties
      }
      className={`group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-5 py-2.5 text-xs font-semibold text-white [background:var(--bg)] [border-radius:var(--radius)] transition-transform duration-200 active:scale-[0.98] ${className}`}
      {...props}
    >
      {/* Spark container */}
      <div className="-z-30 blur-[2px] absolute inset-0 overflow-visible [container-type:size]">
        {/* Rotating Spark */}
        <div
          style={{
            animation: `border-beam var(--speed) linear infinite`,
          }}
          className="absolute inset-0 h-[100cqh] [aspect-ratio:1] [border-radius:0] [mask:none]"
        >
          <div className="absolute inset-[-100%] w-[auto] rotate-0 [background:conic-gradient(from_0deg,transparent_0_340deg,var(--shimmer-color)_360deg)]" />
        </div>
      </div>

      {/* Backdrop Surface */}
      <div className="absolute inset-[1px] -z-20 rounded-[inherit] bg-[#0E1118]/90 backdrop-blur-xl group-hover:bg-[#121620]/95 transition-colors duration-200" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </div>
    </button>
  );
}

export { ShimmerButton };

