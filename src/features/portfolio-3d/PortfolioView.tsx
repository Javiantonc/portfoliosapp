'use client'
import { lazy, Suspense } from 'react'
import { useCVStore } from '@/lib/store/cv-store'
import { AppHeader } from '@/components/AppHeader'
import { styleVars } from '@/lib/design'
import { useResolvedStyle } from '@/lib/use-style'

const PortfolioCanvas = lazy(() => import('./PortfolioCanvas'))

export function PortfolioView() {
  const cv = useCVStore((s) => s.cv)
  const style = useResolvedStyle(cv)
  return (
    <div className="relative h-dvh" style={{ ...styleVars(style), background: style.theme.bg }}>
      <div className="absolute inset-x-0 top-0 z-30">
        <AppHeader current="portfolio" tone="dark" />
      </div>
      <Suspense fallback={<div className="grid h-full place-items-center text-sm text-[var(--st-mist)]">Cargando escena 3D…</div>}>
        <PortfolioCanvas data={cv} />
      </Suspense>
    </div>
  )
}
