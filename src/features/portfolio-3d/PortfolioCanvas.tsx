'use client'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, Preload } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useReducedMotion } from 'motion/react'
import { defaultEffects } from '@/lib/schema/cv'
import type { CV } from '@/lib/schema/cv'
import { styleVars } from '@/lib/design'
import { useResolvedStyle } from '@/lib/use-style'
import { StageLights } from './objects/StageLights'
import { PortfolioScene } from './PortfolioScene'
import { HeroScene } from './HeroScene'
import { StageThemeProvider } from './theme'

type Props = { data: CV; mode?: 'portfolio' | 'hero'; className?: string }

export default function PortfolioCanvas({ data, mode = 'portfolio', className = '' }: Props) {
  const style = useResolvedStyle(data)
  const theme = style.theme
  const reduce = useReducedMotion()
  const base = data.settings.effects ?? defaultEffects
  const fx = reduce ? { ...base, speed: Math.min(base.speed, 0.2), float: false } : base
  return (
    <div className={`relative h-full w-full ${className}`} style={{ ...styleVars(style), background: theme.bg }}>
      <Canvas camera={{ position: [0, 0, 9], fov: 40 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: false }}>
        <StageThemeProvider value={{ ...theme, titleScale: style.titleScale, fx }}>
          <color attach="background" args={[theme.bg]} />
          <fog attach="fog" args={[theme.bg, 9, 22]} />
          <Suspense fallback={null}>
            <StageLights />
            {mode === 'hero' ? <HeroScene data={data} /> : <PortfolioScene data={data} />}
            <Preload all />
          </Suspense>
          {fx.bloom > 0 && (
            <EffectComposer>
              <Bloom mipmapBlur intensity={fx.bloom * 1.2} luminanceThreshold={0.55} luminanceSmoothing={0.3} />
            </EffectComposer>
          )}
          <AdaptiveDpr pixelated />
        </StageThemeProvider>
      </Canvas>
    </div>
  )
}
