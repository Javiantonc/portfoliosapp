'use client'
import { useEffect, useId, type ReactNode } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { BODY_FONTS, defaultStyle, HEADING_FONTS, SHAPES, type Settings } from '@/lib/schema/cv'
import { accentPresets, bodyFonts, ensureAllFonts, headingFonts, isHex, luminance, resolveStyle, stagePresets } from '@/lib/design'
import { useCVStore, useSector } from '@/lib/store/cv-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { SectionHeader } from './ListItem'

const shapeLabels: Record<(typeof SHAPES)[number], string> = {
  auto: 'La del sector',
  core: 'Esfera',
  knot: 'Nudo',
  helix: 'Hélice',
  columns: 'Columnas',
  rings: 'Anillos',
  blocks: 'Bloques',
  bars: 'Barras',
}

export function Group({ title, hint, action, children }: { title: string; hint?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <legend className="font-display text-base font-bold text-ink">{title}</legend>
          {hint && <p className="mt-0.5 text-xs text-ink-soft">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </fieldset>
  )
}

export function ColorPicker({ value, fallback, presets, onChange, label }: { value: string; fallback: string; presets: string[]; onChange: (v: string) => void; label: string }) {
  const current = isHex(value) ? value : fallback

  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {presets.map((c) => {
          const on = value.toLowerCase() === c.toLowerCase()
          return (
            <button
              key={c}
              role="radio"
              aria-checked={on}
              aria-label={c}
              title={c}
              onClick={() => onChange(c)}
              className={cn('grid size-8 place-items-center rounded-full ring-1 ring-ink/10 transition-transform hover:scale-110', on && 'ring-2 ring-ink ring-offset-2')}
              style={{ background: c }}
            >
              {on && <Check className="size-4" style={{ color: luminance(c) > 0.4 ? '#15173a' : '#fff' }} />}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-2">
        <label className="relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-xl ring-1 ring-line" style={{ background: current }}>
          <span className="sr-only">Elegir cualquier color</span>
          <input type="color" value={current} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 size-full cursor-pointer opacity-0" />
        </label>
        <input
          aria-label={`${label} en hexadecimal`}
          key={current}
          defaultValue={current}
          onBlur={(e) => {
            const v = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`
            if (isHex(v)) onChange(v)
            else e.target.value = current
          }}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className="h-10 w-28 rounded-xl border border-line bg-white px-3 font-mono text-sm uppercase outline-none focus:border-violet focus:ring-4 focus:ring-violet/12"
        />
        <span className="text-xs text-ink-soft">Pulsa el cuadrado para elegir cualquier color.</span>
      </div>
    </div>
  )
}

export function Slider({ label, value, min, max, onChange, format }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; format?: (v: number) => string }) {
  const pct = Math.round(value * 100)
  const id = useId()
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between text-sm">
        <label htmlFor={id} className="font-medium text-ink">{label}</label>
        <span className="tabular-nums text-ink-soft">{format ? format(value) : `${pct} %`}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min * 100}
        max={max * 100}
        step={1}
        value={pct}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="level w-full"
        style={{ ['--val' as string]: `${((pct - min * 100) / ((max - min) * 100)) * 100}%` }}
      />
    </div>
  )
}

function Choice({ on, onClick, children, className }: { on: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      role="radio"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        'rounded-2xl border p-3 text-left transition-[border,box-shadow]',
        on ? 'border-transparent bg-white shadow-[0_0_0_2px_var(--color-violet)]' : 'border-line bg-white/60 hover:border-ink/25 hover:bg-white',
        className
      )}
    >
      {children}
    </button>
  )
}

export function StyleForm() {
  const cv = useCVStore((s) => s.cv)
  const setSettings = useCVStore((s) => s.setSettings)
  const sector = useSector()
  const st = cv.settings
  const resolved = resolveStyle(cv)
  const set = (p: Partial<Settings>) => setSettings(p)
  const sectorHeading = headingFonts[sector.theme.font]

  useEffect(ensureAllFonts, [])

  return (
    <div className="flex flex-col gap-9">
      <SectionHeader
        title="Personalizar"
        description="Elige colores, tipografías y tamaños. Los cambios se aplican a la vez al CV y al portfolio 3D."
        action={
          <Button size="sm" variant="ghost" onClick={() => set(defaultStyle)}>
            <RotateCcw className="size-4" /> Restablecer
          </Button>
        }
      />

      <Group
        title="Color principal"
        hint="Títulos del CV, detalles y forma 3D."
        action={st.accent && <Button size="sm" variant="ghost" onClick={() => set({ accent: '' })}>Usar el del sector</Button>}
      >
        <ColorPicker label="Color principal" value={st.accent} fallback={sector.cvAccent} presets={accentPresets} onChange={(accent) => set({ accent })} />
      </Group>

      <Group
        title="Fondo del portfolio"
        hint="Con un fondo claro, los textos pasan a oscuro automáticamente."
        action={st.stageBg && <Button size="sm" variant="ghost" onClick={() => set({ stageBg: '' })}>Usar el del sector</Button>}
      >
        <ColorPicker label="Fondo del portfolio" value={st.stageBg} fallback={sector.theme.bg} presets={stagePresets} onChange={(stageBg) => set({ stageBg })} />
      </Group>

      <Group title="Tipografía de los títulos" hint="Tu nombre en 3D y los títulos del CV.">
        <div role="radiogroup" aria-label="Tipografía de los títulos" className="grid grid-cols-2 gap-2 @lg:grid-cols-4">
          {HEADING_FONTS.map((id) => {
            const f = id === 'auto' ? sectorHeading : headingFonts[id]
            return (
              <Choice key={id} on={st.headingFont === id} onClick={() => set({ headingFont: id })}>
                <span className="block truncate text-[26px] leading-none font-bold text-ink" style={{ fontFamily: f.family }}>
                  Aa
                </span>
                <span className="mt-2 block truncate text-xs text-ink-soft">{id === 'auto' ? `Del sector (${f.label})` : f.label}</span>
              </Choice>
            )
          })}
        </div>
      </Group>

      <Group title="Tipografía del texto" hint="Párrafos, fechas y descripciones.">
        <div role="radiogroup" aria-label="Tipografía del texto" className="grid grid-cols-2 gap-2 @lg:grid-cols-3">
          {BODY_FONTS.map((id) => (
            <Choice key={id} on={st.bodyFont === id} onClick={() => set({ bodyFont: id })}>
              <span className="block text-[15px] text-ink" style={{ fontFamily: bodyFonts[id].family }}>
                Experiencia y logros
              </span>
              <span className="mt-1 block text-xs text-ink-soft">{bodyFonts[id].label}</span>
            </Choice>
          ))}
        </div>
      </Group>

      <Group title="Tamaños">
        <div className="grid gap-5 @md:grid-cols-2">
          <Slider label="Nombre" value={st.titleScale} min={0.8} max={1.3} onChange={(titleScale) => set({ titleScale })} />
          <Slider label="Texto del CV" value={st.textScale} min={0.85} max={1.15} onChange={(textScale) => set({ textScale })} />
        </div>
      </Group>

      <Group title="Forma 3D principal" hint="La figura que acompaña a tu nombre en el portfolio.">
        <div role="radiogroup" aria-label="Forma 3D" className="flex flex-wrap gap-2">
          {SHAPES.map((id) => {
            const on = st.shape === id
            return (
              <button
                key={id}
                role="radio"
                aria-checked={on}
                onClick={() => set({ shape: id })}
                className={cn(
                  'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  on ? 'bg-ink text-white' : 'bg-white text-ink-soft ring-1 ring-line hover:text-ink'
                )}
              >
                {shapeLabels[id]}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-ink-soft">Forma actual: {shapeLabels[resolved.theme.shape]}.</p>
      </Group>
    </div>
  )
}
