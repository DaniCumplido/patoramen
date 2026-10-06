import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Liquid hover distortion for dish photography.
 * Cover-fit UVs, pointer-centred ripple + subtle chromatic split, eased in/out through `hovered`.
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
  uniform sampler2D uTex;
  uniform vec2 uScale;     // cover-fit scale
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uTime;
  uniform float uAspect;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
  }

  void main() {
    vec2 uv = (vUv - 0.5) * uScale + 0.5;
    vec2 d = vUv - uMouse;
    d.x *= uAspect;
    float dist = length(d);
    float ripple = smoothstep(0.55, 0.0, dist);
    float wave = sin(dist * 22.0 - uTime * 2.4) * 0.5 + 0.5;
    vec2 dir = normalize(d + 0.0001);
    float n = noise(vUv * 5.0 + uTime * 0.35) - 0.5;
    vec2 offset = dir * ripple * wave * 0.035 * uHover
                + vec2(n, noise(vUv * 5.0 - uTime * 0.3) - 0.5) * 0.02 * uHover;
    float zoom = 1.0 - 0.05 * uHover;
    vec2 base = (uv - 0.5) * zoom + 0.5 + offset;
    float split = 0.006 * uHover * (0.4 + ripple);
    float r = texture2D(uTex, base + dir * split).r;
    float g = texture2D(uTex, base).g;
    float b = texture2D(uTex, base - dir * split).b;
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

interface Props {
  src: string;
  hovered: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  onReady: () => void;
}

function Plane({ src, hovered, mouse, onReady }: Props) {
  const texture = useLoader(THREE.TextureLoader, src, (loader) => {
    loader.setCrossOrigin('anonymous');
  });
  const size = useThree((s) => s.size);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const hover = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTex: { value: null as THREE.Texture | null },
      uScale: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uAspect: { value: 1 },
    }),
    [],
  );

  useEffect(() => {
    texture.colorSpace = THREE.NoColorSpace; // sample raw sRGB values, output untouched
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    uniforms.uTex.value = texture;
    onReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture]);

  useEffect(() => {
    const img = texture.image as { width: number; height: number };
    const ca = size.width / size.height;
    const ia = img.width / img.height;
    uniforms.uScale.value.set(ca > ia ? 1 : ca / ia, ca > ia ? ia / ca : 1);
    uniforms.uAspect.value = ca;
  }, [size, texture, uniforms]);

  useFrame((_, delta) => {
    if (!mat.current) return;
    const u = mat.current.uniforms;
    hover.current += ((hovered ? 1 : 0) - hover.current) * Math.min(1, delta * 6);
    u.uHover.value = hover.current;
    u.uTime.value += delta;
    u.uMouse.value.x += (mouse.current.x - u.uMouse.value.x) * Math.min(1, delta * 8);
    u.uMouse.value.y += (mouse.current.y - u.uMouse.value.y) * Math.min(1, delta * 8);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
    </mesh>
  );
}

export default function DistortionCanvas(props: Props) {
  return (
    <Canvas dpr={[1, 1.5]} gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }} style={{ pointerEvents: 'none' }}>
      <Plane {...props} />
    </Canvas>
  );
}
