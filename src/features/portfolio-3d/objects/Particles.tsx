'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Points as PointsType } from 'three'
import { useFx, useStageTheme } from '../theme'

export function Particles({ count = 900, spread = [22, 40, 12] as [number, number, number], color }: { count?: number; spread?: [number, number, number]; color?: string }) {
  const theme = useStageTheme()
  const fx = useFx()
  const ref = useRef<PointsType>(null!)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    let seed = count * 13 + 1
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * spread[0]
      arr[i * 3 + 1] = (rand() - 0.85) * spread[1]
      arr[i * 3 + 2] = (rand() - 0.7) * spread[2]
    }
    return arr
  }, [count, spread])

  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 0.015 * fx.speed
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color={color ?? theme.mist} transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  )
}
