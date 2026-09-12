"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  Shield,
  Check,
  X,
  Clock,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  Key,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import AscendLogo from "@/components/ascend-logo";
import AccessCodeBadge from "@/components/access-code-badge";
import PrismaticGlassCard from "@/components/react-bits/PrismaticGlassCard";
import BorderBeam from "@/components/react-bits/BorderBeam";
import GradientText from "@/components/react-bits/GradientText";
import Meteors from "@/components/react-bits/Meteors";

export default function AdminAccessRequestsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getAccessRequests();
      setRequests(data || []);
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to load requests." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("ascend_token") : null;
    if (!token) {
      setLoading(false);
      return;
    }
    fetchRequests();
  }, [authLoading]);

  const handleApprove = async (id: string, email: string) => {
    setActionLoading(id);
    setFeedback(null);
    try {
      await api.approveAccessRequest(id);
      setFeedback({ type: "success", text: `Access granted for ${email}. 6-digit access code issued.` });
      fetchRequests();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Approval failed." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string, email: string) => {
    const reason = window.prompt(`Provide a rejection reason for ${email}:`, "Identity unverified in sprint roster");
    if (reason === null) return;

    setActionLoading(id);
    setFeedback(null);
    try {
      await api.rejectAccessRequest(id, reason);
      setFeedback({ type: "success", text: `Access request for ${email} has been rejected.` });
      fetchRequests();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Rejection failed." });
    } finally {
      setActionLoading(null);
    }
  };

  const roleUpper = (user?.role || "").toUpperCase();
  const isAdmin = roleUpper.includes("ADMIN") || roleUpper.includes("CORE");

  if (!authLoading && !isAdmin) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
        <PrismaticGlassCard className="max-w-md w-full p-8 text-center space-y-4 border-red-500/30">
          <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-800 text-red-400 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Superadmin Access Required</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The candidate access authorization queue is restricted to platform administrators. Please sign in via the Superadmin Governance Terminal.
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push("/admin/login")}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition shadow-lg shadow-red-600/30"
            >
              Sign In to Superadmin Terminal
            </button>
          </div>
        </PrismaticGlassCard>
      </div>
    );
  }

  const filtered = requests.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="min-h-screen bg-transparent text-zinc-100 p-4 sm:p-8 relative overflow-hidden">
      <Meteors number={14} />
      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Top Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(user?.role === "ADMIN" ? "/admin" : "/core")}
              className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  <GradientText colors={["#FFFFFF", "#60A5FA", "#C084FC", "#FFFFFF"]}>
                    Access Control Authorization
                  </GradientText>
                </h1>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  ADMIN QUEUE
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Authorize new registrations before cohort dashboard and AutoVerify access are unlocked
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AccessCodeBadge />
            <button
              type="button"
              onClick={fetchRequests}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between animate-in fade-in duration-150 ${
              feedback.type === "success"
                ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                : "bg-red-950/30 border-red-500/40 text-red-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-[#0D0F14] border border-zinc-800">
            <div className="text-xs font-mono uppercase text-zinc-400">Total Requests</div>
            <div className="text-2xl font-mono font-bold text-white mt-1">{requests.length}</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D0F14] border border-blue-500/30">
            <div className="text-xs font-mono uppercase text-blue-400">Pending Authorization</div>
            <div className="text-2xl font-mono font-bold text-blue-400 mt-1">{pendingCount}</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D0F14] border border-emerald-500/30">
            <div className="text-xs font-mono uppercase text-emerald-400">Approved</div>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">{approvedCount}</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0D0F14] border border-zinc-800">
            <div className="text-xs font-mono uppercase text-zinc-400">Rejected</div>
            <div className="text-2xl font-mono font-bold text-zinc-400 mt-1">{rejectedCount}</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search registrations by name or email..."
            className="w-full bg-[#0D0F14] border border-zinc-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition shadow-inner"
          />
        </div>

        {/* Access Requests Table / List */}
        <div className="bg-[#0D0F14] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090A0D] border-b border-zinc-800 font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Candidate Identity</th>
                  <th className="py-3 px-4">Enrollment & Class</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Requested At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400 font-mono">
                      {loading ? "Loading access queue..." : "No access requests matching current criteria."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((req) => {
                    const deptInfo = req.department ? (
                      req.department === "TECHNICAL"
                        ? { key: "T", name: "TECHNICAL", color: "text-cyan-400 border-cyan-500/30 bg-cyan-950/20" }
                        : req.department === "EVENT MGT"
                        ? { key: "E", name: "EVENT MGT", color: "text-blue-400 border-blue-500/30 bg-blue-950/20" }
                        : req.department === "R&D"
                        ? { key: "R", name: "R&D", color: "text-purple-400 border-purple-500/30 bg-purple-950/20" }
                        : req.department === "SOCIAL"
                        ? { key: "S", name: "SOCIAL", color: "text-emerald-400 border-emerald-500/30 bg-emerald-950/20" }
                        : req.department === "DESIGN"
                        ? { key: "D", name: "DESIGN", color: "text-pink-400 border-pink-500/30 bg-pink-950/20" }
                        : { key: "P", name: "PR", color: "text-amber-400 border-amber-500/30 bg-amber-950/20" }
                    ) : null;

                    return (
                      <tr key={req.id} className="hover:bg-zinc-900/50 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-zinc-100">{req.name}</div>
                          <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5 mt-0.5">
                            <span className="text-zinc-500">ID:</span>
                            <span className="truncate max-w-[120px]">{req.user_id || req.id}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {req.enrollment_number ? (
                            <div>
                              <div className="font-mono text-zinc-200 font-medium">{req.enrollment_number}</div>
                              <div className="text-[10px] text-zinc-400 font-mono">
                                {req.branch || "CSE"} • Sec {req.section || "A"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-zinc-500 font-mono">--</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {deptInfo ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] font-mono font-medium tracking-tight">
                              <span className={`w-4 h-4 rounded flex items-center justify-center font-bold text-[10px] ${deptInfo.color}`}>
                                {deptInfo.key}
                              </span>
                              <span className="text-zinc-200 text-[10px] font-semibold">{deptInfo.name}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-zinc-500 font-mono">--</span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono text-zinc-300">{req.email}</td>

                        <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                          {new Date(req.requested_at).toLocaleString()}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                              req.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : req.status === "PENDING"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {req.status === "PENDING" ? (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleApprove(req.id, req.email)}
                                disabled={actionLoading === req.id}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{actionLoading === req.id ? "Approving..." : "Authorize"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleReject(req.id, req.email)}
                                disabled={actionLoading === req.id}
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-800/60 text-zinc-400 hover:text-red-400 font-medium text-xs transition flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <div className="text-[11px] text-zinc-400 font-mono">
                              {req.status === "APPROVED" ? "Access Code Issued" : "Rejected"}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
