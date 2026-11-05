'use client'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, FileUp, Loader2, PenLine, X } from 'lucide-react'
import { SECTOR_IDS, type CV } from '@/lib/schema/cv'
import { useCVStore } from '@/lib/store/cv-store'
import { useAppEnv } from '@/lib/nav'
import { sectors } from '@/lib/sectors'
import { extractCv } from '@/lib/import/extract'
import { applyAdaptation, normalizeAdaptation, normalizeImported, type Adaptation } from '@/lib/import/normalize'
import { headingFonts } from '@/lib/design'
import { PremiumBadge, usePremium } from '@/features/premium/premium'
import { ImportError } from '@/lib/import/types'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { PhotoUpload } from '@/features/cv-editor/components/PhotoUpload'

type Step = { kind: 'pick' } | { kind: 'working'; stage: 'read' | 'ai'; file: string } | { kind: 'review'; cv: CV; adapt: Adaptation | null; useAdapt: boolean } | { kind: 'error'; text: string }

const ACCEPT = '.pdf,.docx,.txt,.md,image/jpeg,image/png,image/webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain'

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

export function ImportCvDialog() {
  const open = useCVStore((s) => s.importOpen)
  const setOpen = useCVStore((s) => s.setImportOpen)
  const current = useCVStore((s) => s.cv)
  const load = useCVStore((s) => s.load)
  const { importCv, navigate, assetBase } = useAppEnv()
  const [step, setStep] = useState<Step>({ kind: 'pick' })
  const [drag, setDrag] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const busy = step.kind === 'working'

  const busyRef = useRef(false)
  useEffect(() => {
    busyRef.current = busy
  }, [busy])

  useEffect(() => {
    if (!open) return
    panel.current?.focus()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && !busyRef.current && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open, setOpen])

  async function handle(file?: File) {
    if (!file || !importCv) return
    try {
      setStep({ kind: 'working', stage: 'read', file: file.name })
      const extracted = await extractCv(file, assetBase ?? '/')
      setStep({ kind: 'working', stage: 'ai', file: file.name })
      const raw = await importCv({ text: extracted.text, images: extracted.images })
      const cv = normalizeImported(raw, current)
      if (!cv.personal.fullName && cv.experience.length === 0 && cv.skills.length === 0)
        throw new ImportError('empty', 'No hemos reconocido un CV en el archivo. Prueba con otro.')
      const adapt = normalizeAdaptation(raw)
      setStep({ kind: 'review', cv, adapt, useAdapt: !!adapt })
    } catch (e) {
      const err = e instanceof ImportError ? e : new ImportError('failed')
      const text =
        err.code === 'unavailable'
          ? 'La lectura automática de CV no está disponible ahora mismo. Puedes rellenar tus datos en el editor.'
          : err.code === 'rate_limited'
            ? 'Hay muchas peticiones ahora mismo. Espera un minuto y vuelve a intentarlo.'
            : err.message && err.message !== err.code
              ? err.message
              : 'No se pudo leer el CV. Prueba con otro archivo o con un PDF.'
      setStep({ kind: 'error', text })
    }
  }

  function apply(goTo: 'portfolio' | 'editor') {
    if (step.kind !== 'review') return
    load(step.useAdapt && step.adapt ? applyAdaptation(step.cv, step.adapt) : step.cv)
    setOpen(false)
    if (goTo === 'portfolio') navigate?.('portfolio')
    else navigate?.('editor')
  }

  if (!importCv) return null

  return (
    <AnimatePresence onExitComplete={() => setStep({ kind: 'pick' })}>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-end bg-ink/40 backdrop-blur-sm sm:place-items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onPointerDown={(e) => e.target === e.currentTarget && !busy && setOpen(false)}
        >
          <motion.div
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-title"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="scrollbar-thin max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] bg-paper p-6 text-ink shadow-[0_30px_80px_-20px_rgb(21_23_58/0.5)] outline-none sm:max-w-lg sm:rounded-[28px] sm:p-7"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="import-title" className="font-display text-2xl font-bold">
                  {step.kind === 'review' ? 'Hemos leído tu CV' : 'Crea tu portfolio desde tu CV'}
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  {step.kind === 'review'
                    ? 'Revisa el resumen y elige cómo seguir. Siempre podrás cambiar cualquier dato en el editor.'
                    : 'Sube tu CV y rellenamos el editor por ti: perfil, experiencia, formación, habilidades y proyectos.'}
                </p>
              </div>
              <button
                aria-label="Cerrar"
                disabled={busy}
                onClick={() => setOpen(false)}
                className="grid size-10 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-ink/5 hover:text-ink disabled:opacity-30"
              >
                <X className="size-5" />
              </button>
            </div>

            {step.kind === 'pick' && (
              <>
                <button
                  onClick={() => input.current?.click()}
                  onDragOver={(e) => (e.preventDefault(), setDrag(true))}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => (e.preventDefault(), setDrag(false), handle(e.dataTransfer.files[0]))}
                  className={cn(
                    'flex w-full flex-col items-center gap-3 rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-colors',
                    drag ? 'border-violet bg-violet/5' : 'border-ink/15 bg-white hover:border-violet/50'
                  )}
                >
                  <span className="grid size-14 place-items-center rounded-2xl bg-violet/10 text-violet">
                    <FileUp className="size-7" />
                  </span>
                  <span className="font-display text-lg font-semibold">Elige tu CV o arrástralo aquí</span>
                  <span className="text-sm text-ink-soft">PDF, Word (.docx), foto o texto. Máximo 10 MB.</span>
                </button>
                <input ref={input} type="file" accept={ACCEPT} hidden onChange={(e) => handle(e.target.files?.[0] ?? undefined)} />
                <p className="mt-4 text-xs leading-relaxed text-ink-soft">
                  Tu CV se analiza con IA solo para extraer tus datos. Sustituirá el contenido actual del editor; tus colores, tipografías y efectos se mantienen.
                </p>
              </>
            )}

            {step.kind === 'working' && (
              <div className="flex flex-col gap-4 rounded-3xl bg-white p-6" role="status" aria-live="polite">
                <p className="truncate text-sm text-ink-soft">{step.file}</p>
                {(
                  [
                    ['read', 'Leyendo el archivo'],
                    ['ai', 'Extrayendo tus datos con IA (puede tardar unos segundos)'],
                  ] as const
                ).map(([id, label]) => {
                  const done = id === 'read' && step.stage === 'ai'
                  const active = step.stage === id
                  return (
                    <div key={id} className={cn('flex items-center gap-3 text-sm', !done && !active && 'text-ink-soft')}>
                      {done ? <Check className="size-5 text-[#1f9e86]" /> : active ? <Loader2 className="size-5 animate-spin text-violet" /> : <span className="size-5" />}
                      {label}
                    </div>
                  )
                })}
              </div>
            )}

            {step.kind === 'error' && (
              <div className="flex flex-col items-start gap-4">
                <p className="rounded-2xl bg-[#c23a52]/[0.07] p-4 text-sm text-[#8f2238]" role="alert">
                  {step.text}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setStep({ kind: 'pick' })}>Probar con otro archivo</Button>
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Rellenar a mano
                  </Button>
                </div>
              </div>
            )}

            {step.kind === 'review' && (
              <Review
                cv={step.cv}
                adapt={step.adapt}
                useAdapt={step.useAdapt}
                onToggle={(useAdapt) => setStep({ ...step, useAdapt })}
                onChange={(cv) => setStep({ ...step, cv })}
                onApply={apply}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const shapeNames: Record<string, string> = { core: 'Esfera', knot: 'Nudo', helix: 'Hélice', columns: 'Columnas', rings: 'Anillos', blocks: 'Bloques', bars: 'Barras' }
const skillNames: Record<string, string> = { orbit: 'Órbita', cloud: 'Nube', bars: 'Columnas', list: 'Lista' }
const cvNames: Record<string, string> = { sidebar: 'Lateral', classic: 'Clásico', compact: 'Cabecera de color' }
const tplNames: Record<string, string> = { film: 'Cine', cosmos: 'Cosmos' }

function AdaptationCard({ a, on, onToggle }: { a: Adaptation; on: boolean; onToggle: (v: boolean) => void }) {
  const { openUpgrade } = usePremium()
  const labels = Object.values(a.labels).filter(Boolean)
  const chips = [
    a.headingFont && `Tipografía ${headingFonts[a.headingFont].label}`,
    a.shape && `Forma 3D: ${shapeNames[a.shape]}`,
    a.skillsLayout && `Habilidades en ${skillNames[a.skillsLayout].toLowerCase()}`,
    a.cvLayout && `CV ${cvNames[a.cvLayout].toLowerCase()}`,
  ].filter(Boolean) as string[]
  return (
    <div className={cn('rounded-3xl p-5 ring-1 transition-colors', on ? 'bg-white ring-violet/40' : 'bg-white/60 ring-line')}>
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" checked={on} onChange={(e) => onToggle(e.target.checked)} className="mt-1 size-4 accent-violet" />
        <span>
          <span className="block font-display text-base font-bold">Adaptar diseño y textos a tu profesión</span>
          {a.reason && <span className="mt-0.5 block text-sm text-ink-soft">{a.reason}</span>}
        </span>
      </label>
      <div className={cn('mt-4 flex flex-wrap gap-1.5 text-xs', !on && 'opacity-50')}>
        {a.accent && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-2.5 py-1">
            <span className="size-3 rounded-full" style={{ background: a.accent }} /> Color
          </span>
        )}
        {chips.map((c) => (
          <span key={c} className="rounded-full bg-paper-2 px-2.5 py-1">
            {c}
          </span>
        ))}
      </div>
      {labels.length > 0 && (
        <p className={cn('mt-3 text-xs text-ink-soft', !on && 'opacity-50')}>
          Apartados: <span className="text-ink">{labels.join(' · ')}</span>
        </p>
      )}
      {(a.portfolioTemplate === 'film' || a.portfolioTemplate === 'cosmos') && (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
          Para tu perfil encaja el portfolio <strong className="text-ink">{tplNames[a.portfolioTemplate]}</strong> <PremiumBadge />
          <button onClick={openUpgrade} className="font-medium text-violet underline-offset-2 hover:underline">
            Ver precios
          </button>
        </p>
      )}
    </div>
  )
}

function Review({
  cv,
  adapt,
  useAdapt,
  onToggle,
  onChange,
  onApply,
}: {
  cv: CV
  adapt: Adaptation | null
  useAdapt: boolean
  onToggle: (v: boolean) => void
  onChange: (cv: CV) => void
  onApply: (to: 'portfolio' | 'editor') => void
}) {
  const p = cv.personal
  const counts = [
    plural(cv.experience.length, 'experiencia', 'experiencias'),
    plural(cv.education.length, 'formación', 'formaciones'),
    plural(cv.skills.length, 'habilidad', 'habilidades'),
    plural(cv.projects.length, 'proyecto', 'proyectos'),
  ]
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-3xl bg-white p-5">
        <p className="font-display text-xl font-bold">{p.fullName || 'Sin nombre'}</p>
        {p.headline && <p className="text-sm text-ink-soft">{p.headline}</p>}
        <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {counts.map((c) => (
            <li key={c} className="flex items-center gap-2">
              <Check className="size-4 text-[#1f9e86]" /> {c}
            </li>
          ))}
        </ul>
      </div>

      {adapt && <AdaptationCard a={adapt} on={useAdapt} onToggle={onToggle} />}

      <div>
        <p className="mb-2 text-sm font-medium">Sector detectado</p>
        <div role="radiogroup" aria-label="Sector" className="flex flex-wrap gap-1.5">
          {SECTOR_IDS.map((id) => (
            <button
              key={id}
              role="radio"
              aria-checked={cv.settings.sector === id}
              onClick={() => onChange({ ...cv, settings: { ...cv.settings, sector: id } })}
              className={cn(
                'rounded-full px-3 py-2 text-[13px] font-medium transition-colors sm:py-1.5',
                cv.settings.sector === id ? 'bg-ink text-white' : 'bg-white text-ink-soft ring-1 ring-line hover:text-ink'
              )}
            >
              {sectors[id].short}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">{p.photoUrl ? 'Tu foto' : 'Añade tu foto (opcional)'}</p>
        <PhotoUpload value={p.photoUrl} name={p.fullName} onChange={(photoUrl) => onChange({ ...cv, personal: { ...p, photoUrl } })} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Button className="sm:flex-1" onClick={() => onApply('portfolio')}>
          Ver mi portfolio <ArrowRight className="size-4" />
        </Button>
        <Button variant="secondary" className="sm:flex-1" onClick={() => onApply('editor')}>
          <PenLine className="size-4" /> Revisar en el editor
        </Button>
      </div>
    </div>
  )
}
