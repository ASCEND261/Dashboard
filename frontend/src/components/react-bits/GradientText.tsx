"use client";

import React from "react";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
}

export default function GradientText({
  children,
  className = "",
  colors = ["#ffffff", "#60a5fa", "#c084fc", "#38bdf8", "#ffffff"],
  animationSpeed = 6,
}: GradientTextProps) {
  const gradient = `linear-gradient(90deg, ${colors.join(", ")})`;

  return (
    <span
      style={{
        backgroundImage: gradient,
        backgroundSize: "300% 100%",
        animation: `prismatic-shift ${animationSpeed}s ease-in-out infinite`,
      }}
      className={`inline-block bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
}

export { GradientText };

