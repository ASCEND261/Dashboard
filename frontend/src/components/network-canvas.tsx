"use client";

import React, { useEffect, useRef } from "react";

type NodeType = "achievement" | "verification" | "points" | "progress";

interface NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: NodeType;
  phase: number;
  illumination: number; // 0 (subtle) to 1 (illuminated)
  connections: number[];
}

export default function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Mouse coordinates & scroll tracking
    const mouse = { x: -2000, y: -2000, targetX: -2000, targetY: -2000 };
    let lastScrollY = window.scrollY;
    let scrollEnergy = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleScroll = () => {
      const delta = Math.abs(window.scrollY - lastScrollY);
      scrollEnergy = Math.min(2.5, scrollEnergy + delta * 0.04);
      lastScrollY = window.scrollY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initialize Structured ASCEND Nodes
    // Density: approx 1 node per 35,000 sq px, capped between 28 and 54
    const nodeCount = Math.min(54, Math.max(28, Math.floor((width * height) / 32000)));
    const nodes: NetworkNode[] = [];
    const types: NodeType[] = ["achievement", "verification", "points", "progress"];

    for (let i = 0; i < nodeCount; i++) {
      const type = types[i % types.length];
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (prefersReducedMotion ? 0.02 : 0.22),
        vy: (Math.random() - 0.5) * (prefersReducedMotion ? 0.02 : 0.22) - 0.05, // subtle upward ascent drift
        radius: type === "progress" ? 3.5 : type === "points" ? 3.0 : 2.2,
        type,
        phase: Math.random() * Math.PI * 2,
        illumination: 0,
        connections: [],
      });
    }

    // Dynamic Edge lifecycle tracker
    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Decay scroll energy
      scrollEnergy *= 0.94;

      const connectionDistance = 180;
      const mouseInfluenceRadius = 220;

      // 1. Update node physics & illumination
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (!prefersReducedMotion) {
          node.x += node.vx * (1 + scrollEnergy);
          node.y += node.vy * (1 + scrollEnergy);

          // Wrap edges smoothly
          if (node.x < -20) node.x = width + 20;
          if (node.x > width + 20) node.x = -20;
          if (node.y < -20) node.y = height + 20;
          if (node.y > height + 20) node.y = -20;
        }

        // Distance to mouse
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);

        let targetIllumination = 0;
        if (distToMouse < mouseInfluenceRadius) {
          targetIllumination = Math.pow(1 - distToMouse / mouseInfluenceRadius, 1.5);
        }

        // Add subtle ambient cycle to illumination
        const ambientPulse = 0.06 + Math.sin(node.phase + time) * 0.04;
        targetIllumination = Math.max(targetIllumination, ambientPulse + scrollEnergy * 0.15);

        // Smooth transition
        node.illumination += (targetIllumination - node.illumination) * 0.1;
      }

      // 2. Draw connections (abstract data pathways)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            // Dynamic connect/disconnect breathing factor based on spatial phase
            const cyclePhase = Math.sin(time * 0.8 + (n1.x + n2.y) * 0.005);
            if (cyclePhase < -0.6) continue; // edge temporarily disconnected

            const proximityRatio = 1 - dist / connectionDistance;
            const jointIllumination = Math.max(n1.illumination, n2.illumination);

            // Base subtle line alpha: ~0.04 to 0.07. Illuminated line alpha: up to ~0.45
            const baseAlpha = 0.05 * proximityRatio;
            const activeAlpha = 0.4 * jointIllumination * proximityRatio;
            const alpha = Math.min(0.5, baseAlpha + activeAlpha);

            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);

            if (jointIllumination > 0.25) {
              // Minimal subtle blue hairline
              ctx.strokeStyle = `rgba(59, 130, 246, ${alpha * 0.4})`;
              ctx.lineWidth = 0.8;
            } else {
              // Barely visible architectural hairline
              ctx.strokeStyle = `rgba(161, 161, 170, ${alpha * 0.15})`;
              ctx.lineWidth = 0.5;
            }
            ctx.stroke();
          }
        }
      }

      // 3. Draw nodes (subtle neutral points)
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const illum = node.illumination;

        ctx.beginPath();
        const currentRadius = node.radius * (1 + illum * 0.2);
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);

        if (illum > 0.3) {
          ctx.fillStyle = `rgba(59, 130, 246, ${0.2 + illum * 0.3})`;
        } else {
          ctx.fillStyle = "rgba(113, 113, 122, 0.15)";
        }

        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "transparent" }}
    />
  );
}
