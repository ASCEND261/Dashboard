"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Scale, CheckCircle2, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function PointRulesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [rules, setRules] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState("2026-v1");
  const [loading, setLoading] = useState(true);

  // Add rule modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    category_slug: "hackathon",
    condition_key: "result",
    condition_val: "",
    points: 50,
    description: "",
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getRules(selectedVersion), api.getRuleVersions()])
      .then(([rulesData, versData]) => {
        setRules(rulesData);
        setVersions(versData);
      })
      .catch((err) => console.error("Failed to load rules:", err))
      .finally(() => setLoading(false));
  }, [selectedVersion]);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRule({
        ...newRule,
        version_id: selectedVersion,
      });
      setAddModalOpen(false);
      setNewRule({
        category_slug: "hackathon",
        condition_key: "result",
        condition_val: "",
        points: 50,
        description: "",
      });
      const updated = await api.getRules(selectedVersion);
      setRules(updated);
    } catch (err: any) {
      alert("Error adding rule: " + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-zinc-400">
            DETERMINISTIC POINT ENGINE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Official Point Rules Explorer</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-[#8B8B9A] mt-1">
            Zero point fabrication. All points are derived strictly from configured official cohort rulebooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Version Selector */}
          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="bg-white dark:bg-[#11111D] border border-slate-300 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono font-semibold shadow-xs"
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.id})
              </option>
            ))}
          </select>

          {isAdmin && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rule</span>
            </button>
          )}
        </div>
      </div>

      {/* Fairness & Traceability Explainer Card */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/8 text-xs flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-zinc-400 border border-blue-200 dark:border-zinc-800">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white">Deterministic Execution Flow</div>
            <div className="text-[11px] text-slate-500 dark:text-[#8B8B9A] mt-0.5 font-mono">
              Claim Metadata → Match Condition → Versioned Rule ID → Immutable Point Calculation Record
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Auditable by Core</span>
        </div>
      </div>

      {/* Rules Table */}
      <div className="ascend-panel overflow-hidden bg-white dark:bg-[#0D0F12] border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-[#11111D] text-slate-600 dark:text-[#8B8B9A] font-mono uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">Rule ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Condition / Result Tier</th>
                <th className="py-3 px-4">Points</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/6 font-sans">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/80 dark:hover:bg-white/2 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-600 dark:text-zinc-400">{rule.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white uppercase text-[11px]">{rule.category_slug}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-zinc-200 font-medium">
                    {rule.condition_key} = <span className="font-bold">{rule.condition_val}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    +{rule.points} PTS
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-[#8B8B9A] max-w-sm">{rule.description}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800 font-bold">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Rule Modal (Admin only) */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0C0C14] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Configure New Point Rule</h3>
            <form onSubmit={handleCreateRule} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-white mb-1">Category Slug</label>
                <input
                  type="text"
                  required
                  value={newRule.category_slug}
                  onChange={(e) => setNewRule({ ...newRule, category_slug: e.target.value })}
                  placeholder="e.g. hackathon"
                  className="w-full bg-slate-50 dark:bg-[#131320] border border-slate-300 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-white mb-1">Condition Value</label>
                <input
                  type="text"
                  required
                  value={newRule.condition_val}
                  onChange={(e) => setNewRule({ ...newRule, condition_val: e.target.value })}
                  placeholder="e.g. Grand Prize"
                  className="w-full bg-slate-50 dark:bg-[#131320] border border-slate-300 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-white mb-1">Points</label>
                <input
                  type="number"
                  required
                  value={newRule.points}
                  onChange={(e) => setNewRule({ ...newRule, points: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-[#131320] border border-slate-300 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-white mb-1">Description</label>
                <input
                  type="text"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="e.g. Awarded for top rank..."
                  className="w-full bg-slate-50 dark:bg-[#131320] border border-slate-300 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 dark:text-[#8B8B9A] dark:hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
