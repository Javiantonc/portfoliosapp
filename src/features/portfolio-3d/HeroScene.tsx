'use client'
import { useThree } from '@react-three/fiber'
import type { CV } from '@/lib/schema/cv'
import { NameText3D } from './objects/NameText3D'
import { HeroShape } from './objects/HeroShape'
import { Backdrop } from './objects/Backdrop'
import { SkillsViz } from './objects/SkillsViz'
import { useLabelLayer } from './label-layer'

export function HeroScene({ data }: { data: CV }) {
  const { viewport } = useThree()
  const labelLayer = useLabelLayer()
  // pantallas verticales (móvil): todo más compacto y centrado
  const tall = viewport.aspect < 0.85
  const W = viewport.width
  const H = viewport.height
  return (
    <>
      <Backdrop count={tall ? 300 : 500} spread={[W * 1.4, H * 2.2, 8]} height={12} />
      <HeroShape position={tall ? [W * 0.22, H * 0.22, -4] : [W * 0.2, H * 0.2, -4]} scale={tall ? 0.95 : 1.25} />
      <NameText3D name={data.personal.fullName} widthRatio={tall ? 0.86 : 0.72} maxScale={1.1} position={[0, tall ? H * 0.04 : H * 0.06, 0]} />
      {labelLayer && (
        <SkillsViz
          portal={labelLayer}
          skills={data.skills.slice(0, tall ? 5 : 6)}
          view={data.settings.skillsView}
          radius={tall ? Math.min(2.4, W * 0.4) : 2.4}
          position={[0, -H * (tall ? 0.3 : 0.36), -2]}
        />
      )}
    </>
  )
}
