'use client'
import { ArrowRight, FileUp, BriefcaseBusiness, ChefHat, Code, GraduationCap, HardHat, HeartPulse, Palette, Scale, Wand2 } from 'lucide-react'
import { PREMIUM_LAYOUTS, PREMIUM_TEMPLATES, type CVLayout, type PortfolioTemplate, type SectorId } from '@/lib/schema/cv'
import { PremiumBadge, usePremium } from '@/features/premium/premium'
import { sectorList, sectors } from '@/lib/sectors'
import { useCVStore, useSector } from '@/lib/store/cv-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { SectionHeader } from './ListItem'
import { LabelsForm } from './LabelsForm'

export const sectorIcons: Record<SectorId, typeof Code> = {
  tech: Code,
  creative: Palette,
  health: HeartPulse,
  legal: Scale,
  education: GraduationCap,
  hospitality: ChefHat,
  engineering: HardHat,
  business: BriefcaseBusiness,
}

const layouts: { id: CVLayout; label: string; hint: string }[] = [
  { id: 'sidebar', label: 'Lateral', hint: 'Columna con foto y habilidades' },
  { id: 'classic', label: 'Clásico', hint: 'Sobrio, a una columna y con serifa' },
  { id: 'compact', label: 'Cabecera de color', hint: 'Banda de color y dos columnas' },
  { id: 'editorial', label: 'Editorial', hint: 'Foto grande, banda de color y bloques destacados' },
  { id: 'impact', label: 'Impacto', hint: 'Nombre gigante a dos colores y foto circular' },
]

const templates: { id: PortfolioTemplate; label: string; hint: string; bg: string; fg: string; dot: string }[] = [
  { id: 'stage', label: 'Escenario 3D', hint: 'Tu nombre en 3D y la forma de tu sector', bg: '#121433', fg: '#eceaff', dot: '#7c6bff' },
  { id: 'film', label: 'Cine', hint: 'Escenas, línea de tiempo de clips y créditos', bg: '#f6f5ef', fg: '#1f271c', dot: '#5c6a4a' },
  { id: 'cosmos', label: 'Cosmos', hint: 'Esfera iridiscente y narrativa al hacer scroll', bg: '#000000', fg: '#f4f3fb', dot: '#7b3dff' },
]

function LayoutThumb({ id }: { id: CVLayout }) {
  return (
    <svg viewBox="0 0 42 56" className="h-14 w-[42px] shrink-0 rounded-[4px] bg-white ring-1 ring-line" aria-hidden>
      {id === 'sidebar' && (
        <>
          <rect x="0" y="0" width="14" height="56" fill="var(--cv-accent)" opacity=".14" />
          <circle cx="7" cy="8" r="4" fill="var(--cv-accent)" opacity=".5" />
          {[18, 22, 26, 30].map((y) => <rect key={y} x="3" y={y} width="8" height="1.6" rx=".8" fill="var(--cv-accent)" />)}
          <rect x="18" y="6" width="18" height="3.5" rx="1" fill="#15173a" />
          {[14, 18, 22, 28, 32, 36, 42, 46].map((y) => <rect key={y} x="18" y={y} width={y % 8 ? 20 : 15} height="1.6" rx=".8" fill="#c7cae0" />)}
        </>
      )}
      {id === 'classic' && (
        <>
          <rect x="6" y="6" width="22" height="3.5" rx="1" fill="#15173a" />
          <rect x="6" y="12" width="14" height="1.6" rx=".8" fill="#9a9db8" />
          {[18, 28, 38].map((y) => (
            <g key={y}>
              <rect x="6" y={y} width="30" height=".6" fill="#d9d6cf" />
              <rect x="6" y={y + 3} width="7" height="1.6" rx=".8" fill="var(--cv-accent)" />
              <rect x="16" y={y + 3} width="20" height="1.6" rx=".8" fill="#c7cae0" />
              <rect x="16" y={y + 6} width="16" height="1.6" rx=".8" fill="#c7cae0" />
            </g>
          ))}
        </>
      )}
      {id === 'editorial' && (
        <>
          <rect x="16" y="2" width="24" height="18" rx="3" fill="var(--cv-accent)" />
          <rect x="3" y="4" width="15" height="17" rx="3" fill="var(--cv-accent)" opacity=".55" />
          <rect x="20" y="7" width="14" height="3" rx="1" fill="white" />
          {[26, 30, 34].map((y) => <rect key={y} x="4" y={y} width="10" height="1.6" rx=".8" fill="var(--cv-accent)" />)}
          {[26, 30, 34, 38].map((y) => <rect key={y} x="19" y={y} width="19" height="1.6" rx=".8" fill="#c7cae0" />)}
          <rect x="19" y="43" width="19" height="9" rx="2" fill="var(--cv-accent)" opacity=".25" />
        </>
      )}
      {id === 'impact' && (
        <>
          <path d="M0 0h26c3 6-2 10-8 12-6 2-6 8-10 11C5 25 2 26 0 26Z" fill="var(--cv-accent)" opacity=".2" />
          <rect x="4" y="9" width="18" height="4" rx="1" fill="#2b2724" />
          <rect x="4" y="14" width="20" height="4" rx="1" fill="var(--cv-accent)" />
          <circle cx="33" cy="9" r="6" fill="none" stroke="var(--cv-accent)" strokeOpacity=".35" strokeWidth="1.6" />
          <rect x="4" y="22" width="34" height=".6" fill="var(--cv-accent)" opacity=".4" />
          {[27, 31, 35].map((y) => <rect key={y} x="4" y={y} width="11" height="1.6" rx=".8" fill="#c7cae0" />)}
          {[27, 31, 35, 39].map((y) => <rect key={y} x="19" y={y} width="19" height="1.6" rx=".8" fill={y === 27 ? 'var(--cv-accent)' : '#c7cae0'} />)}
        </>
      )}
      {id === 'compact' && (
        <>
          <rect x="0" y="0" width="42" height="15" fill="var(--cv-accent)" />
          <circle cx="8" cy="7.5" r="4" fill="white" opacity=".6" />
          <rect x="15" y="5" width="18" height="3" rx="1" fill="white" />
          {[21, 25, 29, 35, 39, 43].map((y) => <rect key={y} x="4" y={y} width="20" height="1.6" rx=".8" fill="#c7cae0" />)}
          {[21, 25, 29, 33].map((y) => <rect key={y} x="28" y={y} width="10" height="1.6" rx=".8" fill="var(--cv-accent)" opacity=".7" />)}
        </>
      )}
    </svg>
  )
}

