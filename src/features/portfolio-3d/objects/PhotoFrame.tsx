'use client'
import { Suspense, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Image, RoundedBox } from '@react-three/drei'
import { easing } from 'maath'
import type { Group } from 'three'
import { useStageTheme } from '../theme'

/** Foto de perfil como marco flotante en 3D: se inclina hacia el cursor y flota con el resto de la escena. */
export function PhotoFrame({ url, size, position }: { url: string; size: number; position: [number, number, number] }) {
  const c = useStageTheme()
  const g = useRef<Group>(null!)
  const [hover, setHover] = useState(false)

  useFrame((state, dt) => {
    const m = c.fx.mouse
    easing.dampE(g.current.rotation, [-state.pointer.y * 0.25 * m, state.pointer.x * 0.35 * m, hover ? 0 : -0.04], 0.3, dt)
    easing.damp3(g.current.scale, hover ? 1.04 : 1, 0.25, dt)
  })

  const pad = size * 0.06
  return (
    <group position={position}>
      <Float speed={1.2 * c.fx.speed} rotationIntensity={c.fx.float ? 0.15 : 0} floatIntensity={c.fx.float ? 0.5 : 0}>
        <group ref={g} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
          <RoundedBox args={[size + pad * 2, size + pad * 2, 0.08]} radius={size * 0.1} smoothness={5} position={[0, 0, -0.06]}>
            <meshPhysicalMaterial color={c.bg2} metalness={0.4} roughness={0.3} clearcoat={1} emissive={c.accent} emissiveIntensity={hover ? 0.35 : 0.18} />
          </RoundedBox>
          <Suspense fallback={null}>
            <Image url={url} scale={[size, size]} radius={size * 0.08} transparent toneMapped={false} />
          </Suspense>
        </group>
      </Float>
    </group>
  )
}
