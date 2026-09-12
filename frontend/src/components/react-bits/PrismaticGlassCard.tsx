"use client";

import React, { useRef, useState } from "react";

interface PrismaticGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  enableTilt?: boolean;
}

export default function PrismaticGlassCard({
  children,
  className = "",
  glowColor = "rgba(59, 130, 246, 0.25)",
  enableTilt = true,
  ...props
}: PrismaticGlassCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, normX: 0, normY: 0, isHovered: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = (x / rect.width - 0.5) * 2;
    const normY = (y / rect.height - 0.5) * 2;
    setMousePos({ x, y, normX, normY, isHovered: true });
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, isHovered: false, normX: 0, normY: 0 }));
  };

  const tiltStyle = enableTilt && mousePos.isHovered
    ? {
        transform: `perspective(1000px) rotateX(${-mousePos.normY * 4}deg) rotateY(${mousePos.normX * 4}deg) translateY(-2px)`,
        transition: "transform 0.1s ease-out",
      }
    : {
        transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)",
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className={`group relative rounded-2xl p-[1px] overflow-hidden transition-all duration-300 ${className}`}
      {...props}
    >
      {/* 1. Chromatic Prismatic Refraction Border Glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: mousePos.isHovered
            ? `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.4), rgba(147, 197, 253, 0.3), rgba(219, 234, 254, 0.2), transparent 70%)`
            : "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(203,213,225,0.4) 50%, rgba(59,130,246,0.08) 100%)",
        }}
      />

      {/* 2. Glass Surface Body */}
      <div className="prismatic-glass-body relative w-full h-full rounded-[15px] bg-white/95 dark:bg-[#0A0C10]/85 backdrop-blur-2xl border border-slate-200/90 dark:border-white/[0.06] p-6 text-slate-900 dark:text-zinc-100 overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-2xl transition-colors duration-200">
        {/* Top Edge Specular Reflection Sheen */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 dark:via-white/30 to-transparent pointer-events-none" />

        {/* Dynamic Spotlight Glare follows cursor */}
        {mousePos.isHovered && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-25"
            style={{
              background: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.15), rgba(147, 197, 253, 0.08), transparent 70%)`,
            }}
          />
        )}

        {/* Card Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

export { PrismaticGlassCard };

