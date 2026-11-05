'use client'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, RoundedBox } from '@react-three/drei'
import { easing } from 'maath'
import { Quaternion, Vector3, type Group, type Mesh } from 'three'
import type { HeroShape as Shape, StageTheme } from '@/lib/sectors'
import { useFx, useStageTheme } from '../theme'

type P = { c: StageTheme; hover: boolean }

function Spin({ speed = [0.12, 0.18, 0], children }: { speed?: [number, number, number]; children: ReactNode }) {
  const ref = useRef<Group>(null!)
  const fx = useFx()
  useFrame((_, d) => {
    const dt = d * fx.speed
    ref.current.rotation.x += dt * speed[0]
    ref.current.rotation.y += dt * speed[1]
    ref.current.rotation.z += dt * speed[2]
  })
  return <group ref={ref}>{children}</group>
}

function Sway({ amount = 0.5, children }: { amount?: number; children: ReactNode }) {
  const ref = useRef<Group>(null!)
  const fx = useFx()
  useFrame((s) => {
    ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.35 * fx.speed) * amount
  })
  return <group ref={ref}>{children}</group>
}

function Core({ c, hover }: P) {
  return (
    <>
      <mesh>
        <icosahedronGeometry args={[1, 6]} />
        <MeshDistortMaterial color={c.accent} emissive={c.accent} emissiveIntensity={0.15} metalness={0.55} roughness={0.12} distort={hover ? 0.45 : 0.3} speed={1.6 * useFx().speed} />
      </mesh>
      <Spin>
        <mesh scale={1.55}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color={c.accent2} wireframe transparent opacity={0.35} />
        </mesh>
      </Spin>
    </>
  )
}

function Knot({ c, hover }: P) {
  return (
    <Spin speed={[0.1, 0.22, 0]}>
      <mesh scale={0.85}>
        <torusKnotGeometry args={[1, 0.34, 240, 32, 2, 3]} />
        <meshPhysicalMaterial color={c.accent} metalness={0.5} roughness={0.15} clearcoat={1} iridescence={1} iridescenceIOR={1.5} emissive={c.accent} emissiveIntensity={hover ? 0.3 : 0.1} />
      </mesh>
      <mesh scale={1.35}>
        <torusGeometry args={[1, 0.012, 8, 120]} />
        <meshBasicMaterial color={c.accent2} />
      </mesh>
    </Spin>
  )
}

function Helix({ c, hover }: P) {
  const pairs = 18
  const items = useMemo(
    () =>
      Array.from({ length: pairs }, (_, i) => {
        const t = i / (pairs - 1)
        const y = (t - 0.5) * 3.4
        const a = t * Math.PI * 3
        const r = 0.75
        const p1 = new Vector3(Math.cos(a) * r, y, Math.sin(a) * r)
        const p2 = new Vector3(-Math.cos(a) * r, y, -Math.sin(a) * r)
        const mid = p1.clone().add(p2).multiplyScalar(0.5)
        const dir = p2.clone().sub(p1)
        const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize())
        return { p1, p2, mid, q, len: dir.length() }
      }),
    []
  )
  return (
    <Spin speed={[0, hover ? 0.7 : 0.35, 0]}>
      <group rotation-z={0.35}>
        {items.map((it, i) => (
          <group key={i}>
            <mesh position={it.p1}>
              <sphereGeometry args={[0.13, 24, 24]} />
              <meshPhysicalMaterial color={c.accent} emissive={c.accent} emissiveIntensity={0.25} roughness={0.2} clearcoat={1} />
            </mesh>
            <mesh position={it.p2}>
              <sphereGeometry args={[0.13, 24, 24]} />
              <meshPhysicalMaterial color={c.accent2} emissive={c.accent2} emissiveIntensity={0.2} roughness={0.2} clearcoat={1} />
            </mesh>
            <mesh position={it.mid} quaternion={it.q}>
              <cylinderGeometry args={[0.025, 0.025, it.len, 8]} />
              <meshStandardMaterial color={c.mist} transparent opacity={0.6} />
            </mesh>
          </group>
        ))}
      </group>
    </Spin>
  )
}

function Columns({ c }: P) {
  const gold = <meshPhysicalMaterial color={c.accent} metalness={0.85} roughness={0.25} clearcoat={0.6} />
  const stone = <meshPhysicalMaterial color={c.accent2} metalness={0.1} roughness={0.5} />
  const xs = [-1.2, -0.6, 0, 0.6, 1.2]
  return (
    <Sway amount={0.55}>
      <group position={[0, -0.2, 0]} rotation-x={0.12}>
        <mesh position={[0, -1.15, 0]}>
          <boxGeometry args={[3.2, 0.14, 1.4]} />
          {stone}
        </mesh>
        <mesh position={[0, -1.0, 0]}>
          <boxGeometry args={[2.95, 0.14, 1.2]} />
          {stone}
        </mesh>
        {xs.map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.16, 0.19, 1.85, 20]} />
              {stone}
            </mesh>
            <mesh position={[0, 0.98, 0]}>
              <boxGeometry args={[0.46, 0.1, 0.46]} />
              {gold}
            </mesh>
          </group>
        ))}
        <mesh position={[0, 1.12, 0]}>
          <boxGeometry args={[3.0, 0.16, 1.15]} />
          {gold}
        </mesh>
        <mesh position={[0, 1.56, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.42, 1, 0.55]}>
          <cylinderGeometry args={[1.6, 1.6, 3.0, 3, 1, false, Math.PI / 2]} />
          {stone}
        </mesh>
      </group>
    </Sway>
  )
}

