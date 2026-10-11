import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CFG } from '../config';
import { REDUCED_MOTION } from '../lib/storage';
import { clock } from './clock';
import { rng } from './util';

// Distant background stars: one Points cloud with a small twinkle shader.
export function StarField({ count = 5200, rMin = 150, rMax = 700, seed = 9 }) {
  const points = useMemo(() => {
    const r = rng(seed);
    const pos = new Float32Array(count * 3), col = new Float32Array(count * 3), sz = new Float32Array(count), ph = new Float32Array(count);
    const palette = ['#fbf6ea', '#fbf6ea', '#f1e2bd', '#d9e5f5', '#c6d7ee'];
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const u = r() * 2 - 1, th = r() * Math.PI * 2, s = Math.sqrt(1 - u * u), rad = rMin + (rMax - rMin) * Math.cbrt(r());
      pos[i * 3] = s * Math.cos(th) * rad;
      pos[i * 3 + 1] = u * rad;
      pos[i * 3 + 2] = s * Math.sin(th) * rad;
      c.set(palette[(r() * palette.length) | 0]);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      sz[i] = 0.7 + Math.pow(r(), 6) * 3.2;
      ph[i] = r() * Math.PI * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPR: { value: 1 }, uTw: { value: 1 } },
      vertexShader: `attribute vec3 aColor; attribute float aSize; attribute float aPhase;
        uniform float uTime; uniform float uPR; uniform float uTw; varying vec3 vC; varying float vA;
        void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv;
          vA = mix(1.0, 0.6 + 0.4*sin(uTime*(0.5+fract(aPhase)*0.9) + aPhase*7.0), uTw);
          gl_PointSize = aSize * uPR * 2.2; vC = aColor; }`,
      fragmentShader: `varying vec3 vC; varying float vA;
        void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; float a = smoothstep(0.5, 0.0, d); a *= a; gl_FragColor = vec4(vC * a, a * vA * 0.9); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    return new THREE.Points(g, m);
  }, [count, rMin, rMax, seed]);

  useEffect(() => () => { points.geometry.dispose(); (points.material as THREE.Material).dispose(); }, [points]);

  useFrame(({ gl }) => {
    const u = (points.material as THREE.ShaderMaterial).uniforms;
    u.uTime.value = clock.now;
    u.uPR.value = gl.getPixelRatio();
    u.uTw.value = REDUCED_MOTION ? 0 : CFG.twinkle;
  });

  return <primitive object={points} />;
}
