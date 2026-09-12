"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  Trophy,
  Award,
  Flame,
  Code,
  BookOpen,
  Briefcase,
  Users,
  GitPullRequest,
  Compass,
  Upload,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  FileText,
  Lock,
  ArrowRight
} from "lucide-react";

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  required_fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
  }>;
}

const ICON_MAP: Record<string, any> = {
  Trophy,
  Award,
  Flame,
  Code,
  BookOpen,
  Briefcase,
  Users,
  GitPullRequest,
  Compass,
};

export default function DynamicAchievementForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryCat = searchParams.get("cat");
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [achievementDate, setAchievementDate] = useState(new Date().toISOString().split("T")[0]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});

  // Proof Upload State
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadedProofId, setUploadedProofId] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // AI "Format My Achievement" State
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [rawAiInput, setRawAiInput] = useState("");
  const [formattingAi, setFormattingAi] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getCategories()
      .then((cats) => {
        setCategories(cats);
        if (cats.length > 0) {
          if (queryCat) {
            const matched = cats.find((c) => c.slug === queryCat);
            setSelectedCategory(matched || cats[0]);
          } else {
            setSelectedCategory(cats[0]);
          }
        }
      })
      .catch(() => setErrorMsg("Failed to load achievement categories."));
  }, [queryCat]);

  const handleMetadataChange = (fieldName: string, value: any) => {
    setMetadata((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setUploadingProof(true);
    try {
      const res = await api.uploadProof(file);
      setProofFile(file);
      setUploadedProofId(res.proof_id);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload proof document.");
      setProofFile(null);
      setUploadedProofId(null);
    } finally {
      setUploadingProof(false);
    }
  };

  const handleAiFormatDraft = async () => {
    if (!rawAiInput.trim()) return;
    setFormattingAi(true);
    try {
      const res = await api.formatAchievementWithAi(
        rawAiInput,
        selectedCategory?.slug
      );
      if (res.success && res.draft) {
        const matchedCat = categories.find((c) => c.slug === res.draft.category_slug);
        if (matchedCat) {
          setSelectedCategory(matchedCat);
        }
        setTitle(res.draft.title);
        setDescription(res.draft.description);
        setAchievementDate(res.draft.achievement_date || new Date().toISOString().split("T")[0]);
        setMetadata(res.draft.metadata || {});
        setFormatModalOpen(false);
      }
    } catch (err: any) {
      setErrorMsg("AI formatting service was unable to parse the draft.");
    } finally {
      setFormattingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedCategory) {
      setErrorMsg("Please select an achievement category.");
      return;
    }

    if (!uploadedProofId) {
      setErrorMsg("A verified proof document (PDF, PNG, JPG) is mandatory under official rules.");
      return;
    }

    if (title.trim().length < 5) {
      setErrorMsg("Achievement title must be at least 5 characters describing the achievement.");
      return;
    }

    if (description.trim().length < 10) {
      setErrorMsg("Detailed claim description must be at least 10 characters providing verifiable context.");
      return;
    }

    setSubmitting(true);
    try {
      await api.submitAchievement({
        category_slug: selectedCategory.slug,
        title,
        description,
        achievement_date: achievementDate,
        metadata,
        proof_id: uploadedProofId,
      });

      setSuccessMsg("Achievement submitted successfully! It is now queued for Core Member review.");
      setTimeout(() => {
        router.push("/dashboard/submissions");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit achievement record.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner with AI Format CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0E0E11] border border-zinc-800 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-zinc-800 text-zinc-400 border border-zinc-800">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Need help drafting your claim?</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Paste rough text from your certificate or event recap. ASCEND AI formats it into official fields.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setFormatModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wide transition shadow-md shrink-0 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Format For Me</span>
        </button>
      </div>

      {/* Step 1: Category Selector */}
      <div className="p-6 rounded-2xl bg-[#0E0E11] border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Step 01</div>
            <h2 className="text-sm font-bold text-white mt-0.5">Select Achievement Category</h2>
          </div>
          <span className="text-xs text-gray-400 font-mono">Official Tech Journey Categories</span>
        </div>

        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x">
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Trophy;
            const isSelected = selectedCategory?.id === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setMetadata({});
                }}
                className={`flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border text-center transition-all duration-200 shrink-0 min-w-[130px] sm:min-w-0 snap-start ${
                  isSelected
                    ? "bg-blue-950/25 border-blue-500/60 text-white shadow-lg shadow-blue-500/10 scale-[1.02]"
                    : "bg-[#141418] border-zinc-800 text-gray-400 hover:text-white hover:bg-[#18181B]"
                }`}
              >
                <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? "text-blue-400" : "text-gray-400"}`} />
                <span className="text-xs font-semibold">{cat.name}</span>
                {isSelected && (
                  <span className="mt-1 text-[9px] font-mono text-blue-400 font-bold uppercase tracking-wider">
                    Selected World
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Form & Proof Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dynamic Category Form */}
        <div className="p-6 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">Step 02</div>
              <h2 className="text-sm font-bold text-white mt-0.5">
                Prove Your {selectedCategory?.name || "Achievement"}
              </h2>
            </div>
            <span className="text-xs text-gray-400 font-mono">Official Rule Version TSJ-2026-v1</span>
          </div>

          {/* Automatic Member Identity Locks */}
          <div className="p-3.5 rounded-xl bg-[#09090B] border border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" /> Member
              </span>
              <div className="font-semibold text-white mt-0.5 truncate">{user?.name || "Sarthak"}</div>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" /> Team
              </span>
              <div className="font-semibold text-white mt-0.5">Team ASCEND</div>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" /> Department
              </span>
              <div className="font-semibold text-white mt-0.5">{user?.branch || user?.department?.code || user?.department_unit || "CSE"}</div>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-semibold">Evaluation Mode</span>
              <div className="font-semibold text-zinc-400 mt-0.5">Deterministic</div>
            </div>
          </div>

          {/* Main Title & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                Achievement Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                minLength={5}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., HackMIT 2026 — 2nd Place Runner-Up"
                className="w-full bg-[#141418] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-zinc-700/60 focus: transition"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Min 5 characters. Must describe your verifiable achievement.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                Achievement Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={achievementDate}
                onChange={(e) => setAchievementDate(e.target.value)}
                className="w-full bg-[#141418] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-700/60 focus: transition"
              />
            </div>

            {/* Render Category Specific Dynamic Fields */}
            {selectedCategory?.required_fields.map((f) => {
              const val = metadata[f.name] || "";

              if (f.type === "select") {
                return (
                  <div key={f.name}>
                    <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                      {f.label} {f.required && <span className="text-red-400">*</span>}
                    </label>
                    <select
                      required={f.required}
                      value={val}
                      onChange={(e) => handleMetadataChange(f.name, e.target.value)}
                      className="w-full bg-[#141418] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-700/60 focus: transition"
                    >
                      <option value="">Select official tier...</option>
                      {f.options?.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#141418]">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (f.type === "textarea") {
                return (
                  <div key={f.name} className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                      {f.label} {f.required && <span className="text-red-400">*</span>}
                    </label>
                    <textarea
                      rows={2}
                      required={f.required}
                      value={val}
                      onChange={(e) => handleMetadataChange(f.name, e.target.value)}
                      placeholder={f.placeholder || ""}
                      className="w-full bg-[#141418] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-zinc-700/60 focus: transition"
                    />
                  </div>
                );
              }

              return (
                <div key={f.name}>
                  <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                    {f.label} {f.required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type={f.type === "number" ? "number" : f.type === "url" ? "url" : f.type === "date" ? "date" : "text"}
                    required={f.required}
                    value={val}
                    onChange={(e) => handleMetadataChange(f.name, e.target.value)}
                    placeholder={f.placeholder || ""}
                    className="w-full bg-[#141418] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-zinc-700/60 focus: transition"
                  />
                </div>
              );
            })}

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-200 mb-1.5">
                Detailed Claim Description <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                minLength={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide specific technical context, scope, or accomplishments..."
                className="w-full bg-[#141418] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-zinc-700/60 focus: transition"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Min 10 characters. Outline what you did and verifiable details.
              </span>
            </div>
          </div>
        </div>

        {/* Step 3: Mandatory Proof Upload */}
        <div className="p-6 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Step 03</div>
              <h2 className="text-sm font-bold text-white mt-0.5">Mandatory Proof Document</h2>
            </div>
            <span className="text-xs text-gray-400 font-mono">PDF, PNG, JPG (Max 10MB)</span>
          </div>

          <div className="border border-dashed border-zinc-800 hover:border-zinc-800 rounded-2xl p-6 text-center transition bg-[#09090B] group">
            <input
              type="file"
              id="proof-upload"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <label htmlFor="proof-upload" className="cursor-pointer block">
              <div className="w-10 h-10 rounded-xl bg-[#141418] border border-zinc-800 group-hover:border-zinc-800 group-hover: flex items-center justify-center mx-auto mb-2 text-zinc-400 transition">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-gray-200 group-hover:text-white">
                {proofFile ? proofFile.name : "Click or drag to upload verified certificate / documentation"}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Files are stored in private encrypted storage with cryptographic tokens.
              </p>
            </label>

            {uploadingProof && (
              <div className="mt-3 text-xs text-zinc-400 font-mono animate-pulse">
                Validating file magic bytes and streaming to private storage...
              </div>
            )}

            {uploadedProofId && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1 rounded-md font-semibold font-mono">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Proof uploaded & integrity verified ({proofFile?.name})</span>
              </div>
            )}

            {uploadError && (
              <div className="mt-3 text-xs text-red-400 bg-red-950/30 border border-red-800/30 px-3 py-1 rounded-md font-mono">
                {uploadError}
              </div>
            )}
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-800/30 text-xs text-red-400 flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 font-mono">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#141418] transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploadingProof || !uploadedProofId}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold tracking-wide transition shadow-lg flex items-center gap-2"
          >
            {submitting ? "Transmitting Claim..." : "Submit for Verification"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* AI "Format My Achievement" Modal */}
      {formatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#0E0E11] border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm font-mono">
                <Sparkles className="w-4 h-4 text-zinc-400" />
                <span>AI Draft Assistant</span>
              </div>
              <button
                onClick={() => setFormatModalOpen(false)}
                className="text-gray-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Paste raw details about your achievement (e.g. &quot;Won 2nd place in HackZurich with our smart contract project&quot;).
            </p>

            <textarea
              rows={4}
              value={rawAiInput}
              onChange={(e) => setRawAiInput(e.target.value)}
              placeholder="e.g., We participated in XYZ Hackathon and got second position."
              className="w-full bg-[#09090B] border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-zinc-700/60 focus: transition"
            />

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setFormatModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAiFormatDraft}
                disabled={!rawAiInput.trim() || formattingAi}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
              >
                {formattingAi ? "Parsing..." : "Apply Structured Draft"}
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
