import React, { useEffect, useRef } from "react";
import { ParticleStyle } from "../types";
import { sounds } from "../utils/soundEffects";

interface ParticleBackgroundProps {
  isDarkMode: boolean;
  particleStyle?: ParticleStyle;
}

interface ParticleItem {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  hue: number;
  alpha: number;
  rotation: number;
  rotSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  // Specific for realistic Firefly & Snowflake physics
  lightPulsePhase: number;
  lightPulseSpeed: number;
  isSnowball?: boolean;
}

interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  isDarkMode,
  particleStyle = "bubbles",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const HUES = [285, 260, 210, 190, 160, 45, 330, 350, 15];
    const FIREFLY_HUES = [65, 75, 85, 55]; // Golden lime-yellow bioluminescence
    const numParticles =
      particleStyle === "fireflies"
        ? 35
        : particleStyle === "snow"
        ? 45
        : particleStyle === "stars"
        ? 50
        : particleStyle === "coins"
        ? 30
        : 40;

    const particles: ParticleItem[] = [];

    for (let i = 0; i < numParticles; i++) {
      const isSnow = particleStyle === "snow";
      const isFirefly = particleStyle === "fireflies";

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size:
          particleStyle === "coins"
            ? Math.random() * 10 + 10
            : particleStyle === "stars"
            ? Math.random() * 8 + 4
            : isFirefly
            ? Math.random() * 5 + 6 // Bug size 6px - 11px
            : isSnow
            ? Math.random() * 10 + 6 // Snow crystal size
            : Math.random() * 16 + 6,
        speedY: isSnow
          ? Math.random() * 0.9 + 0.5 // Fall downwards
          : isFirefly
          ? (Math.random() - 0.5) * 0.6 // Float freely in all directions
          : Math.random() * 0.7 + 0.3, // Rise upwards
        speedX: isFirefly ? (Math.random() - 0.5) * 0.7 : (Math.random() - 0.5) * 0.5,
        hue: isFirefly
          ? FIREFLY_HUES[i % FIREFLY_HUES.length]
          : HUES[i % HUES.length],
        alpha: Math.random() * 0.4 + 0.45,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.03 + 0.015,
        lightPulsePhase: Math.random() * Math.PI * 2,
        lightPulseSpeed: Math.random() * 0.04 + 0.02,
        isSnowball: isSnow ? i % 3 === 0 : false, // 1 in 3 is a soft fluffy snowball
      });
    }

    const burstParticles: BurstParticle[] = [];

    const spawnBurst = (x: number, y: number, hue: number) => {
      const count = 12;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = Math.random() * 3 + 1.5;
        burstParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 3 + 1.5,
          alpha: 1,
          color: `hsla(${hue}, 90%, 65%, `,
        });
      }
    };

    // Pointer Interaction
    const handleCanvasPointer = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = clientX - p.x;
        const dy = clientY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= p.size + 18) {
          sounds.playBubblePop();
          spawnBurst(p.x, p.y, p.hue);

          // Reset particle position
          if (particleStyle === "snow") {
            p.y = -p.size - Math.random() * 20;
          } else if (particleStyle === "fireflies") {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
          } else {
            p.y = height + p.size + Math.random() * 30;
          }
          p.x = Math.random() * width;
          break;
        }
      }
    };

    window.addEventListener("click", handleCanvasPointer);
    window.addEventListener("touchstart", handleCanvasPointer, { passive: true });

    // --- DRAWING HELPERS ---

    // 1. Sparkle Star
    const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, alpha: number, hue: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = `hsla(${hue}, 95%, 75%, ${alpha})`;
      ctx.shadowColor = `hsla(${hue}, 95%, 70%, ${alpha})`;
      ctx.shadowBlur = 10;

      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(Math.cos((i * Math.PI) / 2) * r, Math.sin((i * Math.PI) / 2) * r);
        ctx.lineTo(
          Math.cos((i * Math.PI) / 2 + Math.PI / 4) * (r * 0.3),
          Math.sin((i * Math.PI) / 2 + Math.PI / 4) * (r * 0.3)
        );
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // 2. 3D Gold Coin
    const drawCoin = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);

      const grad = ctx.createLinearGradient(-r, -r, r, r);
      grad.addColorStop(0, `rgba(253, 224, 71, ${alpha})`);
      grad.addColorStop(0.5, `rgba(234, 179, 8, ${alpha})`);
      grad.addColorStop(1, `rgba(161, 98, 7, ${alpha})`);

      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = `rgba(234, 179, 8, ${alpha * 0.6})`;
      ctx.shadowBlur = 8;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(254, 240, 138, ${alpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
      ctx.font = `bold ${Math.max(9, Math.round(r * 1.1))}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", 0, 0);

      ctx.restore();
    };

    // 3. REAL BIOLUMINESCENT FIREFLY INSECT
    const drawFirefly = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      baseAlpha: number,
      rot: number,
      pulsePhase: number,
      hue: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);

      // Bioluminescent Glow Pulse (Sine wave light oscillation)
      const pulseFactor = 0.3 + 0.7 * Math.max(0, Math.sin(pulsePhase));
      const glowAlpha = baseAlpha * pulseFactor;
      const glowRadius = size * (2.2 + 0.8 * Math.sin(pulsePhase));

      // A. Outer Radial Bioluminescence Aura
      const grad = ctx.createRadialGradient(0, size * 0.4, 0, 0, size * 0.4, glowRadius);
      grad.addColorStop(0, `hsla(${hue}, 100%, 75%, ${glowAlpha})`);
      grad.addColorStop(0.35, `hsla(${hue}, 95%, 60%, ${glowAlpha * 0.5})`);
      grad.addColorStop(1, `hsla(${hue}, 85%, 45%, 0)`);

      ctx.beginPath();
      ctx.arc(0, size * 0.4, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // B. Fluttering Translucent Insect Wings
      const wingFlap = Math.sin(pulsePhase * 5) * 0.4;
      ctx.fillStyle = `rgba(240, 253, 244, ${baseAlpha * 0.65})`;

      // Left Wing
      ctx.beginPath();
      ctx.ellipse(
        -size * 0.5,
        -size * 0.15,
        size * 0.7,
        size * 0.32,
        -0.45 + wingFlap,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Right Wing
      ctx.beginPath();
      ctx.ellipse(
        size * 0.5,
        -size * 0.15,
        size * 0.7,
        size * 0.32,
        0.45 - wingFlap,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // C. Dark Firefly Body Silhouette (Head & Thorax)
      ctx.fillStyle = isDarkMode ? "rgba(20, 25, 35, 0.9)" : "rgba(40, 45, 55, 0.85)";

      // Head
      ctx.beginPath();
      ctx.arc(0, -size * 0.45, size * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Antennae
      ctx.strokeStyle = "rgba(200, 230, 200, 0.6)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-size * 0.1, -size * 0.6);
      ctx.lineTo(-size * 0.4, -size * 0.9);
      ctx.moveTo(size * 0.1, -size * 0.6);
      ctx.lineTo(size * 0.4, -size * 0.9);
      ctx.stroke();

      // Thorax
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // D. Glowing Abdomen Light Tip (Light bulb)
      ctx.fillStyle = `hsla(${hue}, 100%, 80%, ${glowAlpha * 0.95})`;
      ctx.beginPath();
      ctx.arc(0, size * 0.45, size * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // 4. REAL 6-BRANCH CRYSTALLINE SNOWFLAKE
    const drawSnowflake = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      alpha: number,
      rot: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);

      ctx.shadowColor = `rgba(255, 255, 255, ${alpha * 0.9})`;
      ctx.shadowBlur = size * 0.6;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
      ctx.lineWidth = Math.max(1.2, size * 0.14);

      // 6 Symmetric Geometric Crystal Branches
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -size);
        ctx.stroke();

        // Sub-barbs (Cross branches)
        const barbSize = size * 0.32;
        const barbPos = size * 0.55;

        ctx.beginPath();
        ctx.moveTo(0, -barbPos);
        ctx.lineTo(-barbSize, -barbPos - barbSize * 0.8);
        ctx.moveTo(0, -barbPos);
        ctx.lineTo(barbSize, -barbPos - barbSize * 0.8);
        ctx.stroke();

        ctx.rotate((Math.PI * 2) / 6);
      }

      // Center Crystal Hexagon Dot
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1.2, size * 0.18), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();

      ctx.restore();
    };

    // 5. FLUFFY 3D SNOWBALL
    const drawSnowball = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      alpha: number
    ) => {
      ctx.save();
      ctx.translate(x, y);

      const grad = ctx.createRadialGradient(-size * 0.3, -size * 0.3, size * 0.1, 0, 0, size);
      grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      grad.addColorStop(0.65, `rgba(240, 248, 255, ${alpha * 0.85})`);
      grad.addColorStop(1, `rgba(200, 225, 255, ${alpha * 0.25})`);

      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = `rgba(255, 255, 255, ${alpha * 0.8})`;
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.restore();
    };

    // --- RENDER LOOP ---
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.wobble += p.wobbleSpeed;
        p.rotation += p.rotSpeed;
        p.lightPulsePhase += p.lightPulseSpeed;

        if (particleStyle === "fireflies") {
          // Organic Firefly Flight: drift freely in curves
          p.x += Math.sin(p.wobble) * 0.8 + p.speedX;
          p.y += Math.cos(p.wobble * 0.7) * 0.8 + p.speedY;

          // Screen bounds wrap
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;
        } else if (particleStyle === "snow") {
          // Falling Snow Physics: Gravity down + gentle side sway
          p.y += p.speedY;
          p.x += Math.sin(p.wobble) * 0.6;
          if (p.y > height + p.size * 2) {
            p.y = -p.size * 2;
            p.x = Math.random() * width;
          }
        } else {
          // Rising Float Physics
          p.y -= p.speedY;
          p.x += p.speedX + Math.sin(p.wobble) * 0.4;
          if (p.y < -p.size * 2) {
            p.y = height + p.size * 2;
            p.x = Math.random() * width;
          }
        }

        const fillAlpha = isDarkMode ? p.alpha : p.alpha * 0.75;

        if (particleStyle === "fireflies") {
          drawFirefly(
            ctx,
            p.x,
            p.y,
            p.size,
            fillAlpha,
            p.rotation,
            p.lightPulsePhase,
            p.hue
          );
        } else if (particleStyle === "snow") {
          if (p.isSnowball) {
            drawSnowball(ctx, p.x, p.y, p.size * 0.8, fillAlpha);
          } else {
            drawSnowflake(ctx, p.x, p.y, p.size, fillAlpha, p.rotation);
          }
        } else if (particleStyle === "stars") {
          drawStar(ctx, p.x, p.y, p.size, fillAlpha, p.hue);
        } else if (particleStyle === "coins") {
          drawCoin(ctx, p.x, p.y, p.size, fillAlpha, p.rotation);
        } else {
          // Default: 3D Soap Bubbles
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

          const grad = ctx.createRadialGradient(
            p.x - p.size * 0.3,
            p.y - p.size * 0.3,
            p.size * 0.1,
            p.x,
            p.y,
            p.size
          );
          grad.addColorStop(0, `hsla(${p.hue}, 90%, 75%, ${fillAlpha * 0.6})`);
          grad.addColorStop(0.7, `hsla(${p.hue}, 85%, 60%, ${fillAlpha * 0.3})`);
          grad.addColorStop(1, `hsla(${p.hue}, 95%, 50%, 0.05)`);

          ctx.fillStyle = grad;
          ctx.fill();

          ctx.strokeStyle = isDarkMode
            ? `hsla(${p.hue}, 90%, 75%, ${fillAlpha * 0.8})`
            : `hsla(${p.hue}, 80%, 50%, ${fillAlpha * 0.6})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(
            p.x - p.size * 0.35,
            p.y - p.size * 0.35,
            Math.max(1.2, p.size * 0.22),
            0,
            Math.PI * 2
          );
          ctx.fillStyle = `rgba(255, 255, 255, ${isDarkMode ? 0.85 : 0.95})`;
          ctx.fill();
        }
      }

      // Draw burst particles on click
      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const bp = burstParticles[i];
        bp.x += bp.vx;
        bp.y += bp.vy;
        bp.alpha -= 0.04;

        if (bp.alpha <= 0) {
          burstParticles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(bp.x, bp.y, bp.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${bp.color}${bp.alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", handleCanvasPointer);
      window.removeEventListener("touchstart", handleCanvasPointer);
    };
  }, [isDarkMode, particleStyle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-auto z-0 cursor-pointer"
      style={{ touchAction: "manipulation" }}
    />
  );
};