function Rings({ c, hover }: P) {
  const r1 = useRef<Mesh>(null!)
  const r2 = useRef<Mesh>(null!)
  const r3 = useRef<Mesh>(null!)
  const fx = useFx()
  useFrame((_, d) => {
    const dt = d * fx.speed
    const k = hover ? 2 : 1
    r1.current.rotation.x += dt * 0.5 * k
    r2.current.rotation.y += dt * 0.4 * k
    r3.current.rotation.z += dt * 0.3 * k
  })
  const mat = (col: string) => <meshPhysicalMaterial color={col} metalness={0.7} roughness={0.2} clearcoat={1} emissive={col} emissiveIntensity={0.12} />
  return (
    <group>
      <mesh ref={r1} rotation-y={0.6}>
        <torusGeometry args={[1.5, 0.06, 16, 120]} />
        {mat(c.accent)}
      </mesh>
      <mesh ref={r2} rotation-x={1.1}>
        <torusGeometry args={[1.15, 0.06, 16, 120]} />
        {mat(c.accent2)}
      </mesh>
      <mesh ref={r3} rotation-x={0.4}>
        <torusGeometry args={[0.8, 0.06, 16, 120]} />
        {mat(c.warm)}
      </mesh>
      <mesh>
        <sphereGeometry args={[0.38, 48, 48]} />
        <meshPhysicalMaterial color={c.accent} emissive={c.accent} emissiveIntensity={0.5} roughness={0.15} />
      </mesh>
    </group>
  )
}

function Blocks({ c, hover }: P) {
  const blocks = useMemo(() => {
    const out: { x: number; z: number; h: number; tone: number }[] = []
    let seed = 7
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
    for (let x = 0; x < 4; x++)
      for (let z = 0; z < 4; z++) {
        const center = 1.6 - Math.hypot(x - 1.5, z - 1.5) * 0.55
        out.push({ x: (x - 1.5) * 0.62, z: (z - 1.5) * 0.62, h: 0.3 + Math.max(0, center) * (0.6 + rnd() * 1.1), tone: rnd() })
      }
    return out
  }, [])
  const group = useRef<Group>(null!)
  useFrame((s, dt) => {
    group.current.children.forEach((m, i) => {
      const b = blocks[i]
      const target = hover ? b.h * (1 + 0.25 * Math.sin(s.clock.elapsedTime * 2 + i)) : b.h
      easing.damp(m.scale, 'y', target, 0.3, dt)
      m.position.y = (m.scale.y - 1.6) / 2
    })
  })
  return (
    <Spin speed={[0, 0.2, 0]}>
      <group rotation-x={0.35}>
        <group ref={group}>
          {blocks.map((b, i) => (
            <RoundedBox key={i} args={[0.5, 1, 0.5]} radius={0.04} position={[b.x, 0, b.z]}>
              <meshPhysicalMaterial color={b.tone > 0.72 ? c.accent : c.accent2} metalness={0.3} roughness={0.35} clearcoat={0.8} transparent opacity={b.tone > 0.72 ? 1 : 0.85} />
            </RoundedBox>
          ))}
        </group>
        <gridHelper args={[3.4, 10, c.mist, c.mist]} position={[0, -0.8, 0]} />
      </group>
    </Spin>
  )
}

function Bars({ c, hover }: P) {
  const heights = [0.6, 0.95, 0.8, 1.35, 1.7, 2.3]
  const group = useRef<Group>(null!)
  useFrame((s, dt) => {
    group.current.children.forEach((m, i) => {
      const target = heights[i] * (hover ? 1.15 : 1) * (1 + 0.06 * Math.sin(s.clock.elapsedTime * 1.4 + i))
      easing.damp(m.scale, 'y', target, 0.35, dt)
      m.position.y = m.scale.y / 2 - 1.1
    })
  })
  return (
    <Spin speed={[0, 0.25, 0]}>
      <group ref={group}>
        {heights.map((_, i) => (
          <RoundedBox key={i} args={[0.36, 1, 0.36]} radius={0.05} position={[(i - 2.5) * 0.5, 0, 0]}>
            <meshPhysicalMaterial color={i === heights.length - 1 ? c.warm : i % 2 ? c.accent : c.accent2} metalness={0.4} roughness={0.25} clearcoat={1} />
          </RoundedBox>
        ))}
      </group>
      <mesh position={[0, -1.14, 0]}>
        <boxGeometry args={[3.3, 0.04, 0.8]} />
        <meshStandardMaterial color={c.mist} />
      </mesh>
    </Spin>
  )
}

const shapes: Record<Shape, (p: P) => React.JSX.Element> = { core: Core, knot: Knot, helix: Helix, columns: Columns, rings: Rings, blocks: Blocks, bars: Bars }

export function HeroShape({ position = [0, 0, 0], scale = 1 }: { position?: [number, number, number]; scale?: number }) {
  const c = useStageTheme()
  const group = useRef<Group>(null!)
  const [hover, setHover] = useState(false)
  const Comp = shapes[c.shape]
  const fx = c.fx

  useFrame((state, dt) => {
    easing.damp3(group.current.scale, hover ? scale * 1.1 : scale, 0.25, dt)
    easing.dampE(group.current.rotation, [state.pointer.y * 0.35 * fx.mouse, state.pointer.x * 0.5 * fx.mouse, 0], 0.4, dt)
  })

  return (
    <group ref={group} position={position}>
      <Float speed={1.4 * fx.speed} rotationIntensity={fx.float ? 0.3 : 0} floatIntensity={fx.float ? 0.7 : 0}>
        <group onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
          <Comp c={c} hover={hover} />
        </group>
      </Float>
    </group>
  )
}
