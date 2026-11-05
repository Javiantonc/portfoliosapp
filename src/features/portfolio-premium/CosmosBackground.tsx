'use client'
import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Color, type Mesh, type Points, type ShaderMaterial } from 'three'

/* Fondo de la plantilla «Cosmos»: esfera iridiscente deformada con ruido y campo de estrellas. */

const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`

const vertex = /* glsl */ `
uniform float uTime; uniform float uAmp;
varying vec3 vNormal; varying vec3 vView; varying float vN;
${noise}
void main(){
  float n = snoise(normal*1.6 + uTime*0.25);
  vN = n;
  vec3 pos = position + normal * n * uAmp;
  vec4 mv = modelViewMatrix * vec4(pos,1.);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`

const fragment = /* glsl */ `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform float uTime; uniform float uFade;
varying vec3 vNormal; varying vec3 vView; varying float vN;
void main(){
  float fres = pow(1. - max(dot(vNormal, vView), 0.), 2.4);
  float t = fres + vN*0.35 + uTime*0.05;
  vec3 iri = mix(uA, uB, 0.5+0.5*sin(t*6.2831));
  iri = mix(iri, uC, 0.5+0.5*sin(t*6.2831+2.1)) ;
  vec3 core = mix(vec3(0.03,0.01,0.08), uA*0.35, 0.4+vN*0.3);
  vec3 col = mix(core, iri*1.35, smoothstep(0.15, 1.0, fres));
  gl_FragColor = vec4(col, uFade);
}`

function Blob({ accent, progress }: { accent: string; progress: { current: number } }) {
  const ref = useRef<Mesh>(null!)
  const mat = useRef<ShaderMaterial>(null!)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.22 },
      uFade: { value: 1 },
      uA: { value: new Color(accent) },
      uB: { value: new Color('#5ee6ff') },
      uC: { value: new Color('#ff6ad5') },
    }),
    [accent]
  )
  useFrame((state, dt) => {
    const p = Math.min(1, progress.current)
    const u = mat.current.uniforms
    u.uTime.value += dt
    u.uFade.value = 1 - p * 0.75
    const base = Math.min(1.55, state.viewport.width * 0.36)
    ref.current.scale.setScalar(Math.max(0.12, base * (1 - p * 0.87)))
    ref.current.rotation.y += dt * 0.15
    ref.current.rotation.x = state.pointer.y * 0.3
    ref.current.position.x = state.pointer.x * 0.2
  })
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1, 48]} />
      <shaderMaterial ref={mat} key={accent} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent />
    </mesh>
  )
}

function Stars() {
  const ref = useRef<Points>(null!)
  const pos = useMemo(() => {
    const n = 1400
    const a = new Float32Array(n * 3)
    let seed = 11
    const r = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
    for (let i = 0; i < n; i++) {
      a[i * 3] = (r() - 0.5) * 30
      a[i * 3 + 1] = (r() - 0.5) * 20
      a[i * 3 + 2] = -r() * 14
    }
    return a
  }, [])
  useFrame((_, dt) => {
    ref.current.rotation.z += dt * 0.004
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#cfd2ff" transparent opacity={0.75} sizeAttenuation depthWrite={false} />
    </points>
  )
}

export default function CosmosBackground({ accent, progress }: { accent: string; progress: { current: number } }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: false }}>
      <color attach="background" args={['#000000']} />
      <Stars />
      <Blob accent={accent} progress={progress} />
    </Canvas>
  )
}
