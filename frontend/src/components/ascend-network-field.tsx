"use client";

import React, { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  phase: number;
  speed: number;
  amplitude: number;
  isAccent: boolean;
}

export default function AscendNetworkField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Reduced motion check
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Generate balanced constellation nodes
    const nodeCount = Math.min(24, Math.floor((width * height) / 45000) + 12);
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const bx = Math.random() * width;
      const by = Math.random() * height;
      nodes.push({
        x: bx,
        y: by,
        baseX: bx,
        baseY: by,
        radius: Math.random() > 0.85 ? 2.5 : 1.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.00015 + Math.random() * 0.0002, // 25-40 second gentle cycle
        amplitude: 15 + Math.random() * 25,
        isAccent: Math.random() > 0.8,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    let startTime = performance.now();

    const render = (time: number) => {
      const elapsed = time - startTime;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle connection lines between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];

        if (!prefersReducedMotion) {
          // Slow organic drift
          const t = elapsed * n1.speed + n1.phase;
          n1.x = n1.baseX + Math.sin(t) * n1.amplitude;
          n1.y = n1.baseY + Math.cos(t * 0.8) * n1.amplitude;
        }

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 180;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.08;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(91, 140, 255, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        if (n.isAccent) {
          ctx.fillStyle = "rgba(91, 140, 255, 0.4)";
        } else {
          ctx.fillStyle = "rgba(245, 247, 250, 0.25)";
        }
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    />
  );
}
