import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { CFG, T } from '../config';
import { on } from '../lib/events';
import { REDUCED_MOTION as RM } from '../lib/storage';
import { clock } from './clock';

interface Meteor { x: number; y: number; dx: number; dy: number; speed: number; len: number; width: number; dur: number; life: number; h: number; s: number; l: number }

// Meteors are drawn on a 2D canvas between the 3D sky and the labels, so trails can have real width,
// a soft head glow and a fading tail (WebGL lines are always 1px).
// One meteor every meteorEveryMin–Max seconds after the entry sequence: any direction, random speed, length, width and color.
export function Meteors({ canvas }: { canvas: HTMLCanvasElement }) {
  const sky = useMemo(() => {
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const state = {
      list: [] as Meteor[], next: T.meteor, W: 1, H: 1, dpr: 1,
      launch() {
        const angle = rand(0, Math.PI * 2), dx = Math.cos(angle), dy = Math.sin(angle);
        const dist = rand(0.25, 0.55) * Math.max(state.W, state.H), speed = rand(CFG.meteorSpeedMin, CFG.meteorSpeedMax);
        // (x, y) is where the streak is halfway through its flight.
        const x = rand(0.1, 0.9) * state.W, y = rand(0.1, 0.9) * state.H;
        state.list.push({
          x: x - (dx * dist) / 2, y: y - (dy * dist) / 2, dx, dy, speed, dur: dist / speed, life: 0,
          len: rand(CFG.meteorLenMin, CFG.meteorLenMax), width: rand(CFG.meteorWidthMin, CFG.meteorWidthMax),
          h: Math.round(Math.random() * 360), s: Math.round(rand(55, 90)), l: Math.round(rand(70, 82)),
        });
      },
    };
    return state;
  }, []);

  useEffect(() => {
    const fit = () => {
      sky.dpr = Math.min(window.devicePixelRatio || 1, 2);
      sky.W = canvas.clientWidth || 1;
      sky.H = canvas.clientHeight || 1;
      canvas.width = Math.round(sky.W * sky.dpr);
      canvas.height = Math.round(sky.H * sky.dpr);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    fit();
    const offReplay = on('replay', () => { sky.list.length = 0; sky.next = T.meteor; });
    const offFire = on('meteor', () => { if (!RM) sky.launch(); });
    return () => { ro.disconnect(); offReplay(); offFire(); };
  }, [canvas, sky]);

  useFrame(() => {
    if (RM) return;
    const dt = clock.dt, ctx = canvas.getContext('2d');
    if (!ctx) return;
    if ((sky.next -= dt) <= 0) {
      sky.next = CFG.meteorEveryMin + Math.random() * (CFG.meteorEveryMax - CFG.meteorEveryMin);
      sky.launch();
    }
    ctx.setTransform(sky.dpr, 0, 0, sky.dpr, 0, 0);
    ctx.clearRect(0, 0, sky.W, sky.H);
    if (!sky.list.length) return;
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = sky.list.length - 1; i >= 0; i--) {
      const m = sky.list[i];
      m.life += dt / m.dur;
      if (m.life >= 1) { sky.list.splice(i, 1); continue; }
      m.x += m.dx * m.speed * dt;
      m.y += m.dy * m.speed * dt;
      const a = Math.min(1, m.life * 5) * Math.pow(1 - m.life, 0.8), L = m.len * Math.min(1, m.life * 4);
      const tx = m.x - m.dx * L, ty = m.y - m.dy * L;
      const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
      g.addColorStop(0, `hsla(${m.h},${m.s}%,${m.l}%,${a})`);
      g.addColorStop(0.3, `hsla(${m.h},${m.s}%,${m.l - 6}%,${a * 0.4})`);
      g.addColorStop(1, `hsla(${m.h},${m.s}%,${m.l}%,0)`);
      ctx.strokeStyle = g;
      ctx.lineWidth = m.width;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
      const r = m.width * 3.4, hg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, r);
      hg.addColorStop(0, `hsla(${m.h},${m.s}%,94%,${a})`);
      hg.addColorStop(1, `hsla(${m.h},${m.s}%,${m.l}%,0)`);
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.arc(m.x, m.y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  });

  return null;
}
