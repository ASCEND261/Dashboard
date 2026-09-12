"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface InteractiveChipProps {
  label: string;
  sublabel?: string;
  icon?: LucideIcon;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
  className?: string;
}

export default function InteractiveChip({
  label,
  sublabel,
  icon: Icon,
  active = false,
  badge,
  onClick,
  className = "",
}: InteractiveChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`group relative flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-left transition duration-150 border text-xs shadow-xs ${
        active
          ? "bg-blue-50 dark:bg-zinc-800 border-blue-300 dark:border-zinc-700 text-blue-900 dark:text-white font-semibold"
          : "bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-zinc-700 text-slate-800 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white"
      } ${className}`}
    >
      {Icon && (
        <span
          className={`p-1 rounded-md transition duration-150 shrink-0 ${
            active
              ? "bg-blue-100 dark:bg-zinc-800 text-blue-700 dark:text-zinc-200"
              : "bg-slate-100 dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-zinc-200"
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </span>
      )}

      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold truncate text-xs">{label}</span>
          {badge && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-zinc-300 border border-blue-200 dark:border-zinc-700 font-bold shrink-0">
              {badge}
            </span>
          )}
        </div>
        {sublabel && (
          <span className="text-[11px] text-zinc-400 group-hover:text-zinc-300 truncate">
            {sublabel}
          </span>
        )}
      </div>

      {/* Subtle blue indicator dot on hover */}
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0" />
    </motion.button>
  );
}
