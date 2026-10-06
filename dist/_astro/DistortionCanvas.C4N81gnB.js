import{j as s}from"./jsx-runtime.CYiYLu1p.js";import{r as u}from"./index.CZlPm10g.js";import{C as h,b as x,c as d,V as f,N as g,L as T,u as M,T as y}from"./react-three-fiber.esm.CvGzRJQf.js";const w=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,b=`
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
`;function S({src:i,hovered:m,mouse:c,onReady:p}){const t=x(y,i,a=>{a.setCrossOrigin("anonymous")}),n=d(a=>a.size),v=u.useRef(null),l=u.useRef(0),o=u.useMemo(()=>({uTex:{value:null},uScale:{value:new f(1,1)},uMouse:{value:new f(.5,.5)},uHover:{value:0},uTime:{value:0},uAspect:{value:1}}),[]);return u.useEffect(()=>{t.colorSpace=g,t.minFilter=T,t.generateMipmaps=!1,t.needsUpdate=!0,o.uTex.value=t,p()},[t]),u.useEffect(()=>{const a=t.image,r=n.width/n.height,e=a.width/a.height;o.uScale.value.set(r>e?1:r/e,r>e?e/r:1),o.uAspect.value=r},[n,t,o]),M((a,r)=>{if(!v.current)return;const e=v.current.uniforms;l.current+=((m?1:0)-l.current)*Math.min(1,r*6),e.uHover.value=l.current,e.uTime.value+=r,e.uMouse.value.x+=(c.current.x-e.uMouse.value.x)*Math.min(1,r*8),e.uMouse.value.y+=(c.current.y-e.uMouse.value.y)*Math.min(1,r*8)}),s.jsxs("mesh",{frustumCulled:!1,children:[s.jsx("planeGeometry",{args:[2,2]}),s.jsx("shaderMaterial",{ref:v,vertexShader:w,fragmentShader:b,uniforms:o})]})}function H(i){return s.jsx(h,{dpr:[1,1.5],gl:{antialias:!1,alpha:!1,powerPreference:"low-power"},style:{pointerEvents:"none"},children:s.jsx(S,{...i})})}export{H as default};
