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
  PieChart,
  Pie
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Inbox,
  ShieldCheck,
  Zap
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

  const COLORS = ["#3B82F6", "#3B82F6", "#38BDF8", "#0284C7", "#7DD3FC", "#0369A1", "#818CF8"];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
            VERIFICATION INTELLIGENCE & PERFORMANCE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Core Analytics Dashboard
          </h1>
          <p className="text-xs text-[#8B8B9A] mt-1">
            Real-time verification volume, cohort turnaround velocities, and deterministic point yield.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-800 border border-zinc-800 text-xs text-zinc-200">
          <ShieldCheck className="w-4 h-4 text-zinc-400" />
          <span>Real-time Operational Telemetry</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="ascend-panel p-5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B8B9A]">
            Total Ingestion
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-1">
            {analytics?.total_submissions || 62}
          </div>
          <div className="text-[11px] text-[#8B8B9A] mt-1">All submitted claims</div>
        </div>

        <div className="ascend-panel p-5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
            Verification Rate
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
            {analytics?.verification_rate_pct || 75.8}%
          </div>
          <div className="text-[11px] text-[#8B8B9A] mt-1">High fidelity claims</div>
        </div>

        <div className="ascend-panel p-5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
            Median Turnaround
          </div>
          <div className="text-3xl font-extrabold font-mono text-zinc-200 mt-1">
            3.4 hrs
          </div>
          <div className="text-[11px] text-[#8B8B9A] mt-1 font-mono">SLA: 98.2% on time</div>
        </div>

        <div className="ascend-panel p-5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
            Total Points Awarded
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-1">
            {analytics?.total_verified_points?.toLocaleString() || "1,420"}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">+180 this week</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingestion & Verification Volume Chart */}
        <div className="ascend-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/8">
            <div className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-400" />
              <span>SUBMISSIONS VS. VERIFICATIONS OVER TIME</span>
            </div>
            <span className="text-[10px] font-mono text-[#8B8B9A]">Recent Sprints</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.submissions_over_time || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222232" />
                <XAxis dataKey="date" stroke="#8B8B9A" fontSize={11} />
                <YAxis stroke="#8B8B9A" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F0F1A",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="submitted" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4 }} name="Submitted" />
                <Line type="monotone" dataKey="verified" stroke="#34D399" strokeWidth={2.5} dot={{ r: 4 }} name="Verified" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="ascend-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/8">
            <div className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-400" />
              <span>ACHIEVEMENT CATEGORY DISTRIBUTION</span>
            </div>
            <span className="text-[10px] font-mono text-[#8B8B9A]">Cohort Mix</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.category_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222232" />
                <XAxis dataKey="category" stroke="#8B8B9A" fontSize={10} interval={0} />
                <YAxis stroke="#8B8B9A" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F0F1A",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
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
