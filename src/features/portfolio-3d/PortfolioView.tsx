'use client'
import { lazy, Suspense } from 'react'
import { Crown } from 'lucide-react'
import { useCVStore } from '@/lib/store/cv-store'
import { AppHeader } from '@/components/AppHeader'
import { styleVars } from '@/lib/design'
import { useResolvedStyle } from '@/lib/use-style'
import { PortfolioRenderer } from '@/features/portfolio-premium/PortfolioRenderer'
import { isPremiumTemplate, usePremium } from '@/features/premium/premium'

const PortfolioCanvas = lazy(() => import('./PortfolioCanvas'))

function PremiumPreviewBar() {
  const { canPortfolio, openUpgrade } = usePremium()
  if (canPortfolio) return null
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-gradient-to-r from-[#fdf3d6] to-[#fbe7b5] px-4 py-2 text-center text-sm text-[#5a3d00]">
      <span className="inline-flex items-center gap-1.5">
        <Crown className="size-4" /> Vista previa de una plantilla Premium
      </span>
      <button onClick={openUpgrade} className="font-semibold underline underline-offset-4">
        Publícala desde 1 €
      </button>
    </div>
  )
}

export function PortfolioView() {
  const cv = useCVStore((s) => s.cv)
  const style = useResolvedStyle(cv)

  if (isPremiumTemplate(cv)) {
    const dark = cv.settings.portfolioTemplate === 'cosmos'
    return (
      <div className="flex h-dvh flex-col" style={{ background: dark ? '#000' : '#f6f5ef' }}>
        <AppHeader current="portfolio" tone={dark ? 'dark' : 'light'} />
        <PremiumPreviewBar />
        <div className="min-h-0 flex-1">
          <PortfolioRenderer cv={cv} />
        </div>
      </div>
    )
  }

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
