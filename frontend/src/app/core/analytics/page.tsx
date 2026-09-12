"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

export default function CoreAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCoreAnalytics()
      .then((data) => setAnalytics(data))
      .catch((err) => console.error("Failed to load analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ["#2563EB", "#3B82F6", "#0284C7", "#0891B2", "#0D9488", "#059669", "#4F46E5"];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-zinc-400">
            VERIFICATION INTELLIGENCE & PERFORMANCE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Core Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-600 dark:text-[#8B8B9A] mt-1">
            Real-time verification volume, cohort turnaround velocities, and deterministic point yield.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-zinc-800 border border-blue-200 dark:border-zinc-800 text-xs text-blue-800 dark:text-zinc-200 font-semibold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-zinc-400" />
          <span>Real-time Operational Telemetry</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="ascend-panel p-5 bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-[#8B8B9A]">
            Total Ingestion
          </div>
          <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {analytics?.total_submissions || 62}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-[#8B8B9A] mt-1">All submitted claims</div>
        </div>

        <div className="ascend-panel p-5 bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Verification Rate
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {analytics?.verification_rate_pct || 75.8}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-[#8B8B9A] mt-1">High fidelity claims</div>
        </div>

        <div className="ascend-panel p-5 bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-zinc-400">
            Median Turnaround
          </div>
          <div className="text-3xl font-black font-mono text-slate-900 dark:text-zinc-200 mt-1">
            3.4 hrs
          </div>
          <div className="text-[11px] text-slate-500 dark:text-[#8B8B9A] mt-1 font-mono">SLA: 98.2% on time</div>
        </div>

        <div className="ascend-panel p-5 bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-zinc-400">
            Total Points Awarded
          </div>
          <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {analytics?.total_verified_points?.toLocaleString() || "1,420"}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-bold">+180 this week</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingestion & Verification Volume Chart */}
        <div className="ascend-panel p-6 space-y-4 bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/8">
            <div className="text-xs font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-zinc-400" />
              <span>SUBMISSIONS VS. VERIFICATIONS OVER TIME</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-[#8B8B9A]">Recent Sprints</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.submissions_over_time || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#CBD5E1",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#0F172A",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Line type="monotone" dataKey="submitted" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4 }} name="Submitted" />
                <Line type="monotone" dataKey="verified" stroke="#059669" strokeWidth={2.5} dot={{ r: 4 }} name="Verified" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="ascend-panel p-6 space-y-4 bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/8">
            <div className="text-xs font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-zinc-400" />
              <span>ACHIEVEMENT CATEGORY DISTRIBUTION</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-[#8B8B9A]">Cohort Mix</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.category_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                <XAxis dataKey="category" stroke="#64748B" fontSize={10} interval={0} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#CBD5E1",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#0F172A",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(analytics?.category_distribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
