"use client";

import React, { useEffect, useRef } from "react";

interface StarRay {
  x: number;
  y: number;
  z: number;
  prevZ: number;
  angle: number;
  radius: number;
  speed: number;
  length: number;
  width: number;
  brightness: number;
  trail: number;
  hue: "cyan" | "sapphire" | "white" | "prismatic" | "violet";
}

interface CosmicDust {
  x: number;
  y: number;
  size: number;
  alpha: number;
  pulse: number;
  pulseSpeed: number;
  color: string;
}

export default function HyperspeedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Vanishing perspective focal point placed elegantly at top-center
    // Matches user request ("beautiful pls top ke")
    let focalX = width * 0.5;
    let focalY = height * 0.32;
    let targetFocalX = focalX;
    let targetFocalY = focalY;

    let warpMultiplier = 1.0;
    let targetWarpMultiplier = 1.0;
    let lastScrollY = window.scrollY;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      targetFocalX = width * 0.5;
      targetFocalY = height * 0.32;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Gentle parallax responsive tilt
      const normX = (e.clientX / width - 0.5) * 2;
      const normY = (e.clientY / height - 0.5) * 2;
      targetFocalX = width * 0.5 + normX * (width * 0.06);
      targetFocalY = height * 0.32 + normY * (height * 0.05);
    };

    const handleScroll = () => {
      const delta = Math.abs(window.scrollY - lastScrollY);
      targetWarpMultiplier = Math.min(3.2, 1.0 + delta * 0.04);
      lastScrollY = window.scrollY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // High Density Incoming Galaxy Warp: 280 to 380 active stars
    // Rich, vibrant, uniform 360-degree radial dispersion
    const rayCount = Math.min(360, Math.max(220, Math.floor((width * height) / 4800)));
    const rays: StarRay[] = [];

    const initRay = (farPlaneOnly = false): StarRay => {
      const angle = Math.random() * Math.PI * 2;
      const minR = 30;
      const maxR = Math.max(width, height) * 1.1;
      const radius = minR + Math.pow(Math.random(), 0.6) * (maxR - minR);

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const z = farPlaneOnly ? 980 + Math.random() * 40 : Math.random() * 950 + 40;
      const speed = 5.0 + Math.random() * 9.0;

      const hueVal = Math.random();
      const hue =
        hueVal > 0.65
          ? "prismatic"
          : hueVal > 0.42
          ? "cyan"
          : hueVal > 0.22
          ? "sapphire"
          : hueVal > 0.10
          ? "violet"
          : "white";

      return {
        x,
        y,
        z,
        prevZ: z,
        angle,
        radius,
        speed,
        length: 90 + Math.random() * 220,
        width: 0.9 + Math.random() * 1.8,
        brightness: 0.55 + Math.random() * 0.45,
        trail: 1.2 + Math.random() * 1.6,
        hue,
      };
    };

    for (let i = 0; i < rayCount; i++) {
      rays.push(initRay(false));
    }

    // Ambient Deep Space Dust & Star Particles
    const dustCount = 85;
    const dustParticles: CosmicDust[] = [];
    const dustColors = [
      "rgba(96, 165, 250, ",
      "rgba(56, 189, 248, ",
      "rgba(192, 132, 252, ",
      "rgba(255, 255, 255, ",
    ];
    for (let i = 0; i < dustCount; i++) {
      dustParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.6 + Math.random() * 1.6,
        alpha: 0.15 + Math.random() * 0.5,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.012 + Math.random() * 0.025,
        color: dustColors[Math.floor(Math.random() * dustColors.length)],
      });
    }

    const render = () => {
      // Smoothly interpolate vanishing center
      focalX += (targetFocalX - focalX) * 0.06;
      focalY += (targetFocalY - focalY) * 0.06;

      // Smooth decay warp speed back to 1.0
      warpMultiplier += (targetWarpMultiplier - warpMultiplier) * 0.05;
      targetWarpMultiplier += (1.0 - targetWarpMultiplier) * 0.03;

      const isLight =
        typeof document !== "undefined" &&
        document.documentElement.classList.contains("light");

      // Trail fade: crisp crystalline in light, deep velvet space in dark
      ctx.fillStyle = isLight
        ? "rgba(248, 250, 252, 0.40)"
        : "rgba(7, 8, 10, 0.28)";
      ctx.fillRect(0, 0, width, height);

      // Render Ambient Cosmic Dust Stars
      for (const d of dustParticles) {
        d.pulse += d.pulseSpeed;
        const currentAlpha = Math.max(0, d.alpha + Math.sin(d.pulse) * 0.18);
        ctx.fillStyle = `${d.color}${currentAlpha * (isLight ? 0.6 : 0.95)})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render High-Density Uniform Incoming Galaxy Warp Rays
      for (let i = 0; i < rays.length; i++) {
        const r = rays[i];
        r.prevZ = r.z;
        r.z -= r.speed * warpMultiplier;

        // Reset ray to deep plane when passing camera
        if (r.z <= 20) {
          rays[i] = initRay(true);
          continue;
        }

        // Perspective projection from top vanishing point
        const k = 420 / r.z;
        const px = r.x * k + focalX;
        const py = r.y * k + focalY;

        const prevK = 420 / r.prevZ;
        const ppx = r.x * prevK + focalX;
        const ppy = r.y * prevK + focalY;

        const dx = px - ppx;
        const dy = py - ppy;
        const dist = Math.hypot(dx, dy);

        // Tail calculation
        const maxTail = Math.min(260, r.length * (1 - r.z / 1200) * 2.2);
        const tailLength = Math.min(maxTail, Math.max(dist * 3.0 * r.trail, 6));
        const dirX = dx / (dist || 1);
        const dirY = dy / (dist || 1);
        const tailX = px - dirX * tailLength;
        const tailY = py - dirY * tailLength;

        // Viewport culling
        if (
          (px < -180 && tailX < -180) ||
          (px > width + 180 && tailX > width + 180) ||
          (py < -180 && tailY < -180) ||
          (py > height + 180 && tailY > height + 180)
        ) {
          rays[i] = initRay(true);
          continue;
        }

        // Radiant visibility curve:
        // Deep stars are clearly visible starlight, intensifying as they approach
        const progress = 1 - r.z / 1000;
        let depthAlpha = Math.min(1, 0.25 + progress * 1.2) * r.brightness;

        // Graceful dissolve near camera (z < 65) to eliminate any harsh edge/cross
        if (r.z < 65) {
          depthAlpha *= Math.max(0, (r.z - 20) / 45);
        }

        if (depthAlpha <= 0.01) continue;

        // Strictly clamp max ray width to 3.2px to guarantee no beam explosion
        const rayWidth = Math.min(3.2, Math.max(0.8, r.width * (320 / r.z) * 0.55));

        // Perpendicular vector for chromatic fringe
        const normDx = -dirY;
        const normDy = dirX;
        const chromaticOffset = Math.min(1.8, Math.max(0.5, 2.0 * progress));

        // Pass 1: Electric Cyan & Azure Fringe
        const cyanGrad = ctx.createLinearGradient(tailX, tailY, px, py);
        cyanGrad.addColorStop(
          0,
          isLight ? "rgba(37, 99, 235, 0)" : "rgba(56, 189, 248, 0)"
        );
        cyanGrad.addColorStop(
          0.7,
          isLight
            ? `rgba(37, 99, 235, ${depthAlpha * 0.4})`
            : `rgba(56, 189, 248, ${depthAlpha * 0.6})`
        );
        cyanGrad.addColorStop(
          1,
          isLight
            ? `rgba(29, 78, 216, ${depthAlpha * 0.7})`
            : `rgba(96, 165, 250, ${depthAlpha * 0.9})`
        );

        ctx.lineWidth = Math.max(0.6, rayWidth * 0.9);
        ctx.strokeStyle = cyanGrad;
        ctx.beginPath();
        ctx.moveTo(
          tailX + normDx * chromaticOffset,
          tailY + normDy * chromaticOffset
        );
        ctx.lineTo(
          px + normDx * chromaticOffset,
          py + normDy * chromaticOffset
        );
        ctx.stroke();

        // Pass 2: Celestial Violet / Rose Fringe
        const violetGrad = ctx.createLinearGradient(tailX, tailY, px, py);
        violetGrad.addColorStop(
          0,
          isLight ? "rgba(124, 58, 237, 0)" : "rgba(217, 70, 239, 0)"
        );
        violetGrad.addColorStop(
          0.7,
          isLight
            ? `rgba(124, 58, 237, ${depthAlpha * 0.3})`
            : `rgba(192, 132, 252, ${depthAlpha * 0.5})`
        );
        violetGrad.addColorStop(
          1,
          isLight
            ? `rgba(109, 40, 217, ${depthAlpha * 0.6})`
            : `rgba(244, 63, 94, ${depthAlpha * 0.8})`
        );

        ctx.strokeStyle = violetGrad;
        ctx.beginPath();
        ctx.moveTo(
          tailX - normDx * chromaticOffset,
          tailY - normDy * chromaticOffset
        );
        ctx.lineTo(
          px - normDx * chromaticOffset,
          py - normDy * chromaticOffset
        );
        ctx.stroke();

        // Pass 3: White-Hot Radiant Core Streak
        const coreGrad = ctx.createLinearGradient(tailX, tailY, px, py);
        coreGrad.addColorStop(
          0,
          isLight ? "rgba(30, 58, 138, 0)" : "rgba(255, 255, 255, 0)"
        );
        coreGrad.addColorStop(
          0.5,
          isLight
            ? `rgba(30, 58, 138, ${depthAlpha * 0.4})`
            : `rgba(224, 242, 254, ${depthAlpha * 0.65})`
        );
        coreGrad.addColorStop(
          1,
          isLight
            ? `rgba(15, 23, 42, ${depthAlpha * 0.9})`
            : `rgba(255, 255, 255, ${depthAlpha * 0.98})`
        );

        ctx.lineWidth = Math.max(0.6, rayWidth * 0.7);
        ctx.strokeStyle = coreGrad;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(px, py);
        ctx.stroke();

        // Radiant Glowing Star Head
        if (depthAlpha > 0.25 && px > 0 && px < width && py > 0 && py < height) {
          const glowRadius = Math.min(4.0, Math.max(1.5, rayWidth * 1.8));
          const headGlow = ctx.createRadialGradient(
            px,
            py,
            0,
            px,
            py,
            glowRadius
          );
          headGlow.addColorStop(
            0,
            `rgba(255, 255, 255, ${depthAlpha * 0.95})`
          );
          headGlow.addColorStop(
            0.45,
            `rgba(96, 165, 250, ${depthAlpha * 0.65})`
          );
          headGlow.addColorStop(1, "rgba(56, 189, 248, 0)");

          ctx.fillStyle = headGlow;
          ctx.beginPath();
          ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    // First frame clear - light or dark
    const initialIsLight =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("light");
    ctx.fillStyle = initialIsLight ? "#F8FAFC" : "#07080A";
    ctx.fillRect(0, 0, width, height);

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-70 dark:opacity-95 transition-opacity duration-300"
      />
      {/* Subtle vignette: clean soft radial fade in light, deep space in dark */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(241,245,249,0.2)_70%,rgba(226,232,240,0.5)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,8,10,0.3)_75%,rgba(7,8,10,0.8)_100%)] pointer-events-none" />
    </div>
  );
}
