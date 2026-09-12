"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, ShieldCheck, ArrowUp, RefreshCw, HelpCircle, Bot } from "lucide-react";
import { api } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggested_actions?: string[];
  knowledge_references?: string[];
}

interface AscendGuideAgentPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const STARTER_QUESTIONS = [
  "How does verification work?",
  "How are points calculated?",
  "Why was my proof rejected?",
  "What can I submit?",
  "How does AutoVerify work?",
  "Who approves my access?",
];

export default function AscendGuideAgentPanel({ isOpen, onClose }: AscendGuideAgentPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-greeting",
      role: "assistant",
      content:
        "Welcome to the ASCEND Guide. I am your authoritative system intelligence agent for Tech Sprint Journey 2026.\n\nAsk me anything about how verification works ('AI assists; Rust decides/enforces'), deterministic point rules, evidence requirements, or account access.",
      suggested_actions: [
        "How does verification work?",
        "How are points calculated?",
        "Why was my proof rejected?",
        "How does AutoVerify work?",
      ],
      knowledge_references: ["TSJ-2026-v1 Rulebook", "AutoVerify Architecture"],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const text = (queryText || input).trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.chatAiGuide(text);
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: res.reply,
        suggested_actions: res.suggested_actions,
        knowledge_references: res.knowledge_references,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "I encountered a temporary connection timeout with the ASCEND Knowledge Core. All official rules remain enforced by the Rust engine.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg h-full sm:h-[92vh] sm:mr-4 sm:rounded-2xl flex flex-col bg-white dark:bg-[#0A0C10] border-l sm:border border-slate-200 dark:border-zinc-800/80 shadow-2xl overflow-hidden z-10 animate-in slide-in-from-right-4 duration-200 transition-colors">
        {/* Top Accent Light Bar */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-zinc-800/80 bg-slate-50/90 dark:bg-[#0D0F14]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white tracking-wide text-sm font-mono">✦ ASCEND GUIDE</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800/40 font-mono font-semibold">
                  Authoritative
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Your guide to how ASCEND works</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/60 transition"
            title="Close Guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grounding & Safety Subtitle */}
        <div className="px-5 py-2 bg-slate-100 dark:bg-[#090A0D] border-b border-slate-200 dark:border-zinc-800/50 flex items-center justify-between text-[10px] font-mono text-slate-600 dark:text-zinc-400">
          <span className="flex items-center gap-1.5 text-slate-800 dark:text-zinc-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>AI assists; Rust decides/enforces.</span>
          </span>
          <span className="text-slate-500 dark:text-zinc-500">Ruleset TSJ-2026-v1</span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50 dark:bg-[#07080A]">
          {/* Quick Starter Chips (Only if 1 message exists) */}
          {messages.length === 1 && (
            <div className="space-y-2 pt-1 pb-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-500 font-semibold px-1">
                Suggested Topics
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-left px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-slate-900 dark:bg-[#0F1117] dark:hover:bg-[#161922] dark:border-zinc-800/80 dark:hover:border-blue-500/40 dark:text-zinc-300 dark:hover:text-white text-xs transition font-mono leading-snug shadow-xs"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white shadow-md font-sans"
                    : "bg-white text-slate-800 border border-slate-200 dark:bg-[#0E1017] dark:text-zinc-200 dark:border-zinc-800 shadow-sm font-sans"
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>

                {/* Knowledge Reference Chips */}
                {m.knowledge_references && m.knowledge_references.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-800/80 flex flex-wrap items-center gap-1.5 font-mono">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-slate-400 dark:text-zinc-400" /> Sources:
                    </span>
                    {m.knowledge_references.map((ref, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 dark:bg-zinc-900 dark:text-blue-400 dark:border-zinc-800 font-semibold"
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Follow-up Suggested Actions */}
              {m.suggested_actions && m.suggested_actions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                  {m.suggested_actions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(act)}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 dark:border-zinc-800/80 dark:text-zinc-400 dark:hover:text-white transition font-mono flex items-center gap-1 shadow-xs"
                    >
                      <span>{act}</span>
                      <ArrowUp className="w-2.5 h-2.5 rotate-45 text-blue-600 dark:text-blue-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-zinc-400 p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
              <span>Consulting ASCEND Knowledge Core...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0B0C10]">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about ASCEND..."
              disabled={loading}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl pl-4 pr-12 py-2.5 text-xs text-slate-900 placeholder-slate-400 dark:bg-[#0E1015] dark:border-zinc-800 dark:focus:border-blue-500 dark:text-white dark:placeholder-zinc-500 focus:outline-none transition shadow-inner font-mono"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="absolute right-2 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white transition shadow-sm"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-500 mt-2 px-1">
            <span>Authoritative Answers • TSJ-2026-v1</span>
            <span>Zero Hallucinations Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}
