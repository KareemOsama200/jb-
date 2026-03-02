import React, { useRef, useEffect, useCallback } from 'react';

// ───── Utility: draw arrow ─────────────────────────────────────
function arrow(ctx, x1, y1, x2, y2, color = '#3b82f6', width = 2, head = 10) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - 0.4), y2 - head * Math.sin(angle - 0.4));
  ctx.lineTo(x2 - head * Math.cos(angle + 0.4), y2 - head * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
}

// ───── NABLA VISUAL ────────────────────────────────────────────
export function NablaVisual({ animate }) {
  const ref = useRef(null);
  const tRef = useRef(0);
  const frameRef = useRef(null);

  const draw = useCallback((t) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.03);

    // Draw three axes with animated glow
    const axes = [
      { label: 'x', x2: cx + 80, y2: cy, color: '#3b82f6' },
      { label: 'y', x2: cx, y2: cy - 80, color: '#8b5cf6' },
      { label: 'z', x2: cx + 50, y2: cy - 50, color: '#10b981' },
    ];
    axes.forEach(ax => {
      ctx.shadowColor = ax.color;
      ctx.shadowBlur = 8 + 10 * pulse;
      arrow(ctx, cx, cy, ax.x2, ax.y2, ax.color, 2.5, 10);
      ctx.shadowBlur = 0;
      ctx.fillStyle = ax.color;
      ctx.font = 'bold 14px Inter';
      ctx.fillText(ax.label, ax.x2 + 8, ax.y2 + 5);
    });

    // Draw nabla symbol
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur = 12 + 12 * pulse;
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 42px serif';
    ctx.fillText('∇', cx - 20, cy + 15);
    ctx.shadowBlur = 0;

    // Animated partial derivative labels
    const alpha = 0.6 + 0.4 * Math.sin(t * 0.05);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#334155';
    ctx.font = '13px JetBrains Mono, monospace';
    ctx.fillText('∂/∂x', cx + 88, cy + 5);
    ctx.fillText('∂/∂y', cx + 3, cy - 88);
    ctx.fillText('∂/∂z', cx + 55, cy - 58);
    ctx.globalAlpha = 1;

    // Orbit dots
    for (let i = 0; i < 3; i++) {
      const a = t * 0.02 + (i * 2 * Math.PI) / 3;
      const r = 100;
      const ox = cx + r * Math.cos(a);
      const oy = cy + r * Math.sin(a);
      const colors = ['#3b82f6', '#8b5cf6', '#10b981'];
      ctx.beginPath();
      ctx.arc(ox, oy, 4, 0, 2 * Math.PI);
      ctx.fillStyle = colors[i];
      ctx.fill();
    }
  }, []);

  useEffect(() => {
    if (!animate) { draw(0); return; }
    const loop = () => {
      tRef.current++;
      draw(tRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate, draw]);

  return (
    <canvas
      ref={ref}
      width={280}
      height={280}
      style={{ display: 'block', margin: '0 auto' }}
    />
  );
}

// ───── GRADIENT 3D VISUAL (surface + arrows) ──────────────────
export function Gradient3DVisual({ animate }) {
  const ref = useRef(null);
  const tRef = useRef(0);
  const frameRef = useRef(null);

  const draw = useCallback((t) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Draw a simple 3D surface (paraboloid)
    const cx = W / 2, cy = H * 0.55;
    const scale = 1.1 + 0.05 * Math.sin(t * 0.02);

    // Grid lines
    for (let i = -4; i <= 4; i++) {
      const x0 = cx + i * 20 * scale;
      const y0 = cy + Math.pow(i * 0.8, 2) * 4;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      for (let j = -4; j <= 4; j++) {
        const y1 = cy - j * 12 * scale + Math.pow(i * 0.7, 2) * 4;
        const x1 = cx + i * 20 * scale + j * 10 * scale;
        if (j === -4) ctx.moveTo(x1, y1);
        else ctx.lineTo(x1, y1);
      }
      ctx.strokeStyle = 'rgba(99,102,241,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    for (let j = -4; j <= 4; j++) {
      ctx.beginPath();
      for (let i = -4; i <= 4; i++) {
        const x1 = cx + i * 20 * scale + j * 10 * scale;
        const y1 = cy - j * 12 * scale + Math.pow(i * 0.7, 2) * 4;
        if (i === -4) ctx.moveTo(x1, y1);
        else ctx.lineTo(x1, y1);
      }
      ctx.strokeStyle = 'rgba(59,130,246,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Gradient arrows (animated)
    const pts = [
      { i: -2, j: -1 }, { i: 0, j: 0 }, { i: 2, j: 1 }, { i: -1, j: 2 },
    ];
    pts.forEach((p, idx) => {
      const phase = t * 0.04 + idx * 1.2;
      const px = cx + p.i * 20 * scale + p.j * 10 * scale;
      const py = cy - p.j * 12 * scale + Math.pow(p.i * 0.7, 2) * 4;
      const len = 28 + 6 * Math.sin(phase);
      const gx = p.i * 1.5, gy = -p.j * 1.5 - p.i * 0.5;
      const mag = Math.sqrt(gx * gx + gy * gy) || 1;
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 8;
      arrow(ctx, px, py, px + (gx / mag) * len, py + (gy / mag) * len, '#3b82f6', 2, 8);
      ctx.shadowBlur = 0;
    });

    // Label
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 13px Inter';
    ctx.fillText('∇ϕ arrows show direction of max increase', 10, 20);
  }, []);

  useEffect(() => {
    if (!animate) { draw(0); return; }
    const loop = () => {
      tRef.current++;
      draw(tRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate, draw]);

  return <canvas ref={ref} width={280} height={240} style={{ display: 'block', margin: '0 auto' }} />;
}

// ───── NORMAL SURFACE VISUAL ──────────────────────────────────
export function NormalSurfaceVisual({ animate }) {
  const ref = useRef(null);
  const tRef = useRef(0);
  const frameRef = useRef(null);

  const draw = useCallback((t) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H * 0.6;

    // Draw ellipse (level surface)
    const tilt = 0.15 * Math.sin(t * 0.01);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    ctx.beginPath();
    ctx.ellipse(0, 0, 90, 45, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(99,102,241,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(99,102,241,0.05)';
    ctx.fill();
    // Label
    ctx.fillStyle = '#6366f1';
    ctx.font = 'italic 13px serif';
    ctx.fillText('ϕ = c', 60, 10);
    ctx.restore();

    // Point on surface
    const ang = 0.9 + 0.1 * Math.sin(t * 0.015);
    const px = cx + 90 * Math.cos(ang);
    const py = cy - 45 * Math.sin(ang) + tilt * 20;

    // Tangent arrows
    const tx = -Math.sin(ang) * 50, ty = Math.cos(ang) * 25;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(px - tx * 0.6, py - ty * 0.6);
    ctx.lineTo(px + tx * 0.6, py + ty * 0.6);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter';
    ctx.fillText('tangent', px + tx * 0.5 + 4, py + ty * 0.5);

    // Normal (gradient) arrow
    const nx = Math.cos(ang) * 60, ny = -Math.sin(ang) * 30;
    const pulse = 1 + 0.15 * Math.sin(t * 0.05);
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 10;
    arrow(ctx, px, py, px + nx * pulse, py + ny * pulse, '#3b82f6', 3, 12);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 13px serif';
    ctx.fillText('∇ϕ', px + nx * pulse + 6, py + ny * pulse);

    // Dot at point
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.font = '12px Inter';
    ctx.fillText('P', px + 8, py - 8);

    // Label
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 13px Inter';
    ctx.fillText('∇ϕ ⊥ surface', 10, 20);
  }, []);

  useEffect(() => {
    if (!animate) { draw(0); return; }
    const loop = () => {
      tRef.current++;
      draw(tRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate, draw]);

  return <canvas ref={ref} width={280} height={220} style={{ display: 'block', margin: '0 auto' }} />;
}

// ───── DIRECTIONAL DERIVATIVE VISUAL ─────────────────────────
export function DirectionalVisual({ animate }) {
  const ref = useRef(null);
  const tRef = useRef(0);
  const frameRef = useRef(null);

  const draw = useCallback((t) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;

    // Draw contours
    for (let r = 20; r <= 120; r += 25) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.6, 0, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(99,102,241,${0.1 + 0.05 * (120 - r) / 100})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Gradient direction (max)
    const pulse = 1 + 0.1 * Math.sin(t * 0.04);
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 12;
    arrow(ctx, cx, cy, cx + 90 * pulse, cy - 40 * pulse, '#3b82f6', 3, 12);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 12px serif';
    ctx.fillText('∇ϕ (max)', cx + 92 * pulse, cy - 42 * pulse);

    // Arbitrary direction
    const angle = -0.8 + 0.2 * Math.sin(t * 0.02);
    const len = 70;
    arrow(ctx, cx, cy, cx + len * Math.cos(angle), cy + len * Math.sin(angle), '#10b981', 2, 10);
    ctx.fillStyle = '#10b981';
    ctx.font = '12px Inter';
    ctx.fillText('â', cx + len * Math.cos(angle) + 6, cy + len * Math.sin(angle));

    // dϕ/ds label
    ctx.fillStyle = '#ef4444';
    ctx.font = '13px serif';
    ctx.fillText('dϕ/ds = ∇ϕ · â', cx - 60, cy + 80);

    // Point
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#334155';
    ctx.fill();
  }, []);

  useEffect(() => {
    if (!animate) { draw(0); return; }
    const loop = () => {
      tRef.current++;
      draw(tRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate, draw]);

  return <canvas ref={ref} width={280} height={220} style={{ display: 'block', margin: '0 auto' }} />;
}

// ───── DIVERGENCE VISUAL ──────────────────────────────────────
export function DivergenceVisual({ animate }) {
  const ref = useRef(null);
  const tRef = useRef(0);
  const frameRef = useRef(null);

  const draw = useCallback((t) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;

    const N = 5;
    const step = 40;

    for (let i = -N; i <= N; i++) {
      for (let j = -N; j <= N; j++) {
        const x = cx + i * step;
        const y = cy + j * step;
        if (x < 10 || x > W - 10 || y < 10 || y > H - 10) continue;

        // Source-like field
        const dx = i, dy = j;
        const mag = Math.sqrt(dx * dx + dy * dy) || 1;
        const phase = t * 0.04;
        const len = (10 + 5 * Math.sin(phase + i + j)) / mag * 0.9;
        const nx = (dx / mag) * Math.min(len, 18);
        const ny = (dy / mag) * Math.min(len, 18);

        const distFromCenter = Math.sqrt(i * i + j * j);
        const alpha = Math.max(0.2, 1 - distFromCenter / (N + 1));
        const col = distFromCenter < 1.5 ? '#ef4444' :
                    distFromCenter < 3 ? '#f59e0b' : '#3b82f6';

        ctx.globalAlpha = alpha;
        arrow(ctx, x, y, x + nx, y + ny, col, 1.5, 6);
        ctx.globalAlpha = 1;
      }
    }

    // Center label
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 12px Inter';
    ctx.fillText('source (∇·V > 0)', cx + 12, cy + 5);
  }, []);

  useEffect(() => {
    if (!animate) { draw(0); return; }
    const loop = () => {
      tRef.current++;
      draw(tRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate, draw]);

  return <canvas ref={ref} width={280} height={240} style={{ display: 'block', margin: '0 auto' }} />;
}

// ───── CURL VISUAL ────────────────────────────────────────────
export function CurlVisual({ animate }) {
  const ref = useRef(null);
  const tRef = useRef(0);
  const frameRef = useRef(null);

  const draw = useCallback((t) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;

    const N = 4;
    const step = 38;

    for (let i = -N; i <= N; i++) {
      for (let j = -N; j <= N; j++) {
        const x = cx + i * step;
        const y = cy + j * step;
        if (x < 8 || x > W - 8 || y < 8 || y > H - 8) continue;

        // Rotational field: (-y, x)
        const dx = -j, dy = i;
        const mag = Math.sqrt(dx * dx + dy * dy) || 1;
        const len = 12 / mag * step * 0.25;
        const phase = t * 0.03;
        const animated_len = len * (1 + 0.15 * Math.sin(phase + i * 0.5 + j * 0.5));

        const distFromCenter = Math.sqrt(i * i + j * j);
        const alpha = Math.max(0.3, 1 - distFromCenter / (N + 2));
        const hue = 260 + distFromCenter * 10;

        ctx.globalAlpha = alpha;
        arrow(ctx, x, y,
          x + (dx / mag) * animated_len,
          y + (dy / mag) * animated_len,
          `hsl(${hue},80%,50%)`, 1.8, 7);
        ctx.globalAlpha = 1;
      }
    }

    // Curl axis arrow
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 14;
    arrow(ctx, cx, cy, cx, cy - 55, '#8b5cf6', 3, 12);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#6b21a8';
    ctx.font = 'bold 13px serif';
    ctx.fillText('∇×V', cx + 6, cy - 58);

    // Circular arrow hint
    ctx.strokeStyle = 'rgba(139,92,246,0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, 1.8 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  useEffect(() => {
    if (!animate) { draw(0); return; }
    const loop = () => {
      tRef.current++;
      draw(tRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate, draw]);

  return <canvas ref={ref} width={280} height={240} style={{ display: 'block', margin: '0 auto' }} />;
}

// ───── IDENTITIES VISUAL ──────────────────────────────────────
export function IdentitiesVisual({ animate }) {
  const ref = useRef(null);
  const tRef = useRef(0);
  const frameRef = useRef(null);

  const draw = useCallback((t) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const pulse = 0.5 + 0.5 * Math.sin(t * 0.04);
    const nodes = [
      { x: W * 0.25, y: H * 0.3, label: 'ϕ', color: '#3b82f6', type: 'scalar' },
      { x: W * 0.75, y: H * 0.3, label: 'A', color: '#8b5cf6', type: 'vector' },
      { x: W * 0.25, y: H * 0.7, label: '∇ϕ', color: '#10b981', type: 'vector' },
      { x: W * 0.75, y: H * 0.7, label: '∇×A', color: '#f59e0b', type: 'vector' },
    ];

    // Draw connections
    const conns = [
      { from: 0, to: 2, label: '∇', color: '#3b82f6' },
      { from: 1, to: 3, label: '∇×', color: '#8b5cf6' },
      { from: 2, to: 0, label: '∇× = 0', color: '#10b981', dashed: true },
      { from: 3, to: 1, label: '∇· = 0', color: '#f59e0b', dashed: true },
    ];

    conns.forEach(c => {
      const f = nodes[c.from], t2 = nodes[c.to];
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 2;
      if (c.dashed) {
        ctx.setLineDash([5, 5]);
        ctx.globalAlpha = 0.5 + 0.3 * pulse;
      }
      ctx.beginPath();
      ctx.moveTo(f.x, f.y);
      ctx.lineTo(t2.x, t2.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.fillStyle = c.color;
      ctx.font = '11px Inter';
      ctx.fillText(c.label, (f.x + t2.x) / 2 + 4, (f.y + t2.y) / 2);
    });

    // Draw nodes
    nodes.forEach(n => {
      ctx.shadowColor = n.color;
      ctx.shadowBlur = 8 + 8 * pulse;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 22, 0, 2 * Math.PI);
      ctx.fillStyle = n.color + '22';
      ctx.fill();
      ctx.strokeStyle = n.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.label, n.x, n.y);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    });
  }, []);

  useEffect(() => {
    if (!animate) { draw(0); return; }
    const loop = () => {
      tRef.current++;
      draw(tRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate, draw]);

  return <canvas ref={ref} width={280} height={200} style={{ display: 'block', margin: '0 auto' }} />;
}

// ───── LAPLACIAN VISUAL ───────────────────────────────────────
export function LaplacianVisual({ animate }) {
  const ref = useRef(null);
  const tRef = useRef(0);
  const frameRef = useRef(null);

  const draw = useCallback((t) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const N = 20, step = W / N;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const x = i / N, y = j / N;
        // Simple heat-like: exponential decay from center
        const cx = 0.5, cy = 0.5;
        const r2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
        const val = Math.exp(-r2 * 8 - 0.001 * t) * Math.cos(t * 0.03 + r2 * 15);
        const hue = 220 + val * 80;
        const light = 50 + val * 30;
        ctx.fillStyle = `hsl(${hue},70%,${light}%)`;
        ctx.fillRect(i * step, j * step, step + 1, step + 1);
      }
    }

    // Overlay label
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(6, 4, 185, 22);
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 12px Inter';
    ctx.fillText('∇²ϕ — Heat / Diffusion', 10, 20);
  }, []);

  useEffect(() => {
    if (!animate) { draw(0); return; }
    const loop = () => {
      tRef.current++;
      draw(tRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate, draw]);

  return <canvas ref={ref} width={280} height={200} style={{ display: 'block', margin: '0 auto', borderRadius: '8px' }} />;
}

// ───── GRADIENT CALC VISUAL ───────────────────────────────────
export function GradientCalcVisual({ animate }) {
  const ref = useRef(null);
  const tRef = useRef(0);
  const frameRef = useRef(null);

  const draw = useCallback((t) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;

    // Draw 2D level curves of phi = 2y^2 - 3xz
    for (let k = -3; k <= 3; k++) {
      ctx.beginPath();
      for (let x = -100; x <= 100; x += 2) {
        // Simplified: project onto 2D plane
        const px = cx + x;
        const val = k * 20;
        const y = (val + 3 * (x / 40) * 2) / (2 * Math.max(0.01, Math.abs(x / 40)));
        const py = cy - y * 8;
        if (x === -100) ctx.moveTo(px, Math.max(10, Math.min(H - 10, py)));
        else ctx.lineTo(px, Math.max(10, Math.min(H - 10, py)));
      }
      ctx.strokeStyle = `rgba(99,102,241,${0.15 + Math.abs(k) * 0.04})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Gradient vector at (1,-1,2)
    const pulse = 1 + 0.1 * Math.sin(t * 0.05);
    const gx = -6 * 14, gy = -4 * 14, gz = 9 * 14; // projected
    const projected_x = gx * 0.5 - gz * 0.3;
    const projected_y = gy * 0.5 - gz * 0.2;
    const mag = Math.sqrt(projected_x ** 2 + projected_y ** 2);
    const scale = 60 * pulse / mag;

    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 10;
    arrow(ctx, cx, cy, cx + projected_x * scale, cy + projected_y * scale, '#3b82f6', 3, 12);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 12px serif';
    ctx.fillText('∇ϕ at (1,−1,2)', cx + projected_x * scale + 5, cy + projected_y * scale);

    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.font = '11px Inter';
    ctx.fillText('(1,−1,2)', cx + 8, cy - 8);
  }, []);

  useEffect(() => {
    if (!animate) { draw(0); return; }
    const loop = () => {
      tRef.current++;
      draw(tRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate, draw]);

  return <canvas ref={ref} width={280} height={220} style={{ display: 'block', margin: '0 auto' }} />;
}

// ───── CURL CALC VISUAL ───────────────────────────────────────
export function CurlCalcVisual({ animate }) {
  return <CurlVisual animate={animate} />;
}

// ───── GAUSS THEOREM VISUAL ───────────────────────────────────
export function GaussVisual({ animate }) {
  const ref = useRef(null);
  const tRef = useRef(0);
  const frameRef = useRef(null);

  const draw = useCallback((t) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;

    // Draw sphere outline
    const r = 70;
    const pulse = 1 + 0.05 * Math.sin(t * 0.03);
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * pulse, r * pulse * 0.5, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(30,58,138,0.5)';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(59,130,246,0.05)';
    ctx.fill();
    ctx.stroke();

    // Outward arrows (flux)
    const N = 12;
    for (let i = 0; i < N; i++) {
      const ang = (i / N) * 2 * Math.PI + t * 0.01;
      const rx = cx + r * pulse * Math.cos(ang);
      const ry = cy + r * pulse * 0.5 * Math.sin(ang);
      const phase = t * 0.04 + i;
      const len = 20 + 6 * Math.sin(phase);
      const nx = Math.cos(ang), ny = Math.sin(ang) * 0.5;
      const nmag = Math.sqrt(nx * nx + ny * ny);
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 6;
      arrow(ctx, rx, ry,
        rx + (nx / nmag) * len,
        ry + (ny / nmag) * len,
        '#3b82f6', 1.8, 8);
      ctx.shadowBlur = 0;
    }

    // Volume indicator
    ctx.fillStyle = 'rgba(99,102,241,0.08)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.4, r * 0.2, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Labels
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('∯ F·dS = ∭ ∇·F dV', cx, H - 12);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.font = '11px Inter';
    ctx.fillText('V', cx - 5, cy + 5);
    ctx.fillText('S', cx + r * pulse + 6, cy);
  }, []);

  useEffect(() => {
    if (!animate) { draw(0); return; }
    const loop = () => {
      tRef.current++;
      draw(tRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate, draw]);

  return <canvas ref={ref} width={280} height={220} style={{ display: 'block', margin: '0 auto' }} />;
}

// ───── STOKES THEOREM VISUAL ──────────────────────────────────
export function StokesVisual({ animate }) {
  const ref = useRef(null);
  const tRef = useRef(0);
  const frameRef = useRef(null);

  const draw = useCallback((t) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H * 0.55;

    // Draw surface (parallelogram in 3D projection)
    const pts = [
      { x: cx - 70, y: cy + 30 },
      { x: cx + 50, y: cy - 10 },
      { x: cx + 80, y: cy - 50 },
      { x: cx - 40, y: cy - 10 },
    ];
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = 'rgba(139,92,246,0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(139,92,246,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Boundary curve with animation
    const progress = ((t * 0.02) % (2 * Math.PI));
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let a = 0; a <= progress; a += 0.05) {
      const x = cx + 65 * Math.cos(a) * Math.cos(0.4) - 20 * Math.sin(a) * Math.sin(0.4);
      const y = cy - 25 * Math.sin(a) + Math.cos(a) * 10;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Normal arrow
    const pulse = 1 + 0.12 * Math.sin(t * 0.05);
    arrow(ctx, cx, cy - 10, cx, cy - 10 - 55 * pulse, '#10b981', 3, 12);
    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 12px serif';
    ctx.fillText('n̂', cx + 6, cy - 10 - 58 * pulse);

    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('∮ F·dr = ∬ (∇×F)·dS', cx, H - 10);
    ctx.textAlign = 'left';
  }, []);

  useEffect(() => {
    if (!animate) { draw(0); return; }
    const loop = () => {
      tRef.current++;
      draw(tRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate, draw]);

  return <canvas ref={ref} width={280} height={220} style={{ display: 'block', margin: '0 auto' }} />;
}

// ───── POTENTIAL VISUAL ───────────────────────────────────────
export function PotentialVisual({ animate }) {
  const ref = useRef(null);
  const tRef = useRef(0);
  const frameRef = useRef(null);

  const draw = useCallback((t) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;

    // Equipotential circles (concentric)
    for (let r = 20; r <= 100; r += 20) {
      const alpha = 0.5 - r / 250;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(245,158,11,${alpha + 0.1})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = `rgba(245,158,11,${alpha * 0.5})`;
      ctx.fill();
    }

    // Force arrows pointing outward (away from charge)
    const N = 8;
    for (let i = 0; i < N; i++) {
      const ang = (i / N) * 2 * Math.PI;
      const r0 = 30;
      const r1 = 70;
      const x0 = cx + r0 * Math.cos(ang);
      const y0 = cy + r0 * Math.sin(ang);
      const x1 = cx + r1 * Math.cos(ang);
      const y1 = cy + r1 * Math.sin(ang);
      const phase = t * 0.04 + i * 0.5;
      const blend = 0.3 + 0.7 * ((Math.sin(phase) + 1) / 2);
      const xm = x0 + (x1 - x0) * blend;
      const ym = y0 + (y1 - y0) * blend;
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 6;
      arrow(ctx, x0, y0, xm, ym, '#3b82f6', 2, 8);
      ctx.shadowBlur = 0;
    }

    // Center
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 12px serif';
    ctx.textAlign = 'center';
    ctx.fillText('+q', cx, cy + 22);
    ctx.fillText('F = −∇V', cx, H - 10);
    ctx.textAlign = 'left';
  }, []);

  useEffect(() => {
    if (!animate) { draw(0); return; }
    const loop = () => {
      tRef.current++;
      draw(tRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate, draw]);

  return <canvas ref={ref} width={280} height={220} style={{ display: 'block', margin: '0 auto' }} />;
}

// ───── FIELDS VISUAL ──────────────────────────────────────────
export function FieldsVisual({ animate }) {
  const ref = useRef(null);
  const tRef = useRef(0);
  const frameRef = useRef(null);

  const draw = useCallback((t) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Left: scalar field heatmap
    const half = W / 2 - 5;
    for (let i = 0; i < half; i += 4) {
      for (let j = 0; j < H; j += 4) {
        const x = i / half, y = j / H;
        const val = Math.sin(x * 8 + t * 0.02) * Math.cos(y * 6) * 0.5 + 0.5;
        const hue = 200 + val * 60;
        ctx.fillStyle = `hsl(${hue},80%,${40 + val * 30}%)`;
        ctx.fillRect(i, j, 4, 4);
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(5, 5, 105, 20);
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 11px Inter';
    ctx.fillText('Scalar field ϕ', 8, 19);

    // Right: vector field
    const ox = half + 10;
    const step = 28;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        const x = ox + i * step + 10;
        const y = j * step + 15;
        const dx = Math.sin(j * 0.8 + t * 0.02);
        const dy = Math.cos(i * 0.8 + t * 0.02);
        const len = 10;
        ctx.shadowColor = '#8b5cf6';
        ctx.shadowBlur = 4;
        arrow(ctx, x, y, x + dx * len, y + dy * len, '#8b5cf6', 1.5, 6);
        ctx.shadowBlur = 0;
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(ox + 2, 5, 115, 20);
    ctx.fillStyle = '#6b21a8';
    ctx.font = 'bold 11px Inter';
    ctx.fillText('Vector field V', ox + 5, 19);
  }, []);

  useEffect(() => {
    if (!animate) { draw(0); return; }
    const loop = () => {
      tRef.current++;
      draw(tRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate, draw]);

  return <canvas ref={ref} width={280} height={200} style={{ display: 'block', margin: '0 auto' }} />;
}

// ───── COORDINATES VISUAL ─────────────────────────────────────
export function CoordinatesVisual({ animate }) {
  const ref = useRef(null);
  const tRef = useRef(0);
  const frameRef = useRef(null);

  const draw = useCallback((t) => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2 + 10;

    const angle = t * 0.015;

    // Spherical coords illustration
    // Draw sphere arcs
    ctx.strokeStyle = 'rgba(30,58,138,0.25)';
    ctx.lineWidth = 1;
    for (let th = 0; th <= Math.PI; th += Math.PI / 5) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, 80 * Math.sin(th), 30 * Math.sin(th), 0, 0, 2 * Math.PI);
      ctx.stroke();
    }
    for (let phi = 0; phi < 2 * Math.PI; phi += Math.PI / 3) {
      ctx.beginPath();
      ctx.ellipse(cx + 0, cy - 0, 5, 80, phi, 0, Math.PI);
      ctx.stroke();
    }

    // r vector
    const rx = 80 * Math.sin(0.8) * Math.cos(angle);
    const rz = 80 * Math.cos(0.8);
    const ry_proj = 80 * Math.sin(0.8) * Math.sin(angle) * 0.35;
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 10;
    arrow(ctx, cx, cy, cx + rx, cy - rz * 0.6 + ry_proj, '#3b82f6', 3, 12);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 13px serif';
    ctx.fillText('r', cx + rx + 5, cy - rz * 0.6 + ry_proj);

    // theta arc
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, -Math.PI / 2, -Math.PI / 2 + 0.8, false);
    ctx.stroke();
    ctx.fillStyle = '#d97706';
    ctx.font = '12px serif';
    ctx.fillText('θ', cx + 12, cy - 22);

    // phi arc
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 25, 10, 0, 0, angle);
    ctx.stroke();
    ctx.fillStyle = '#065f46';
    ctx.font = '12px serif';
    ctx.fillText('φ', cx + 20, cy + 15);

    // Label
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Spherical Coordinates (r, θ, φ)', cx, H - 8);
    ctx.textAlign = 'left';
  }, []);

  useEffect(() => {
    if (!animate) { draw(0); return; }
    const loop = () => {
      tRef.current++;
      draw(tRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate, draw]);

  return <canvas ref={ref} width={280} height={220} style={{ display: 'block', margin: '0 auto' }} />;
}

// ───── VISUAL REGISTRY ────────────────────────────────────────
export function VisualForType({ type, animate }) {
  switch (type) {
    case 'nabla':        return <NablaVisual animate={animate} />;
    case 'gradient3d':   return <Gradient3DVisual animate={animate} />;
    case 'normalSurface':return <NormalSurfaceVisual animate={animate} />;
    case 'directional':  return <DirectionalVisual animate={animate} />;
    case 'divergence':   return <DivergenceVisual animate={animate} />;
    case 'curl':         return <CurlVisual animate={animate} />;
    case 'identities':   return <IdentitiesVisual animate={animate} />;
    case 'laplacian':    return <LaplacianVisual animate={animate} />;
    case 'gradientCalc': return <GradientCalcVisual animate={animate} />;
    case 'curlCalc':     return <CurlCalcVisual animate={animate} />;
    case 'gaussThm':     return <GaussVisual animate={animate} />;
    case 'stokesThm':    return <StokesVisual animate={animate} />;
    case 'potential':    return <PotentialVisual animate={animate} />;
    case 'fields':       return <FieldsVisual animate={animate} />;
    case 'coordinates':  return <CoordinatesVisual animate={animate} />;
    default:             return <NablaVisual animate={animate} />;
  }
}
