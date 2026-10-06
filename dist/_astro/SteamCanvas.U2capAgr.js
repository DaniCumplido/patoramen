import{j as r}from"./jsx-runtime.CYiYLu1p.js";import{r as e}from"./index.CZlPm10g.js";import{C as h,a as w,u as b}from"./react-three-fiber.esm.CvGzRJQf.js";import{b as m}from"./brand.CjvMfmFU.js";const x=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,g=`
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
`;function y({running:i}){const t=e.useRef(null),o=e.useMemo(()=>({uTime:{value:0},uColor:{value:new w(m.colors.text)}}),[]);return b((l,c)=>{i&&t.current&&(t.current.uniforms.uTime.value+=Math.min(c,.05))}),r.jsxs("mesh",{frustumCulled:!1,children:[r.jsx("planeGeometry",{args:[2,2]}),r.jsx("shaderMaterial",{ref:t,vertexShader:x,fragmentShader:g,uniforms:o,transparent:!0,depthTest:!1,depthWrite:!1})]})}function L({className:i=""}){const[t,o]=e.useState(!1),[l,c]=e.useState(!0),[p,d]=e.useState(!0),u=e.useRef(null);if(e.useEffect(()=>{const n=window.matchMedia(`(min-width: ${m.motion.mobileFallbacks.below}px)`),a=window.matchMedia("(prefers-reduced-motion: reduce)"),s=()=>o(n.matches&&!a.matches);s(),n.addEventListener("change",s),a.addEventListener("change",s);const f=()=>d(document.visibilityState==="visible");return document.addEventListener("visibilitychange",f),()=>{n.removeEventListener("change",s),a.removeEventListener("change",s),document.removeEventListener("visibilitychange",f)}},[]),e.useEffect(()=>{if(!t||!u.current)return;const n=new IntersectionObserver(([a])=>c(a.isIntersecting),{threshold:0});return n.observe(u.current),()=>n.disconnect()},[t]),!t)return null;const v=l&&p;return r.jsx("div",{ref:u,"aria-hidden":"true",className:i,children:r.jsx(h,{dpr:[1,1.25],frameloop:v?"always":"never",gl:{alpha:!0,antialias:!1,powerPreference:"low-power"},style:{pointerEvents:"none"},children:r.jsx(y,{running:v})})})}export{L as default};
