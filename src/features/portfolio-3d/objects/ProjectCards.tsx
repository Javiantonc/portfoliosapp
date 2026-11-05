'use client'
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { easing } from 'maath'
import { create } from 'zustand'
import type { Group } from 'three'
import type { Project } from '@/lib/schema/cv'
import { useStageTheme } from '../theme'

export const CARD_W = 2.6
export const CARD_H = 1.6
const GAP_X = 0.35
const GAP_Y = 0.4
export const PROJECTS_HEADING = 1.9

/** Estado de hover compartido entre la tarjeta DOM (texto, enlaces) y el panel 3D. */
export const useCardHover = create<{ id: string | null; x: number; y: number }>(() => ({ id: null, x: 0, y: 0 }))

/** Posiciones en mundo relativas al centro de la página de proyectos. */
export function useProjectLayout(count: number) {
  const { viewport } = useThree()
  const cols = viewport.width > 6.4 ? 2 : 1
  const scale = Math.min(1, (viewport.width * 0.9) / (cols * CARD_W + (cols - 1) * GAP_X))
  const rows = Math.max(1, Math.ceil(count / cols))
  const top = viewport.height / 2 - PROJECTS_HEADING
  const cards = Array.from({ length: count }, (_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = cols === 1 ? 0 : (col - 0.5) * (CARD_W + GAP_X) * scale
    const y = top - (CARD_H * scale) / 2 - row * (CARD_H + GAP_Y) * scale
    return { x, y }
  })
  const worldHeight = PROJECTS_HEADING + rows * (CARD_H + GAP_Y) * scale
  return { cards, scale, cols, worldHeight }
}

export const MAX_TILT = 0.16

function Panel({ project, position, index, scale }: { project: Project; position: [number, number, number]; index: number; scale: number }) {
  const c = useStageTheme()
  const ref = useRef<Group>(null!)
  const accent = index % 2 ? c.accent2 : c.accent
  const mat = useRef<{ emissiveIntensity: number }>(null!)

  useFrame((state, dt) => {
    const h = useCardHover.getState()
    const active = h.id === project.id
    const t = state.clock.elapsedTime + index * 1.3
    const tilt = active && c.fx.tilt
    easing.dampE(ref.current.rotation, tilt ? [h.y * MAX_TILT, h.x * MAX_TILT, 0] : [0, 0, Math.sin(t * 0.5 * c.fx.speed) * 0.01], 0.15, dt)
    easing.damp(ref.current.position, 'z', tilt ? 0.25 : 0, 0.2, dt)
    easing.damp(mat.current, 'emissiveIntensity', active ? 0.22 : 0.05, 0.2, dt)
  })

  return (
    <group ref={ref} position={position} scale={scale}>
      <RoundedBox args={[CARD_W, CARD_H, 0.06]} radius={0.08} smoothness={4}>
        <meshPhysicalMaterial ref={mat as never} color={c.bg2} roughness={0.35} metalness={0.2} clearcoat={1} emissive={accent} emissiveIntensity={0.05} />
      </RoundedBox>
      <mesh position={[-CARD_W / 2 + 0.02, 0, 0.035]}>
        <planeGeometry args={[0.03, CARD_H - 0.3]} />
        <meshBasicMaterial color={accent} />
      </mesh>
    </group>
  )
}

export function ProjectPanels({ projects }: { projects: Project[] }) {
  const { cards, scale } = useProjectLayout(projects.length)
  return (
    <group>
      {projects.map((p, i) => (
        <Panel key={p.id} project={p} index={i} scale={scale} position={[cards[i].x, cards[i].y, 0]} />
      ))}
    </group>
  )
}
