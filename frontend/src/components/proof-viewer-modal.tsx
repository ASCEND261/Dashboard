"use client";

import React, { useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, ExternalLink, ShieldCheck, Download } from "lucide-react";
import { api } from "@/lib/api";

interface ProofViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  viewToken?: string;
  proofId?: string;
  mimeType: string;
}

export default function ProofViewerModal({
  isOpen,
  onClose,
  fileName,
  viewToken,
  proofId,
  mimeType,
}: ProofViewerModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen) return null;

  const fileUrl = viewToken ? api.getProofViewUrl(viewToken) : "";
  const isPdf = mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl h-[85vh] flex flex-col bg-[#0E0E11] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-[#141418]">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-100 truncate max-w-md font-sans">{fileName}</div>
              <div className="text-[10px] text-zinc-400 flex items-center gap-2 font-mono">
                <span>Cryptographic Token Stream</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">Verified Access</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            {!isPdf && (
              <>
                <button
                  onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono text-zinc-400 px-1">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
                  title="Rotate"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/30 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-800/40 transition ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Document Canvas Body */}
        <div className="flex-1 bg-[#09090B] p-4 flex items-center justify-center overflow-auto relative">
          {fileUrl ? (
            isPdf ? (
              <iframe
                src={`${fileUrl}#toolbar=0`}
                className="w-full h-full rounded-xl border border-zinc-800"
                title="Proof PDF Viewer"
              />
            ) : (
              <div
                className="transition-transform duration-150 flex items-center justify-center max-w-full max-h-full"
                style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
              >
                <img
                  src={fileUrl}
                  alt={fileName}
                  className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl border border-zinc-800"
                />
              </div>
            )
          ) : (
            <div className="text-center p-8 text-zinc-500 font-mono text-xs">
              No authenticated stream token provided for this proof document.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
