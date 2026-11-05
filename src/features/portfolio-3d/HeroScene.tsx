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
  return (
    <>
      <Backdrop count={500} spread={[viewport.width * 1.4, viewport.height * 2.2, 8]} height={12} />
      <HeroShape position={[viewport.width * 0.2, viewport.height * 0.2, -4]} scale={1.25} />
      <NameText3D name={data.personal.fullName} widthRatio={0.72} maxScale={1.1} position={[0, viewport.height * 0.06, 0]} />
      {labelLayer && <SkillsViz portal={labelLayer} skills={data.skills.slice(0, 6)} view={data.settings.skillsView} radius={2.4} position={[0, -viewport.height * 0.36, -2]} />}
    </>
  )
}
