"use client";

import React, { useEffect, useState } from "react";

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
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const checkLight = () => {
      setIsLight(document.documentElement.classList.contains("light"));
    };
    checkLight();

    const observer = new MutationObserver(checkLight);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // In light theme, map whites to deep high-contrast slate so text never disappears
  const effectiveColors = isLight
    ? colors.map((c) => {
        const lower = c.toLowerCase().trim();
        if (
          lower === "#ffffff" ||
          lower === "#fff" ||
          lower === "#fafafa" ||
          lower === "#f8fafc" ||
          lower === "white"
        ) {
          return "#0f172a";
        }
        return c;
      })
    : colors;

  const gradient = `linear-gradient(90deg, ${effectiveColors.join(", ")})`;

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
