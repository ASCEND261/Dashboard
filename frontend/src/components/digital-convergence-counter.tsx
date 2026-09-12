"use client";

import React, { useEffect, useRef, useState } from "react";

interface DigitalConvergenceCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  digitClassName?: string;
}

export default function DigitalConvergenceCounter({
  value,
  prefix = "",
  suffix = "",
  className = "",
  digitClassName = "",
}: DigitalConvergenceCounterProps) {
  const formattedStr = value.toLocaleString("en-US");
  const [displayedDigits, setDisplayedDigits] = useState<string[]>(formattedStr.split(""));
  const [changedIndices, setChangedIndices] = useState<Set<number>>(new Set());
  const prevStrRef = useRef<string>(formattedStr);

  useEffect(() => {
    const currentStr = value.toLocaleString("en-US");
    const prevStr = prevStrRef.current;

    if (currentStr !== prevStr) {
      const currentChars = currentStr.split("");
      const prevChars = prevStr.split("");
      const changed = new Set<number>();

      // Identify which specific positions changed
      const maxLen = Math.max(currentChars.length, prevChars.length);
      for (let i = 0; i < maxLen; i++) {
        const cChar = currentChars[currentChars.length - 1 - i];
        const pChar = prevChars[prevChars.length - 1 - i];
        if (cChar !== pChar) {
          changed.add(currentChars.length - 1 - i);
        }
      }

      setChangedIndices(changed);
      setDisplayedDigits(currentChars);
      prevStrRef.current = currentStr;

      // Clear the highlight pulse after animation settles
      const timer = setTimeout(() => {
        setChangedIndices(new Set());
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div className={`inline-flex items-center font-mono tracking-tight ${className}`}>
      {prefix && <span className="mr-0.5 opacity-80">{prefix}</span>}
      <div className="inline-flex items-center overflow-hidden">
        {displayedDigits.map((char, index) => {
          const isChanged = changedIndices.has(index);
          const isNumeric = /\d/.test(char);

          return (
            <span
              key={`${index}-${char}`}
              className={`inline-block transition-all duration-500 transform ${
                isChanged && isNumeric
                  ? "animate-in slide-in-from-bottom-2 text-blue-400 font-bold drop-shadow-[0_0_8px_rgba(91,140,255,0.6)]"
                  : "text-inherit"
              } ${digitClassName}`}
            >
              {char}
            </span>
          );
        })}
      </div>
      {suffix && <span className="ml-1 opacity-80 text-xs">{suffix}</span>}
    </div>
  );
}
