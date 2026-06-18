import * as React from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const COLORS = [
  "#7477b8", // lumi-purple
  "#2c6789", // lumi-blue
  "#ec008c", // lumi-magenta
];

export function Confetti({ active }: { active: boolean }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const particlesRef = React.useRef<Particle[]>([]);
  const rafRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();

    const particles: Particle[] = [];
    const count = Math.min(160, Math.floor(canvas.clientWidth / 6));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.clientWidth / 2 + (Math.random() - 0.5) * 400,
        y: canvas.clientHeight / 2 - 20,
        vx: (Math.random() - 0.5) * 24,
        vy: Math.random() * -20 - 8,
        size: Math.random() * 4 + 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        opacity: 1,
      });
    }
    particlesRef.current = particles;

    let frame = 0;
    const gravity = 0.175;
    const drag = 0.98;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      let alive = 0;
      for (const p of particlesRef.current) {
        if (p.opacity <= 0) continue;
        alive++;

        p.vy += gravity;
        p.vx *= drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Fade out after apex
        if (frame > 60) {
          p.opacity -= 0.006;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        // Draw small rounded rectangle
        const s = p.size;
        ctx.beginPath();
        ctx.roundRect(-s / 2, -s / 2, s, s * 0.6, 1);
        ctx.fill();
        ctx.restore();
      }

      frame++;
      if (alive > 0) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      style={{ imageRendering: "auto" }}
    />
  );
}
