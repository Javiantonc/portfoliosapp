'use client'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Check, Crown, Loader2, PartyPopper, X } from 'lucide-react'
import { PREMIUM_LAYOUTS, PREMIUM_TEMPLATES, type CV } from '@/lib/schema/cv'
import { getSector, resolveLayout } from '@/lib/sectors'
import { useCVStore } from '@/lib/store/cv-store'
import { useAppEnv } from '@/lib/nav'
import { PRODUCTS, type ProductId } from '@/lib/pricing'
import { CheckoutError } from '@/lib/checkout/types'
import { cn } from '@/lib/utils'

/** Ejemplos reales enlazados en el escaparate Premium. */
export const premiumExamples = [
  {
    name: 'Irene Antón',
    role: 'Comunicación audiovisual y estratégica',
    url: 'https://irene-anton-portfolio.vercel.app/',
    style: 'Cine',
    bg: '#f6f5ef',
    fg: '#1f271c',
    accent: '#5c6a4a',
    mono: true,
  },
  {
    name: 'Javier Antón',
    role: 'Desarrollador web',
    url: 'https://portdef.vercel.app/',
    style: 'Cosmos',
    bg: '#000000',
    fg: '#f4f3fb',
    accent: '#7b3dff',
    mono: false,
  },
]

export const premiumBenefits = [
  'CV Editorial e Impacto, con diseño de revista',
  'Portfolio Cine: escenas, línea de tiempo y créditos',
  'Portfolio Cosmos: esfera iridiscente y narrativa al hacer scroll',
  'Pago único: sin suscripciones ni renovaciones',
]

export const isPremiumLayout = (cv: CV) => PREMIUM_LAYOUTS.includes(resolveLayout(getSector(cv.settings.sector), cv.settings.cvLayout))
export const isPremiumTemplate = (cv: CV) => PREMIUM_TEMPLATES.includes(cv.settings.portfolioTemplate)

export function usePremium() {
  const purchases = useCVStore((s) => s.purchases)
  const open = useCVStore((s) => s.setUpgradeOpen)
  return {
    purchases,
    /** CV Premium (Editorial, Impacto) incluido solo en el pack de 1,99 € */
    canCv: purchases.bundle,
    /** Portfolios Premium (Cine, Cosmos): pack o portfolio suelto (1 €) */
    canPortfolio: purchases.bundle || purchases.portfolio,
    openUpgrade: () => open(true),
  }
}

export function PremiumBadge({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide',
        onDark ? 'bg-[#f5d77a] text-[#3b2a00]' : 'bg-gradient-to-r from-[#f8e3a3] to-[#f3c96b] text-[#5a3d00]',
        className
      )}
    >
      <Crown className="size-3" /> Premium
    </span>
  )
}

export function ExampleCard({ ex }: { ex: (typeof premiumExamples)[number] }) {
  return (
    <a
      href={ex.url}
      target="_blank"
      rel="noreferrer"
      className="group relative flex min-h-40 flex-col justify-between overflow-hidden rounded-3xl p-5 ring-1 ring-black/5 transition-transform hover:-translate-y-0.5"
      style={{ background: ex.bg, color: ex.fg }}
    >
      {ex.style === 'Cosmos' ? (
        <span
          aria-hidden
          className="absolute -top-10 -right-8 size-40 rounded-full opacity-90 blur-[2px]"
          style={{ background: 'radial-gradient(circle at 35% 35%, #3a1d7a, #12082b 60%)', boxShadow: `inset 0 0 0 2px ${ex.accent}, 0 0 40px 6px #6d3bff88, inset 8px -6px 24px #5ee6ff99` }}
        />
      ) : (
        <span aria-hidden className="absolute top-4 right-4 rounded-full px-3 py-1 font-mono text-[11px]" style={{ background: ex.fg, color: ex.bg }}>
          ● REC 00:00:42:14
        </span>
      )}
      <span className="relative text-xs opacity-70">Estilo {ex.style}</span>
      <span className="relative">
        <span className="block font-display text-2xl leading-tight font-bold">{ex.name}</span>
        <span className="mt-0.5 block text-sm opacity-75">{ex.role}</span>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium" style={{ color: ex.style === 'Cosmos' ? '#b9a0ff' : ex.accent }}>
          Ver la web <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </span>
    </a>
  )
}

