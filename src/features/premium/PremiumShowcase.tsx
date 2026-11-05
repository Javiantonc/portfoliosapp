'use client'
import { useMemo } from 'react'
import { ArrowRight, Crown } from 'lucide-react'
import type { CV, CVLayout, PortfolioTemplate } from '@/lib/schema/cv'
import { sectorDemos } from '@/lib/demo-data'
import { useCVStore } from '@/lib/store/cv-store'
import { useAppEnv } from '@/lib/nav'
import { CVDocument } from '@/features/cv-document/CVDocument'
import { ExampleCard, PremiumBadge, premiumExamples } from './premium'

/* Escaparate Premium para la portada: plantillas en vivo y ejemplos reales. */

function CvThumb({ layout, accent, label, hint }: { layout: CVLayout; accent: string; label: string; hint: string }) {
  const cv = useMemo<CV>(() => {
    const base = sectorDemos[layout === 'editorial' ? 'creative' : 'tech']
    return { ...base, settings: { ...base.settings, cvLayout: layout, accent } }
  }, [layout, accent])
  return (
    <figure className="flex flex-col gap-3">
      <div className="relative h-[300px] overflow-hidden rounded-3xl bg-paper-2 ring-1 ring-line" aria-hidden>
        <div className="absolute top-5 left-1/2 w-[794px] origin-top -translate-x-1/2 scale-[0.36] shadow-xl">
          <CVDocument data={cv} />
        </div>
      </div>
      <figcaption>
        <span className="flex items-center gap-2 font-display text-lg font-bold">
          CV {label} <PremiumBadge />
        </span>
        <span className="text-sm text-ink-soft">{hint}</span>
      </figcaption>
    </figure>
  )
}

function PortfolioThumb({ id, label, hint }: { id: PortfolioTemplate; label: string; hint: string }) {
  const setSettings = useCVStore((s) => s.setSettings)
  const { navigate } = useAppEnv()
  const film = id === 'film'
  return (
    <figure className="flex flex-col gap-3">
      <div className="relative flex h-[300px] flex-col justify-between overflow-hidden rounded-3xl p-6 ring-1 ring-line" style={{ background: film ? '#f6f5ef' : '#000', color: film ? '#1f271c' : '#f4f3fb' }} aria-hidden>
        {film ? (
          <>
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="rounded-full border border-current/30 px-2.5 py-1">ESCENA 02 · EXPERIENCIA</span>
              <span className="rounded-full bg-[#1f271c] px-2.5 py-1 text-white">
                <span className="text-[#ff5d4f]">●</span> 00:00:42:14
              </span>
            </div>
            <p className="font-display text-[34px] leading-[1.02] font-bold" style={{ fontFamily: '"Lexend", sans-serif' }}>
              Mi trayectoria, <span className="text-[#5c6a4a]">montada</span> en una línea de tiempo.
            </p>
            <div className="flex gap-1">
              {[3, 2, 4, 2].map((g, i) => (
                <span key={i} className="h-8 rounded-md" style={{ flexGrow: g, background: i === 2 ? '#b7c690' : '#1f271c22' }} />
              ))}
            </div>
          </>
        ) : (
          <>
            <span
              className="absolute top-1/2 left-1/2 size-52 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: 'radial-gradient(circle at 40% 40%, #2a1360, #070312 65%)', boxShadow: '0 0 60px 8px #6d3bff88, inset 10px -10px 40px #5ee6ffaa, inset -12px 12px 40px #ff6ad599, inset 0 0 0 2px #b9a0ff' }}
            />
            <span className="relative self-end rounded-full border border-white/25 px-3 py-1 text-xs">Ir al CV ↓</span>
            <p className="relative text-center font-display text-[38px] leading-none font-bold" style={{ fontFamily: '"Geist", sans-serif' }}>
              Hola, soy Lucía
            </p>
            <span className="relative text-center font-mono text-[10px] tracking-[0.3em] text-white/60">DESLIZA</span>
          </>
        )}
      </div>
      <figcaption className="flex flex-wrap items-end justify-between gap-3">
        <span>
          <span className="flex items-center gap-2 font-display text-lg font-bold">
            Portfolio {label} <PremiumBadge />
          </span>
          <span className="text-sm text-ink-soft">{hint}</span>
        </span>
        <button
          onClick={() => {
            setSettings({ portfolioTemplate: id })
            navigate?.('portfolio')
          }}
          className="inline-flex items-center gap-1 text-sm font-medium text-violet"
        >
          Probar con mis datos <ArrowRight className="size-4" />
        </button>
      </figcaption>
    </figure>
  )
}

export function PremiumShowcase() {
  const open = useCVStore((s) => s.setUpgradeOpen)
  return (
    <section className="px-6 py-24 sm:px-10 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <PremiumBadge />
            <h2 className="mt-4 font-display max-w-[20ch] text-4xl leading-[1.02] font-bold sm:text-5xl">Diseños de autor para destacar de verdad.</h2>
            <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-ink-soft">
              Plantillas Premium pensadas como un encargo a medida: CV con estructura de revista y portfolios con narrativa propia. Pruébalas gratis en la vista previa y paga una sola vez: 1,99 € CV + portfolio, o 1 € solo el portfolio.
            </p>
          </div>
          <button onClick={() => open(true)} className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#f8e3a3] to-[#f3c96b] px-5 font-medium text-[#3b2a00]">
            <Crown className="size-4" /> Ver precios
          </button>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <CvThumb layout="editorial" accent="#5c6a4a" label="Editorial" hint="Foto protagonista, banda de color y bloques destacados." />
          <CvThumb layout="impact" accent="#e0672f" label="Impacto" hint="Nombre gigante a dos colores y foto circular." />
          <PortfolioThumb id="film" label="Cine" hint="Tu carrera contada como una producción: escenas, clips y créditos." />
          <PortfolioThumb id="cosmos" label="Cosmos" hint="Una esfera iridiscente y tu historia frase a frase." />
        </div>

        <h3 className="mt-16 font-display text-2xl font-bold">Ejemplos reales</h3>
        <p className="mt-1 text-ink-soft">Portfolios publicados que inspiran estas plantillas.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {premiumExamples.map((ex) => (
            <ExampleCard key={ex.url} ex={ex} />
          ))}
        </div>
      </div>
    </section>
  )
}
