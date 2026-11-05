'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import { easing } from 'maath'
import { Color, type Group } from 'three'
import type { Skill, SkillsView } from '@/lib/schema/cv'
import { isHex } from '@/lib/design'
import { useStageTheme } from '../theme'

type Item = Skill & { t: number; color: string; size: number }

function useItems(skills: Skill[], view: SkillsView) {
  const c = useStageTheme()
  return useMemo(() => {
    const low = new Color(isHex(view.colorLow) ? view.colorLow : c.accent2)
    const high = new Color(isHex(view.colorHigh) ? view.colorHigh : c.warm)
    return skills.slice(0, 14).map((s) => {
      const t = s.level / 100
      const color = view.colorMode === 'single' ? high.getStyle() : low.clone().lerp(high, t).getStyle()
      return { ...s, t, color, size: (0.12 + t * 0.26) * view.size }
    })
  }, [skills, view, c.accent2, c.warm])
}

function SkillShape({ shape, size, color }: { shape: SkillsView['shape']; size: number; color: string }) {
  const mat = <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.25} roughness={0.25} metalness={0.3} clearcoat={1} />
  switch (shape) {
    case 'cube':
      return (
        <RoundedBox args={[size * 1.5, size * 1.5, size * 1.5]} radius={size * 0.15} rotation={[0.5, 0.6, 0]}>
          {mat}
        </RoundedBox>
      )
    case 'gem':
      return (
        <mesh rotation={[0.3, 0.4, 0]}>
          <octahedronGeometry args={[size * 1.25, 0]} />
          {mat}
        </mesh>
      )
    case 'ring':
      return (
        <mesh rotation={[1.1, 0.3, 0]}>
          <torusGeometry args={[size, size * 0.32, 20, 48]} />
          {mat}
        </mesh>
      )
    default:
      return (
        <mesh>
          <sphereGeometry args={[size, 40, 40]} />
          {mat}
        </mesh>
      )
  }
}

function Label({ item, view, portal, offset }: { item: Item; view: SkillsView; portal?: HTMLElement; offset: number }) {
  if (view.labels === 'none') return null
  return (
    <Html center portal={portal ? { current: portal } : undefined} position={[0, offset, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[20, 0]}>
      <div className="rounded-full border border-[var(--st-line)] bg-[color-mix(in_srgb,var(--st-bg)_70%,transparent)] px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-[var(--st-text)] backdrop-blur-md">
        {item.name}
        {view.labels === 'full' && <span className="text-[var(--st-mist)]"> {item.level}</span>}
      </div>
    </Html>
  )
}

function Core({ view }: { view: SkillsView }) {
  const c = useStageTheme()
  if (!view.core) return null
  return (
    <mesh>
      <sphereGeometry args={[0.32 * view.size, 48, 48]} />
      <meshPhysicalMaterial color={c.accent} emissive={c.accent} emissiveIntensity={0.6} roughness={0.2} metalness={0.4} />
    </mesh>
  )
}

function Orbit({ items, view, radius, portal }: { items: Item[]; view: SkillsView; radius: number; portal?: HTMLElement }) {
  const c = useStageTheme()
  const ring = useRef<Group>(null!)
  const tilt = useRef<Group>(null!)
  const r = radius * view.spread
  useFrame((state, dt) => {
    ring.current.rotation.y += dt * 0.18 * c.fx.speed
    easing.dampE(tilt.current.rotation, [0.35 + state.pointer.y * 0.25 * c.fx.mouse, 0, -0.18 + state.pointer.x * 0.2 * c.fx.mouse], 0.4, dt)
  })
  return (
    <group ref={tilt}>
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[r, 0.006, 8, 160]} />
        <meshBasicMaterial color={c.mist} transparent opacity={0.4} />
      </mesh>
      <Core view={view} />
      <group ref={ring}>
        {items.map((s, i) => {
          const a = (i / Math.max(items.length, 1)) * Math.PI * 2
          return (
            <group key={s.id} position={[Math.cos(a) * r, Math.sin(a * 2) * 0.25, Math.sin(a) * r]}>
              <SkillShape shape={view.shape} size={s.size} color={s.color} />
              <Label item={s} view={view} portal={portal} offset={s.size * 1.3 + 0.22} />
            </group>
          )
        })}
      </group>
    </group>
  )
}