/** Diálogo de Relieve Premium: dos productos de pago único, ventajas y ejemplos reales. */
export function UpgradeDialog() {
  const open = useCVStore((s) => s.upgradeOpen)
  const setOpen = useCVStore((s) => s.setUpgradeOpen)
  const purchases = useCVStore((s) => s.purchases)
  const justBought = useCVStore((s) => s.justBought)
  const setJustBought = useCVStore((s) => s.setJustBought)
  const panel = useRef<HTMLDivElement>(null)

  const close = () => {
    setOpen(false)
    setJustBought(null)
  }

  useEffect(() => {
    if (!open) return
    panel.current?.focus()
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      setJustBought(null)
    }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open, setOpen, setJustBought])

  const owned = purchases.bundle ? 'bundle' : purchases.portfolio ? 'portfolio' : null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-end bg-ink/45 backdrop-blur-sm sm:place-items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onPointerDown={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="premium-title"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="scrollbar-thin max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] bg-paper p-6 text-ink outline-none sm:max-w-2xl sm:rounded-[28px] sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <PremiumBadge />
                <h2 id="premium-title" className="mt-3 font-display text-3xl font-bold">
                  {purchases.bundle ? 'Tienes todo Premium' : 'CV y portfolios de nivel profesional'}
                </h2>
                <p className="mt-1 text-ink-soft">Pago único, sin suscripción. Pruébalo gratis en la vista previa y paga solo para descargar o publicar.</p>
              </div>
              <button aria-label="Cerrar" onClick={close} className="grid size-10 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-ink/5 hover:text-ink">
                <X className="size-5" />
              </button>
            </div>

            {justBought && (
              <div role="status" className="mb-5 flex items-start gap-3 rounded-2xl bg-[#e3f6ef] p-4 text-sm text-[#0d5c4b]">
                <PartyPopper className="mt-0.5 size-5 shrink-0" />
                <p>
                  <strong>¡Gracias por tu compra!</strong> {PRODUCTS[justBought].name} ya está activo. Elige las plantillas en «Sector y diseño».
                </p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <PriceCard product="bundle" featured owned={owned === 'bundle'} />
              <PriceCard product="portfolio" owned={owned !== null} upgradeHint={owned === 'portfolio'} />
            </div>

            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {premiumBenefits.map((b) => (
                <li key={b} className="flex gap-2 rounded-2xl bg-white p-3.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#1f9e86]" />
                  {b}
                </li>
              ))}
            </ul>

            <h3 className="mt-7 mb-3 font-display text-lg font-bold">Ejemplos reales</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {premiumExamples.map((ex) => (
                <ExampleCard key={ex.url} ex={ex} />
              ))}
            </div>
            <DemoNote />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function PriceCard({ product, featured = false, owned, upgradeHint = false }: { product: ProductId; featured?: boolean; owned: boolean; upgradeHint?: boolean }) {
  const p = PRODUCTS[product]
  const { checkout } = useAppEnv()
  const grant = useCVStore((s) => s.grant)
  const setJustBought = useCVStore((s) => s.setJustBought)
  const [state, setState] = useState<'idle' | 'loading'>('idle')
  const [error, setError] = useState<string | null>(null)

  const buy = async () => {
    setError(null)
    if (!checkout) {
      // Vista previa sin pasarela: simula la compra en este navegador.
      grant(product)
      setJustBought(product)
      return
    }
    setState('loading')
    try {
      await checkout(product)
    } catch (e) {
      setState('idle')
      setError(e instanceof CheckoutError && e.code === 'unavailable' ? 'Los pagos aún no están configurados en este servidor.' : e instanceof Error && e.message !== 'failed' ? e.message : 'No se pudo iniciar el pago.')
    }
  }

  return (
    <div className={cn('relative flex flex-col rounded-3xl p-5', featured ? 'bg-ink text-white' : 'bg-white ring-1 ring-ink/10')}>
      {featured && <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-[#f8e3a3] to-[#f3c96b] px-2.5 py-0.5 text-[11px] font-semibold text-[#3b2a00]">Recomendado</span>}
      <span className={cn('text-sm font-medium', featured ? 'text-white/70' : 'text-ink-soft')}>{p.name}</span>
      <span className="mt-1 font-display text-4xl font-bold tracking-tight">
        {p.price}
        <span className={cn('ml-1.5 text-sm font-normal', featured ? 'text-white/60' : 'text-ink-soft')}>pago único</span>
      </span>
      <ul className="mt-4 mb-5 flex-1 space-y-2 text-sm">
        {p.includes.map((i) => (
          <li key={i} className="flex gap-2">
            <Check className={cn('mt-0.5 size-4 shrink-0', featured ? 'text-[#f3c96b]' : 'text-[#1f9e86]')} />
            {i}
          </li>
        ))}
      </ul>
      {owned ? (
        <span className={cn('inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-medium', featured ? 'bg-white/10' : 'bg-ink/5')}>
          <Check className="size-4" /> {upgradeHint ? 'Comprado' : product === 'portfolio' ? 'Incluido en tu pack' : 'Comprado'}
        </span>
      ) : (
        <button
          onClick={buy}
          disabled={state === 'loading'}
          className={cn(
            'inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-opacity disabled:opacity-60',
            featured ? 'bg-gradient-to-r from-[#f8e3a3] to-[#f3c96b] text-[#3b2a00]' : 'bg-ink text-white'
          )}
        >
          {state === 'loading' ? <Loader2 className="size-4 animate-spin" /> : <Crown className="size-4" />}
          {checkout ? `Comprar por ${p.price}` : `Simular compra · ${p.price}`}
        </button>
      )}
      {error && <p role="alert" className={cn('mt-2 text-xs', featured ? 'text-[#ffb4a8]' : 'text-[#b4271a]')}>{error}</p>}
    </div>
  )
}

function DemoNote() {
  const { checkout } = useAppEnv()
  const reset = useCVStore((s) => s.resetPurchases)
  const purchases = useCVStore((s) => s.purchases)
  return (
    <p className="mt-5 text-xs text-ink-soft">
      {checkout
        ? 'El pago se procesa de forma segura con Stripe (tarjeta, Apple Pay y Google Pay). Recibirás el recibo en tu correo.'
        : 'Versión de demostración: aquí no se cobra nada. La compra simulada se guarda solo en este navegador.'}
      {!checkout && (purchases.bundle || purchases.portfolio) && (
        <>
          {' '}
          <button onClick={reset} className="underline underline-offset-2 hover:text-ink">
            Deshacer compra simulada
          </button>
        </>
      )}
    </p>
  )
}
