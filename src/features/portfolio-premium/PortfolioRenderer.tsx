'use client'
import { lazy, Suspense } from 'react'
import type { CV } from '@/lib/schema/cv'

const PortfolioCanvas = lazy(() => import('@/features/portfolio-3d/PortfolioCanvas'))
const Film = lazy(() => import('./FilmPortfolio').then((m) => ({ default: m.FilmPortfolio })))
const Cosmos = lazy(() => import('./CosmosPortfolio').then((m) => ({ default: m.CosmosPortfolio })))

/** Muestra el portfolio con la plantilla elegida (escenario 3D, Cine o Cosmos). */
export function PortfolioRenderer({ cv, embedded = false }: { cv: CV; embedded?: boolean }) {
  const t = cv.settings.portfolioTemplate
  return (
    <Suspense fallback={<div className="grid h-full place-items-center text-sm opacity-60">Cargando portfolio…</div>}>
      {t === 'film' ? <Film cv={cv} embedded={embedded} /> : t === 'cosmos' ? <Cosmos cv={cv} embedded={embedded} /> : <PortfolioCanvas data={cv} />}
    </Suspense>
  )
}
