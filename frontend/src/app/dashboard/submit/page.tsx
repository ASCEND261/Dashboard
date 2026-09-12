"use client";

import React, { Suspense } from "react";
import DynamicAchievementForm from "@/components/dynamic-achievement-form";
import PrismaticGlassCard from "@/components/react-bits/PrismaticGlassCard";
import BorderBeam from "@/components/react-bits/BorderBeam";
import GradientText from "@/components/react-bits/GradientText";
import Meteors from "@/components/react-bits/Meteors";
import { RefreshCw, Sparkles } from "lucide-react";

function SubmitContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <PrismaticGlassCard className="shadow-2xl">
        <BorderBeam size={220} duration={8} colorFrom="#60A5FA" colorTo="#34D399" />
        <Meteors number={12} />
        <div className="relative z-10">
          <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>OFFICIAL TECH JOURNEY SUBMISSION</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            <GradientText colors={["#FFFFFF", "#60A5FA", "#34D399", "#FFFFFF"]}>
              Submit Achievement Record
            </GradientText>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 max-w-xl">
            Attach structured metadata and certified proof documentation. Submissions are processed by the deterministic scoring engine and queued for Core Member inspection.
          </p>
        </div>
      </PrismaticGlassCard>

      <DynamicAchievementForm />
    </div>
  );
}

export default function SubmitAchievementPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
          <span>Loading submission form...</span>
        </div>
      }
    >
      <SubmitContent />
    </Suspense>
  );
}
