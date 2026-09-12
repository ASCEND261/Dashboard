"use client";

import React from "react";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

export default function BorderBeam({
  className = "",
  size = 200,
  duration = 10,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = "#60A5FA",
  colorTo = "#C084FC",
  delay = 0,
}: BorderBeamProps) {
  return (
    <div
      style={
        {
          "--size": `${size}px`,
          "--duration": `${duration}s`,
          "--anchor": `${anchor}%`,
          "--border-width": `${borderWidth}px`,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--delay": `-${delay}s`,
        } as React.CSSProperties
      }
      className={`pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(white,white)] ${className}`}
    >
      <div
        style={{
          animation: `border-beam var(--duration) linear infinite`,
          animationDelay: "var(--delay)",
        }}
        className="absolute aspect-square [offset-path:rect(0_auto_auto_0_round_inherit)] [offset-anchor:calc(var(--anchor))_50%] w-[var(--size)] bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent"
      />
    </div>
  );
}

export { BorderBeam };

