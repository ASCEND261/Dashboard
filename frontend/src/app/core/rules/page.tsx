"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Scale, CheckCircle2, ShieldCheck, Plus, Sparkles, HelpCircle } from "lucide-react";
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
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
            DETERMINISTIC POINT ENGINE
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Official Point Rules Explorer</span>
          </h1>
          <p className="text-xs text-[#8B8B9A] mt-1">
            Zero point fabrication. All points are derived strictly from configured official cohort rulebooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Version Selector */}
          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="bg-[#11111D] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700 font-mono font-semibold"
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
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rule</span>
            </button>
          )}
        </div>
      </div>

      {/* Fairness & Traceability Explainer Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-900 border border-white/8 text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-zinc-800 text-zinc-400 border border-zinc-800">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white">Deterministic Execution Flow</div>
            <div className="text-[11px] text-[#8B8B9A] mt-0.5 font-mono">
              Claim Metadata → Match Condition → Versioned Rule ID → Immutable Point Calculation Record
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Auditable by Core</span>
        </div>
      </div>

      {/* Rules Table */}
      <div className="ascend-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/8 bg-[#11111D] text-[#8B8B9A] font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Rule ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Condition / Result Tier</th>
                <th className="py-3 px-4">Points</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6 font-sans">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-white/2 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-zinc-400">{rule.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-white uppercase text-[11px]">{rule.category_slug}</td>
                  <td className="py-3.5 px-4 font-mono text-zinc-200 font-medium">
                    {rule.condition_key} = <span className="font-bold">{rule.condition_val}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-emerald-400 text-sm">
                    +{rule.points} PTS
                  </td>
                  <td className="py-3.5 px-4 text-[#8B8B9A] max-w-sm">{rule.description}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#0C0C14] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Configure New Point Rule</h3>
            <form onSubmit={handleCreateRule} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">Category Slug</label>
                <input
                  type="text"
                  required
                  value={newRule.category_slug}
                  onChange={(e) => setNewRule({ ...newRule, category_slug: e.target.value })}
                  placeholder="e.g. hackathon"
                  className="w-full bg-[#131320] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Condition Value</label>
                <input
                  type="text"
                  required
                  value={newRule.condition_val}
                  onChange={(e) => setNewRule({ ...newRule, condition_val: e.target.value })}
                  placeholder="e.g. Grand Prize"
                  className="w-full bg-[#131320] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Points</label>
                <input
                  type="number"
                  required
                  value={newRule.points}
                  onChange={(e) => setNewRule({ ...newRule, points: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#131320] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Description</label>
                <input
                  type="text"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="e.g. Awarded for top rank..."
                  className="w-full bg-[#131320] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#8B8B9A] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
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
