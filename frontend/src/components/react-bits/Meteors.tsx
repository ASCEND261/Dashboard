"use client";

import React, { useEffect, useState } from "react";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export default function Meteors({ number = 20, className = "" }: MeteorsProps) {
  const [meteors, setMeteors] = useState<
    { top: string; left: string; delay: string; duration: string }[]
  >([]);

  useEffect(() => {
    const meteorList = Array.from({ length: number }).map(() => ({
      top: `${Math.floor(Math.random() * 80)}%`,
      left: `${Math.floor(Math.random() * 90)}%`,
      delay: `${(Math.random() * 1.5 + 0.2).toFixed(2)}s`,
      duration: `${(Math.random() * 4 + 3).toFixed(2)}s`,
    }));
    setMeteors(meteorList);
  }, [number]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {meteors.map((m, idx) => (
        <span
          key={idx}
          style={{
            top: m.top,
            left: m.left,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
          className="absolute h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-full bg-blue-300 shadow-[0_0_0_1px_#ffffff10]"
        >
          {/* Meteor Tail */}
          <div className="pointer-events-none absolute top-1/2 -z-10 h-[1px] w-[65px] -translate-y-1/2 bg-gradient-to-r from-blue-400 via-cyan-300 to-transparent" />
        </span>
      ))}
    </div>
  );
}

export { Meteors };

