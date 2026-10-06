import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import brand from '../../data/brand.json';

/**
 * Hero steam: a full-quad fragment shader (fbm noise) rising from the bowl area.
 * - Mounted only on >= brand.motion.mobileFallbacks.below px and without prefers-reduced-motion
 *   (otherwise renders nothing: the static gradient/photo is the fallback).
 * - dpr capped at 1.25, antialias off, render loop paused when off-screen or tab hidden.
 */
const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(7.1, 3.7);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime;
    // wind sway grows with height
    float sway = (fbm(vec2(uv.y * 1.6 - t * 0.05, t * 0.07)) - 0.5) * 0.45 * uv.y;
    vec2 p = vec2((uv.x + sway) * 3.2, uv.y * 2.2 - t * 0.16);
    float warp = fbm(p + vec2(0.0, t * 0.05));
    float n = fbm(p + warp * 1.4);
    float density = smoothstep(0.38, 0.86, n);

    // plume mask: born near the bottom centre, widening and fading as it rises
    float width = mix(0.16, 0.5, uv.y);
    float column = 1.0 - smoothstep(0.0, width, abs(uv.x - 0.5));
    float rise = smoothstep(0.02, 0.22, uv.y) * (1.0 - smoothstep(0.45, 1.0, uv.y));
    float alpha = density * column * rise * 0.5;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

function SteamPlane({ running }: { running: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color(brand.colors.text) } }),
    [],
  );
  useFrame((_, delta) => {
    if (running && mat.current) mat.current.uniforms.uTime.value += Math.min(delta, 0.05);
  });
  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function SteamCanvas({ className = '' }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia(`(min-width: ${brand.motion.mobileFallbacks.below}px)`);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEnabled(desktop.matches && !reduce.matches);
    update();
    desktop.addEventListener('change', update);
    reduce.addEventListener('change', update);
    const onVis = () => setTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);
    return () => {
      desktop.removeEventListener('change', update);
      reduce.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !wrap.current) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, [enabled]);

  if (!enabled) return null;
  const running = inView && tabVisible;

  return (
    <div ref={wrap} aria-hidden="true" className={className}>
      <Canvas
        dpr={[1, 1.25]}
        frameloop={running ? 'always' : 'never'}
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        style={{ pointerEvents: 'none' }}
      >
        <SteamPlane running={running} />
      </Canvas>
    </div>
  );
}
