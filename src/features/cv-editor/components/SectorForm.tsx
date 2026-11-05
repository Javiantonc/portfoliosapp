'use client'
import { BriefcaseBusiness, ChefHat, Code, GraduationCap, HardHat, HeartPulse, Palette, Scale, Wand2 } from 'lucide-react'
import type { CVLayout, SectorId } from '@/lib/schema/cv'
import { sectorList, sectors } from '@/lib/sectors'
import { useCVStore, useSector } from '@/lib/store/cv-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { SectionHeader } from './ListItem'

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

  return (
    <div className="flex flex-col gap-8" style={{ ['--cv-accent' as string]: sector.cvAccent }}>
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

      <div>
        <h3 className="font-display text-lg font-bold text-ink">Diseño del CV</h3>
        <p className="mt-1 text-sm text-ink-soft">Por defecto usamos el más habitual en tu sector.</p>
        <div role="radiogroup" aria-label="Diseño del CV" className="mt-4 grid gap-2 @xl:grid-cols-3">
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
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{l.hint}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
