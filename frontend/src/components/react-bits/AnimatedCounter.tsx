"use client";

import React, { useEffect, useState } from "react";

export default function AnimatedCounter({
  value,
  duration = 800,
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const frameRate = 30;
    const totalFrames = Math.max(1, Math.round(duration / (1000 / frameRate)));
    let currentFrame = 0;

    const timer = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      // easeOutExpo
      const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (end - start) * easeOutProgress);
      setDisplayValue(current);

      if (currentFrame >= totalFrames) {
        clearInterval(timer);
        setDisplayValue(end);
      }
    }, 1000 / frameRate);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span className={`font-mono ${className}`}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}
