"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PageTransition({
  children,
  transitionKey,
  className = "",
}: {
  children: React.ReactNode;
  transitionKey?: string;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
