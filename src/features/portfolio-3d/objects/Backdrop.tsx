'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, GridHelper, Material } from 'three'

const soften = (o: number) => (g: GridHelper) => {
  const m = g.material as Material
  m.transparent = true
  m.opacity = o
  m.depthWrite = false
}
import { useFx, useStageTheme } from '../theme'
import { Particles } from './Particles'

/** Fondo animado elegido por el usuario: estrellas, cuadrícula o nada. */
export function Backdrop({ count, spread, height = 30 }: { count: number; spread: [number, number, number]; height?: number }) {
  const fx = useFx()
  const c = useStageTheme()
  const grid = useRef<Group>(null!)
  useFrame((s) => {
    if (grid.current) grid.current.position.x = Math.sin(s.clock.elapsedTime * 0.2 * fx.speed) * 0.4
  })
  if (fx.background === 'none') return null
  if (fx.background === 'grid')
    return (
      <group ref={grid}>
        {Array.from({ length: Math.ceil(height / 12) }, (_, i) => (
          <gridHelper key={i} args={[40, Math.round(28 * fx.density), c.mist, c.mist]} rotation-x={Math.PI / 2} position={[0, -i * 12 + 4, -6]} onUpdate={soften(0.22)} />
        ))}
        <gridHelper args={[40, Math.round(24 * fx.density), c.accent, c.mist]} position={[0, -3.4, 0]} onUpdate={soften(0.4)} />
      </group>
    )
  return <Particles count={Math.round(count * fx.density)} spread={spread} />
}
