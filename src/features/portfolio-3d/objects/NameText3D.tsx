'use client'
import { useEffect, useMemo, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Center, Text3D } from '@react-three/drei'
import { headingFonts } from '@/lib/design'
import { useStageTheme } from '../theme'

type Props = {
  name: string
  /** fracción del ancho visible que puede ocupar */
  widthRatio?: number
  maxScale?: number
  position?: [number, number, number]
}

function NameMaterial() {
  const t = useStageTheme()
  switch (t.fx.material) {
    case 'matte':
      return <meshStandardMaterial color={t.text} roughness={0.85} metalness={0} />
    case 'glass':
      return <meshPhysicalMaterial color={t.text} transmission={0.85} thickness={1.2} roughness={0.12} ior={1.5} clearcoat={1} iridescence={1} iridescenceIOR={1.6} emissive={t.accent} emissiveIntensity={0.22} attenuationColor={t.accent2} attenuationDistance={0.8} envMapIntensity={2} />
    case 'neon':
      return <meshStandardMaterial color={t.accent} emissive={t.accent} emissiveIntensity={1.6} roughness={0.4} toneMapped={false} />
    default:
      return <meshPhysicalMaterial color={t.text} metalness={0.55} roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} emissive={t.accent} emissiveIntensity={0.16} iridescence={0.6} iridescenceIOR={1.4} />
  }
}

export function NameText3D({ name, widthRatio = 0.62, maxScale = 1.25, position = [0, 0, 0] }: Props) {
  const { viewport } = useThree()
  const theme = useStageTheme()
  const [font, setFont] = useState<{ id: string; data: unknown } | null>(null)
  useEffect(() => {
    let alive = true
    headingFonts[theme.font].typeface().then((m) => alive && setFont({ id: theme.font, data: m.default }))
    return () => {
      alive = false
    }
  }, [theme.font])
  const [width, setWidth] = useState(1)

  const text = useMemo(() => {
    const clean = name.trim() || 'Tu nombre'
    const parts = clean.split(/\s+/)
    if (parts.length < 2 || clean.length < 12) return clean
    return `${parts[0]}\n${parts.slice(1).join(' ')}`
  }, [name])

  const scale = Math.min(maxScale * theme.titleScale, (viewport.width * widthRatio * theme.titleScale) / width)

  if (!font) return null

  return (
    <group position={position} scale={scale}>
      <Center key={font.id} onCentered={({ width: w }) => w > 0 && Math.abs(w - width) > 0.001 && setWidth(w)}>
        <Text3D
          font={font.data as never}
          size={0.8}
          height={0.22}
          lineHeight={0.6}
          letterSpacing={-0.03}
          curveSegments={10}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.014}
          bevelSegments={4}
        >
          {text}
          <NameMaterial />
        </Text3D>
      </Center>
    </group>
  )
}
