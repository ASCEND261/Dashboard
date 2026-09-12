"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { FileText, ShieldCheck, Filter, Clock, User, Layers, Search } from "lucide-react";

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
        return "bg-emerald-950 text-emerald-400 border-emerald-800";
      case "REJECTED":
        return "bg-red-950 text-red-400 border-red-800";
      case "NEEDS_MORE_PROOF_REQUESTED":
        return "bg-amber-950 text-amber-400 border-amber-800";
      case "SYNC_EXECUTED":
        return "bg-zinc-800 text-zinc-200 border-zinc-700";
      case "RULE_CREATED":
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
      default:
        return "bg-white/5 text-[#C4C4D4] border-white/8";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
            SYSTEM IMMUTABILITY & AUDITABILITY
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Cryptographic Audit Trail</span>
          </h1>
          <p className="text-xs text-[#8B8B9A] mt-1">
            Append-only chronological log of all claims, proof analyses, reviews, and point calculations.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-800 border border-zinc-800 text-xs text-zinc-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Append-Only Ledger Active</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="ascend-panel p-4 flex items-center justify-between gap-4">
        <div className="text-xs text-[#8B8B9A] font-mono">
          Showing {filteredLogs.length} audit records
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#5E5E6E] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, action, or actor..."
            className="w-full bg-[#11111D] border border-white/10 rounded-xl pl-8 pr-4 py-2 text-xs text-white placeholder-[#5E5E6E] focus:outline-none focus:border-zinc-700"
          />
        </div>
      </div>

      {/* Audit Timeline */}
      <div className="ascend-panel overflow-hidden">
        <div className="divide-y divide-white/6">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 sm:p-5 hover:bg-white/2 transition flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>

              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase border ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">{log.entity_id}</span>
                  <span className="text-[10px] text-[#8B8B9A] font-mono">
                    Entity: {log.entity_type}
                  </span>
                </div>

                <div className="text-xs text-[#C4C4D4] flex items-center gap-2">
                  <span>Actor: <strong className="text-white">{log.actor_name}</strong></span>
                  <span className="text-white/20">•</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-[#8B8B9A]">
                    {log.actor_role}
                  </span>
                </div>

                {log.details && Object.keys(log.details).length > 0 && (
                  <pre className="p-2.5 rounded-lg bg-[#07070C] border border-white/6 text-[10px] font-mono text-[#8B8B9A] overflow-x-auto mt-2">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>

              <div className="text-[10px] text-[#8B8B9A] font-mono shrink-0">
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
