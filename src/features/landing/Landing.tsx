'use client'
import { lazy, Suspense, useState, useSyncExternalStore } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { AppLink } from '@/lib/nav'
import { sectorDemos } from '@/lib/demo-data'
import { sectorList } from '@/lib/sectors'
import type { SectorId } from '@/lib/schema/cv'
import { sectorIcons } from '@/features/cv-editor/components/SectorForm'
import { cn } from '@/lib/utils'
import { buttonClass, Logo } from '@/components/ui'

const PortfolioCanvas = lazy(() => import('@/features/portfolio-3d/PortfolioCanvas'))

const ease = [0.22, 1, 0.36, 1] as const

const steps = [
  { title: 'Elige tu sector', text: 'Sanidad, derecho, cocina, educación, ingeniería… Los textos del formulario se adaptan a tu profesión y todo se guarda mientras escribes.' },
  { title: 'Revisa tu CV', text: 'Una hoja A4 con el diseño habitual en tu sector: lateral, clásico o con cabecera de color. Descárgala en PDF.' },
  { title: 'Comparte tu portfolio', text: 'Los mismos datos se convierten en una escena 3D con los colores y la forma de tu sector, que responde al ratón y al scroll.' },
]

const noop = () => () => {}
const useMounted = () => useSyncExternalStore(noop, () => true, () => false)

export function Landing() {
  const mounted = useMounted()
  const [sector, setSector] = useState<SectorId>('health')
  const reduce = useReducedMotion()
  const rise = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay, ease } }

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <section className="relative grid min-h-[100svh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
        <div className="relative z-10 flex flex-col px-6 pt-6 pb-10 sm:px-10 lg:pb-0">
          <header className="flex items-center justify-between">
            <Logo />
            <AppLink to="editor" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">
              Entrar al editor
            </AppLink>
          </header>

          <div className="flex flex-1 flex-col justify-center py-14 lg:py-0">
            <motion.h1 {...rise(0.05)} className="font-display max-w-[13ch] text-[clamp(2.8rem,6.2vw,5.6rem)] leading-[0.94] font-extrabold">
              Tu CV en papel y en tres dimensiones.
            </motion.h1>
            <motion.p {...rise(0.18)} className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-soft">
              Para cualquier profesión. Escribe tu trayectoria una sola vez y Relieve la convierte en un CV listo para PDF y en un portfolio web en 3D adaptado a tu sector.
            </motion.p>
            <motion.div {...rise(0.3)} className="mt-9 flex flex-wrap gap-3">
              <AppLink to="editor" className={buttonClass('primary')}>
                Crear mi CV gratis
              </AppLink>
              <AppLink to="portfolio" className={buttonClass('secondary')}>
                Ver un portfolio de ejemplo
              </AppLink>
            </motion.div>
          </div>

        </div>

        <div className="relative min-h-[70svh] overflow-hidden lg:m-3 lg:min-h-0 lg:rounded-[32px]">
          <div className="absolute inset-0 bg-[#121433]">
            {mounted && (
              <Suspense fallback={null}>
                <PortfolioCanvas data={sectorDemos[sector]} mode="hero" />
              </Suspense>
            )}
          </div>
          <div className="grain absolute inset-0" />
          <div className="stage absolute inset-x-0 top-0 p-4 sm:p-5">
            <p className="mb-2.5 px-1 text-sm text-white/70">Prueba otro sector</p>
            <div role="radiogroup" aria-label="Sector de ejemplo" className="flex flex-wrap gap-1.5">
              {sectorList.map((s) => {
                const Icon = sectorIcons[s.id]
                const on = s.id === sector
                return (
                  <button
                    key={s.id}
                    role="radio"
                    aria-checked={on}
                    onClick={() => setSector(s.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium backdrop-blur-md transition-colors',
                      on ? 'bg-white text-[#15173a]' : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                    )}
                  >
                    <Icon className="size-3.5" /> {s.short}
                  </button>
                )
              })}
            </div>
          </div>
          <p className="stage pointer-events-none absolute bottom-5 left-6 text-sm text-white/65">
            CV de ejemplo: {sectorDemos[sector].personal.headline.toLowerCase()}. Mueve el ratón.
          </p>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display max-w-[18ch] text-4xl leading-[1.02] font-bold sm:text-5xl">Tres pasos, un único formulario.</h2>
          <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((s, i) => (
              <li key={s.title} className="border-t-2 border-ink pt-6">
                <span className="font-display text-5xl font-extrabold text-violet">{i + 1}</span>
                <h3 className="mt-4 font-display text-2xl font-semibold">{s.title}</h3>
                <p className="mt-2 max-w-[38ch] leading-relaxed text-ink-soft">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-3 pb-3">
        <div className="stage relative overflow-hidden rounded-[32px] bg-[#121433] px-6 py-20 text-[#eceaff] sm:px-10 lg:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display max-w-[16ch] text-4xl leading-[1.02] font-bold sm:text-5xl">Cada sector tiene su propio escenario.</h2>
              <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-[#c9cbea]">
                Una enfermera no necesita el mismo portfolio que un arquitecto. Tu nombre en volumen, tus competencias en órbita y tus logros en tarjetas, con el tono visual de tu profesión.
              </p>
              <AppLink to="editor" className="mt-9 inline-flex h-11 items-center rounded-full bg-white px-5 font-medium text-[#121433] transition-transform active:scale-[0.98]">
                Empezar ahora
              </AppLink>
            </div>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10">
              {[
                ['Colores', 'Una paleta propia para cada sector'],
                ['Forma principal', 'Hélice, columnas, anillos, bloques o gráficas'],
                ['Tipografía', 'Con serifa en los sectores más formales'],
                ['Diseño del CV', 'Lateral, clásico o con cabecera de color'],
              ].map(([k, v]) => (
                <div key={k} className="bg-[#121433] p-6">
                  <dt className="text-sm text-[#a6a9d1]">{k}</dt>
                  <dd className="mt-2 font-display text-xl font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-ink-soft sm:px-10">
        <Logo className="text-ink" />
        <p>Tu CV, en relieve.</p>
      </footer>
    </div>
  )
}
