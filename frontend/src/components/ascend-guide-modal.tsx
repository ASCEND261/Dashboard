"use client";

import React, { useState } from "react";
import { Sparkles, Send, X, Bot, ShieldCheck, HelpCircle } from "lucide-react";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  suggested_actions?: string[];
  knowledge_references?: string[];
}

interface AscendGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AscendGuideModal({ isOpen, onClose }: AscendGuideModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Greetings. I am the ASCEND Guide, your grounded intelligence copilot for the Tech Journey. I can clarify required proof documents, official point rules, and submission statuses.",
      suggested_actions: [
        "How do I submit an achievement?",
        "What proof is needed for Hackathons?",
        "How are points deterministically calculated?",
        "How does instant AutoVerify work?",
      ],
      knowledge_references: ["Official Tech Journey Rules 2026-v1", "Verification Protocol"],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.chatAiGuide(query);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.reply,
          suggested_actions: res.suggested_actions,
          knowledge_references: res.knowledge_references,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I encountered a communication timeout with the ASCEND Knowledge Core. Please verify your connection.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-[640px] max-h-[92vh] flex flex-col bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#141418]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-zinc-800 border border-blue-200 dark:border-zinc-800 flex items-center justify-center text-blue-600 dark:text-zinc-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white tracking-wide text-sm font-mono">ASCEND Guide</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-zinc-850 dark:text-zinc-200 dark:border-zinc-800 font-mono font-bold">
                  Grounded AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#8B8B9A]">Autonomous assistant • Tech Journey 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 dark:text-[#8B8B9A] dark:hover:text-white dark:hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Safety Banner */}
        <div className="px-5 py-2 bg-emerald-50 text-emerald-700 border-b border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-500/20 dark:text-emerald-300 flex items-center gap-2 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-[11px]">Grounded rules engine. No points can be hallucinated or altered.</span>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#09090B]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white shadow-md font-sans"
                    : "bg-white dark:bg-[#141418] text-slate-800 dark:text-[#E2E2ED] border border-slate-200 dark:border-white/8 shadow-xs font-sans"
                }`}
              >
                {m.content}

                {/* References */}
                {m.knowledge_references && m.knowledge_references.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-white/8 flex flex-wrap gap-1.5 font-mono">
                    <span className="text-[10px] text-slate-500 dark:text-[#8B8B9A] uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-slate-400 dark:text-zinc-400" /> Sources:
                    </span>
                    {m.knowledge_references.map((ref, rIdx) => (
                      <span
                        key={rIdx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 dark:bg-white/5 dark:text-[#A1A1B2] dark:border-white/8 font-semibold"
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Pills */}
              {m.suggested_actions && m.suggested_actions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                  {m.suggested_actions.map((act, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => handleSend(act)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-200 hover:border-slate-300 dark:bg-[#141418] dark:hover:bg-zinc-800 dark:text-[#8B8B9A] dark:hover:text-white dark:border-white/8 dark:hover:border-zinc-800 transition text-left font-sans shadow-xs"
                    >
                      {act}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-zinc-200 bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 w-fit font-mono shadow-xs">
              <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-zinc-400 animate-spin" />
              <span>Consulting ASCEND Rules & Knowledge Core...</span>
            </div>
          )}
        </div>

        {/* Footer Input */}
        <div className="p-3 border-t border-slate-200 dark:border-white/8 bg-white dark:bg-[#0E0E11]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about proof requirements, categories, rules..."
              className="flex-1 bg-slate-50 dark:bg-[#141418] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#5E5E6E] focus:outline-none focus:border-blue-500 dark:focus:border-zinc-700 transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold transition shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
