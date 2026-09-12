"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Sidebar from "@/components/sidebar";
import { ShieldAlert, ArrowRight } from "lucide-react";

export default function CoreLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const roleUpper = (user?.role || "").toUpperCase();
  const isAuthorized = roleUpper === "CORE_MEMBER" || roleUpper === "ADMIN" || roleUpper === "SUPER_ADMIN";

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="text-xs font-mono text-zinc-400 animate-pulse flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>Validating Core Member Session & Cryptographic Permissions...</span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full ascend-panel p-8 text-center space-y-4 border-red-500/30">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">403 — Unauthorized Core Workspace</h2>
          <p className="text-xs text-slate-600 dark:text-[#8B8B9A] leading-relaxed">
            The Core Verification Center and deterministic rules controls are restricted to verified Core Members and Administrators. Backend API authorization is strictly enforced.
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
              Return to Member Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex w-full">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
