"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Bot,
  ShieldCheck,
  ArrowLeft,
  BookOpen,
  Cpu,
  HelpCircle
} from "lucide-react";
import { api } from "@/lib/api";
import PageTransition from "@/components/react-bits/PageTransition";

interface Message {
  role: "user" | "assistant";
  content: string;
  suggested_actions?: string[];
  knowledge_references?: string[];
}

export default function StandaloneGuidePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to the ASCEND Knowledge Core. I am your grounded AI copilot for the Tech Journey 2026. I can answer questions about official point formulas, required verification documents, submission criteria, and member leaderboard tracking.",
      suggested_actions: [
        "How are points deterministically calculated?",
        "What proof is needed for Hackathons?",
        "What are the categories and their point ranges?",
        "How does the duplicate detection engine work?",
        "How do I submit an achievement?",
      ],
      knowledge_references: ["Official Tech Journey Rules 2026-v1", "Verification Protocol", "Deterministic Scoring Engine"],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
    <PageTransition>
      <div className="min-h-[calc(100vh-3.75rem)] p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6">
        {/* Top Nav Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#8B8B9A] hover:text-white transition px-3 py-1.5 rounded-xl bg-[#0E0E11] border border-white/10 hover:border-zinc-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-[#8B8B9A] font-mono">
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <span>Rules Version: 2026-v1 (Strict)</span>
          </div>
        </div>

        {/* Header Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-[#141418] border border-zinc-800 relative overflow-hidden shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-850 border border-zinc-800 text-zinc-200 text-xs font-mono font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>ASCEND GROUNDED ASSISTANT</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Tech Journey AI Copilot
              </h1>
              <p className="text-xs sm:text-sm text-[#8B8B9A] mt-1 max-w-xl leading-relaxed">
                Ask anything about official scoring formulas, proof requirements, eligible tiers, or verifier review criteria.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-950/30 border border-emerald-500/30 px-3.5 py-2 rounded-xl shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero Hallucination Guaranteed</span>
            </div>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="rounded-2xl bg-[#0E0E11] border border-zinc-800 overflow-hidden flex flex-col h-[650px] shadow-2xl">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-[#09090B]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="max-w-[85%] space-y-2.5 text-left">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-zinc-800 text-white border border-zinc-800 rounded-tr-none shadow-md"
                        : "bg-[#141418] border border-white/8 text-[#E2E2ED] rounded-tl-none shadow-md"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Grounding Knowledge References */}
                    {msg.knowledge_references && msg.knowledge_references.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-white/8 flex flex-wrap items-center gap-1.5 text-[11px] text-[#8B8B9A]">
                        <span className="font-semibold text-zinc-400 font-mono flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" /> Sources:
                        </span>
                        {msg.knowledge_references.map((source, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-[#A1A1B2] font-mono text-[10px]"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Suggested Prompts */}
                  {msg.suggested_actions && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.suggested_actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleSend(act)}
                          className="text-xs px-3 py-1.5 rounded-xl bg-[#141418] hover:bg-zinc-800 border border-white/8 hover:border-zinc-800 text-[#8B8B9A] hover:text-white transition text-left"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3.5 rounded-2xl bg-[#141418] border border-zinc-800 text-xs text-zinc-200 flex items-center gap-2 font-mono">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span>Consulting Official Tech Journey Rules 2026-v1...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-4 bg-[#0E0E11] border-t border-white/8">
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
                placeholder="Ask about points, rules, proof documents, or verification..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#141418] border border-white/10 text-white placeholder-[#5E5E6E] text-xs sm:text-sm focus:outline-none focus:border-zinc-700 transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-lg shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