export function SectorForm() {
  const sector = useSector()
  const settings = useCVStore((s) => s.cv.settings)
  const setSettings = useCVStore((s) => s.setSettings)
  const loadDemo = useCVStore((s) => s.loadDemo)
  const active = settings.cvLayout === 'auto' ? sector.cvLayout : settings.cvLayout

  const openImport = useCVStore((s) => s.setImportOpen)
  const { canCv, canPortfolio, openUpgrade } = usePremium()

  return (
    <div className="flex flex-col gap-8" style={{ ['--cv-accent' as string]: sector.cvAccent }}>
      <button
        onClick={() => openImport(true)}
        className="flex items-center gap-4 rounded-3xl bg-ink p-5 text-left text-white transition-transform active:scale-[0.99]"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10">
          <FileUp className="size-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-bold">¿Ya tienes un CV?</span>
          <span className="block text-sm text-white/70">Súbelo en PDF, Word o foto y rellenamos todo por ti.</span>
        </span>
        <ArrowRight className="size-5 shrink-0" />
      </button>

      <div>
        <SectionHeader
          title="Sector"
          description="Adapta los textos del formulario, el diseño del CV y el escenario 3D de tu portfolio a tu profesión."
        />
        <div role="radiogroup" aria-label="Sector profesional" className="grid gap-2 @md:grid-cols-2">
          {sectorList.map((s) => {
            const Icon = sectorIcons[s.id]
            const on = s.id === settings.sector
            return (
              <button
                key={s.id}
                role="radio"
                aria-checked={on}
                onClick={() => setSettings({ sector: s.id })}
                className={cn(
                  'flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-[border,background,box-shadow]',
                  on ? 'border-transparent bg-white shadow-[0_0_0_2px_var(--sel)]' : 'border-line bg-white/60 hover:border-ink/25 hover:bg-white'
                )}
                style={{ ['--sel' as string]: s.cvAccent }}
              >
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-xl"
                  style={{ background: `color-mix(in srgb, ${s.cvAccent} 12%, white)`, color: s.cvAccent }}
                >
                  <Icon className="size-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{s.label}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{s.examples}</span>
                </span>
              </button>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-paper-2/70 p-4">
          <p className="flex-1 text-sm text-ink-soft">
            ¿Quieres ver cómo queda? Rellena el editor con un perfil de ejemplo de {sectors[settings.sector].short.toLowerCase()}. Sustituye los datos actuales.
          </p>
          <Button size="sm" variant="secondary" onClick={() => loadDemo(settings.sector)}>
            <Wand2 className="size-4" /> Cargar ejemplo
          </Button>
        </div>
      </div>

      <LabelsForm />

      <div>
        <h3 className="font-display text-lg font-bold text-ink">Diseño del CV</h3>
        <p className="mt-1 text-sm text-ink-soft">Por defecto usamos el más habitual en tu sector.</p>
        <div role="radiogroup" aria-label="Diseño del CV" className="mt-4 grid gap-2 @lg:grid-cols-2 @3xl:grid-cols-3">
          {layouts.map((l) => {
            const on = active === l.id
            return (
              <button
                key={l.id}
                role="radio"
                aria-checked={on}
                onClick={() => setSettings({ cvLayout: l.id === sector.cvLayout ? 'auto' : l.id })}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border p-3 text-left transition-[border,box-shadow]',
                  on ? 'border-transparent bg-white shadow-[0_0_0_2px_var(--cv-accent)]' : 'border-line bg-white/60 hover:border-ink/25'
                )}
              >
                <LayoutThumb id={l.id} />
                <span>
                  <span className="block text-sm font-semibold text-ink">
                    {l.label}
                    {l.id === sector.cvLayout && <span className="ml-1.5 font-normal text-ink-soft">(recomendado)</span>}
                    {PREMIUM_LAYOUTS.includes(l.id) && <PremiumBadge className="ml-1.5 align-middle" />}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{l.hint}</span>
                </span>
              </button>
            )
          })}
        </div>
        {!canCv && PREMIUM_LAYOUTS.includes(active) && <PremiumNote onClick={openUpgrade} what="Este diseño de CV" price="CV + portfolio Premium por 1,99 €" />}
      </div>

      <div>
        <h3 className="font-display text-lg font-bold text-ink">Diseño del portfolio</h3>
        <p className="mt-1 text-sm text-ink-soft">Cambia por completo cómo se ve tu web. Tus datos son los mismos.</p>
        <div role="radiogroup" aria-label="Diseño del portfolio" className="mt-4 grid gap-2 @lg:grid-cols-3">
          {templates.map((t) => {
            const on = settings.portfolioTemplate === t.id
            return (
              <button
                key={t.id}
                role="radio"
                aria-checked={on}
                onClick={() => setSettings({ portfolioTemplate: t.id })}
                className={cn(
                  'flex flex-col items-stretch gap-2 rounded-2xl border p-2.5 text-left transition-[border,box-shadow]',
                  on ? 'border-transparent bg-white shadow-[0_0_0_2px_var(--cv-accent)]' : 'border-line bg-white/60 hover:border-ink/25'
                )}
              >
                <span className="relative grid h-20 place-items-center overflow-hidden rounded-xl" style={{ background: t.bg, color: t.fg }} aria-hidden>
                  {t.id === 'cosmos' ? (
                    <span className="size-12 rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, #3a1d7a, #0c0620 65%)', boxShadow: '0 0 18px 2px #6d3bff99, inset 4px -4px 12px #5ee6ff88, inset 0 0 0 1.5px #b9a0ff' }} />
                  ) : t.id === 'film' ? (
                    <span className="w-full px-3">
                      <span className="block font-display text-sm font-extrabold">ESCENA 01</span>
                      <span className="mt-1.5 flex gap-1">
                        {[0, 1, 2, 3].map((i) => <span key={i} className="h-3 flex-1 rounded-sm" style={{ background: i === 1 ? t.dot : `${t.fg}22` }} />)}
                      </span>
                    </span>
                  ) : (
                    <span className="font-display text-lg font-extrabold" style={{ textShadow: `2px 2px 0 ${t.dot}` }}>Aa</span>
                  )}
                </span>
                <span className="px-1 pb-1">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    {t.label} {PREMIUM_TEMPLATES.includes(t.id) && <PremiumBadge />}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{t.hint}</span>
                </span>
              </button>
            )
          })}
        </div>
        {!canPortfolio && PREMIUM_TEMPLATES.includes(settings.portfolioTemplate) && <PremiumNote onClick={openUpgrade} what="Este diseño de portfolio" price="1 € solo el portfolio, o 1,99 € con el CV" />}
      </div>
    </div>
  )
}

function PremiumNote({ onClick, what, price }: { onClick: () => void; what: string; price: string }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-gradient-to-r from-[#fdf3d6] to-[#fbe7b5] p-3.5 text-sm text-[#5a3d00]">
      <p className="flex-1">{what} es Premium: puedes verlo en la vista previa. Para descargarlo y publicarlo: {price}, pago único.</p>
      <button onClick={onClick} className="rounded-full bg-[#3b2a00] px-4 py-2 text-sm font-medium text-[#fbe7b5]">
        Ver precios
      </button>
    </div>
  )
}
