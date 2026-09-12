"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ShieldCheck, Search } from "lucide-react";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api.getAuditLogs(60)
      .then((data) => setLogs(data))
      .catch((err) => console.error("Failed to load audit logs:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      log.entity_id?.toLowerCase().includes(s) ||
      log.action?.toLowerCase().includes(s) ||
      log.actor_name?.toLowerCase().includes(s)
    );
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case "VERIFIED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800";
      case "REJECTED":
        return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800";
      case "NEEDS_MORE_PROOF_REQUESTED":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800";
      case "SYNC_EXECUTED":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700";
      case "RULE_CREATED":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-[#C4C4D4] dark:border-white/8";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-zinc-400">
            SYSTEM IMMUTABILITY & AUDITABILITY
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Cryptographic Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-[#8B8B9A] mt-1">
            Append-only chronological log of all claims, proof analyses, reviews, and point calculations.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-zinc-800 border border-emerald-200 dark:border-zinc-800 text-xs text-emerald-800 dark:text-zinc-200 font-semibold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Append-Only Ledger Active</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="ascend-panel p-4 flex items-center justify-between gap-4 bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="text-xs text-slate-500 dark:text-[#8B8B9A] font-mono font-semibold">
          Showing {filteredLogs.length} audit records
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, action, or actor..."
            className="w-full bg-slate-50 dark:bg-[#11111D] border border-slate-300 dark:border-white/10 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition shadow-xs"
          />
        </div>
      </div>

      {/* Audit Timeline */}
      <div className="ascend-panel overflow-hidden bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="divide-y divide-slate-200 dark:divide-white/6">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-white/2 transition flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0"></div>

              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase border ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{log.entity_id}</span>
                  <span className="text-[10px] text-slate-500 dark:text-[#8B8B9A] font-mono">
                    Entity: {log.entity_type}
                  </span>
                </div>

                <div className="text-xs text-slate-700 dark:text-[#C4C4D4] flex items-center gap-2">
                  <span>Actor: <strong className="text-slate-900 dark:text-white">{log.actor_name}</strong></span>
                  <span className="text-slate-300 dark:text-white/20">•</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-[#8B8B9A] font-semibold">
                    {log.actor_role}
                  </span>
                </div>

                {log.details && Object.keys(log.details).length > 0 && (
                  <pre className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#07070C] border border-slate-200 dark:border-white/6 text-[10px] font-mono text-slate-700 dark:text-[#8B8B9A] overflow-x-auto mt-2">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>

              <div className="text-[10px] text-slate-500 dark:text-[#8B8B9A] font-mono shrink-0">
                {new Date(log.timestamp).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