function Cloud({ items, view, radius, portal }: { items: Item[]; view: SkillsView; radius: number; portal?: HTMLElement }) {
  const c = useStageTheme()
  const g = useRef<Group>(null!)
  const nodes = useRef<Group[]>([])
  const r = radius * 0.9 * view.spread
  const pts = useMemo(
    () =>
      items.map((_, i) => {
        const n = items.length
        const y = 1 - ((i + 0.5) / n) * 2
        const rr = Math.sqrt(1 - y * y)
        const th = i * Math.PI * (3 - Math.sqrt(5))
        return [Math.cos(th) * rr * r, y * r * 0.75, Math.sin(th) * rr * r] as [number, number, number]
      }),
    [items, r]
  )
  useFrame((state, dt) => {
    g.current.rotation.y += dt * 0.12 * c.fx.speed
    easing.dampE(g.current.rotation, [state.pointer.y * 0.3 * c.fx.mouse, g.current.rotation.y, 0], 0.4, dt)
    const t = state.clock.elapsedTime * c.fx.speed
    nodes.current.forEach((n, i) => n && (n.position.y = pts[i][1] + (c.fx.float ? Math.sin(t + i) * 0.12 : 0)))
  })
  return (
    <group ref={g}>
      <Core view={view} />
      {items.map((s, i) => (
        <group key={s.id} ref={(el) => void (el && (nodes.current[i] = el))} position={pts[i]}>
          <SkillShape shape={view.shape} size={s.size} color={s.color} />
          <Label item={s} view={view} portal={portal} offset={s.size * 1.3 + 0.22} />
        </group>
      ))}
    </group>
  )
}

function Bars({ items, view, radius, portal }: { items: Item[]; view: SkillsView; radius: number; portal?: HTMLElement }) {
  const c = useStageTheme()
  const g = useRef<Group>(null!)
  const bars = useRef<Group[]>([])
  const width = radius * 2.1 * view.spread
  const gap = width / Math.max(items.length, 1)
  const w = Math.min(0.45, gap * 0.6) * view.size
  const maxH = 2.8 * Math.min(1.2, view.size)
  useFrame((state, dt) => {
    easing.dampE(g.current.rotation, [0.15 + state.pointer.y * 0.15 * c.fx.mouse, state.pointer.x * 0.35 * c.fx.mouse, 0], 0.4, dt)
    const t = state.clock.elapsedTime * c.fx.speed
    bars.current.forEach((b, i) => {
      if (!b) return
      const target = (0.25 + items[i].t * maxH) * (1 + (c.fx.float ? Math.sin(t * 1.3 + i) * 0.03 : 0))
      easing.damp(b.scale, 'y', target, 0.35, dt)
      b.position.y = b.scale.y / 2 - maxH / 2
    })
  })
  return (
    <group ref={g}>
      {items.map((s, i) => {
        const x = (i - (items.length - 1) / 2) * gap
        return (
          <group key={s.id} position={[x, 0, 0]}>
            <group ref={(el) => void (el && (bars.current[i] = el))}>
              <RoundedBox args={[w, 1, w]} radius={Math.min(0.06, w * 0.2)}>
                <meshPhysicalMaterial color={s.color} emissive={s.color} emissiveIntensity={0.2} roughness={0.25} metalness={0.3} clearcoat={1} />
              </RoundedBox>
            </group>
            <Label item={s} view={view} portal={portal} offset={0.25 + s.t * maxH - maxH / 2 + 0.3} />
          </group>
        )
      })}
      <mesh position={[0, -maxH / 2 - 0.02, 0]}>
        <boxGeometry args={[width + 0.4, 0.03, w * 2]} />
        <meshStandardMaterial color={c.mist} />
      </mesh>
    </group>
  )
}

export function SkillsViz({
  skills,
  view,
  radius = 2.4,
  position = [0, 0, 0],
  portal,
}: {
  skills: Skill[]
  view: SkillsView
  radius?: number
  position?: [number, number, number]
  /** necesario dentro de ScrollControls */
  portal?: HTMLElement
}) {
  const items = useItems(skills, view)
  if (view.layout === 'list') return null
  const Comp = view.layout === 'cloud' ? Cloud : view.layout === 'bars' ? Bars : Orbit
  return (
    <group position={position}>
      <Comp items={items} view={view} radius={radius} portal={portal} />
    </group>
  )
}
