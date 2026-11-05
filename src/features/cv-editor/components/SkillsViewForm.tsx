'use client'
import { useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { defaultSkillsView, SKILL_LABELS, SKILL_LAYOUTS, SKILL_SHAPES, type SkillsView } from '@/lib/schema/cv'
import { accentPresets, resolveStyle } from '@/lib/design'
import { skillsHintText } from '@/lib/skills-text'
import { useCVStore, useSector } from '@/lib/store/cv-store'
import { cn } from '@/lib/utils'
import { Button, TextArea, TextField } from '@/components/ui'
import { usePreviewFocus } from '@/features/portfolio-3d/focus'
import { ColorPicker, Group, Slider } from './StyleForm'
import { Pills, Toggle } from './EffectsForm'

const layouts: Record<(typeof SKILL_LAYOUTS)[number], { label: string; hint: string; icon: React.ReactNode }> = {
  orbit: {
    label: 'Órbita',
    hint: 'Giran alrededor de un núcleo',
    icon: (
      <svg viewBox="0 0 40 24" className="h-6 w-10" aria-hidden>
        <ellipse cx="20" cy="12" rx="17" ry="7" fill="none" stroke="currentColor" strokeOpacity=".4" />
        <circle cx="20" cy="12" r="3.5" fill="currentColor" />
        <circle cx="5" cy="10" r="2.5" fill="currentColor" opacity=".7" />
        <circle cx="31" cy="17" r="3" fill="currentColor" opacity=".7" />
        <circle cx="30" cy="6" r="2" fill="currentColor" opacity=".7" />
      </svg>
    ),
  },
  cloud: {
    label: 'Nube',
    hint: 'Flotan formando una esfera',
    icon: (
      <svg viewBox="0 0 40 24" className="h-6 w-10" aria-hidden>
        {[[12, 8, 3], [22, 5, 2.5], [28, 12, 3.5], [17, 16, 2.5], [9, 16, 2], [24, 19, 2]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="currentColor" opacity={0.5 + (i % 3) * 0.2} />
        ))}
      </svg>
    ),
  },
  bars: {
    label: 'Columnas',
    hint: 'Una columna por habilidad',
    icon: (
      <svg viewBox="0 0 40 24" className="h-6 w-10" aria-hidden>
        {[10, 16, 12, 20, 14].map((h, i) => (
          <rect key={i} x={5 + i * 6.5} y={22 - h} width="4" height={h} rx="1" fill="currentColor" opacity={0.5 + i * 0.1} />
        ))}
      </svg>
    ),
  },
  list: {
    label: 'Lista',
    hint: 'Barras de progreso, sin 3D',
    icon: (
      <svg viewBox="0 0 40 24" className="h-6 w-10" aria-hidden>
        {[30, 22, 26].map((w, i) => (
          <g key={i}>
            <rect x="4" y={4 + i * 7} width="32" height="3" rx="1.5" fill="currentColor" opacity=".2" />
            <rect x="4" y={4 + i * 7} width={w} height="3" rx="1.5" fill="currentColor" />
          </g>
        ))}
      </svg>
    ),
  },
}

const shapeLabels: Record<(typeof SKILL_SHAPES)[number], string> = { sphere: 'Esferas', cube: 'Cubos', gem: 'Cristales', ring: 'Anillos' }
const labelLabels: Record<(typeof SKILL_LABELS)[number], string> = { full: 'Nombre y nivel', name: 'Solo el nombre', none: 'Sin etiquetas' }
const colorModes = ['gradient', 'single'] as const
const colorModeLabels: Record<(typeof colorModes)[number], string> = { gradient: 'Degradado según nivel', single: 'Un solo color' }

export function SkillsViewForm() {
  const cv = useCVStore((s) => s.cv)
  const setView = useCVStore((s) => s.setSkillsView)
  const sector = useSector()
  const v = cv.settings.skillsView
  const theme = resolveStyle(cv).theme
  const set = (p: Partial<SkillsView>) => setView(p)
  const focus = usePreviewFocus((s) => s.focus)
  const is3D = v.layout !== 'list'

  useEffect(() => {
    focus('about')
    return () => focus(null)
  }, [focus])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <p className="max-w-md text-sm text-ink-soft">Cambia cómo aparecen tus habilidades en el portfolio. La vista previa se desplaza a esta sección.</p>
        <Button size="sm" variant="ghost" onClick={() => setView(defaultSkillsView)}>
          <RotateCcw className="size-4" /> Restablecer
        </Button>
      </div>

      <Group title="Disposición">
        <div role="radiogroup" aria-label="Disposición" className="grid grid-cols-2 gap-2 @xl:grid-cols-4">
          {SKILL_LAYOUTS.map((id) => {
            const on = v.layout === id
            return (
              <button
                key={id}
                role="radio"
                aria-checked={on}
                onClick={() => set({ layout: id })}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-2xl border p-3 text-left transition-[border,box-shadow]',
                  on ? 'border-transparent bg-white text-violet shadow-[0_0_0_2px_var(--color-violet)]' : 'border-line bg-white/60 text-ink-soft hover:border-ink/25 hover:bg-white'
                )}
              >
                {layouts[id].icon}
                <span>
                  <span className="block text-sm font-semibold text-ink">{layouts[id].label}</span>
                  <span className="block text-xs leading-snug text-ink-soft">{layouts[id].hint}</span>
                </span>
              </button>
            )
          })}
        </div>
      </Group>

      {(v.layout === 'orbit' || v.layout === 'cloud') && (
        <Group title="Forma de cada habilidad">
          <Pills label="Forma de cada habilidad" options={SKILL_SHAPES} value={v.shape} labels={shapeLabels} onChange={(shape) => set({ shape })} />
        </Group>
      )}

      <Group title="Colores">
        <Pills label="Modo de color" options={colorModes} value={v.colorMode} labels={colorModeLabels} onChange={(colorMode) => set({ colorMode })} />
        {v.colorMode === 'gradient' ? (
          <div className="grid gap-6 @2xl:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-ink">Nivel bajo</p>
              <ColorPicker label="Color del nivel bajo" value={v.colorLow} fallback={theme.accent2} presets={accentPresets} onChange={(colorLow) => set({ colorLow })} />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-ink">Nivel alto</p>
              <ColorPicker label="Color del nivel alto" value={v.colorHigh} fallback={theme.warm} presets={accentPresets} onChange={(colorHigh) => set({ colorHigh })} />
            </div>
          </div>
        ) : (
          <ColorPicker label="Color de las habilidades" value={v.colorHigh} fallback={theme.warm} presets={accentPresets} onChange={(colorHigh) => set({ colorHigh })} />
        )}
        {(v.colorLow || v.colorHigh) && (
          <Button size="sm" variant="ghost" className="self-start" onClick={() => set({ colorLow: '', colorHigh: '' })}>
            Usar los colores del tema
          </Button>
        )}
      </Group>

      <Group title="Etiquetas">
        <Pills label="Etiquetas" options={SKILL_LABELS} value={v.labels} labels={labelLabels} onChange={(labels) => set({ labels })} />
      </Group>

      {is3D && (
        <Group title="Tamaño y espacio">
          <div className="grid gap-5 @md:grid-cols-2">
            <Slider label="Tamaño" value={v.size} min={0.6} max={1.6} onChange={(size) => set({ size })} />
            <Slider label="Separación" value={v.spread} min={0.7} max={1.4} onChange={(spread) => set({ spread })} />
          </div>
          {v.layout !== 'bars' && (
            <Toggle label="Núcleo central" hint="La esfera del centro, con tu color principal." checked={v.core} onChange={(core) => set({ core })} />
          )}
        </Group>
      )}

      <Group title="Textos de la sección">
        <TextField label="Título" placeholder="Sobre mí" value={v.title} onChange={(e) => set({ title: e.target.value })} />
        <Toggle label="Mostrar explicación" hint="La frase que explica cómo leer el gráfico." checked={v.showHint} onChange={(showHint) => set({ showHint })} />
        {v.showHint && (
          <TextArea
            label="Explicación"
            hint="Déjalo vacío para usar el texto automático."
            placeholder={skillsHintText({ ...v, hint: '' }, sector.labels.skillsHint)}
            value={v.hint}
            onChange={(e) => set({ hint: e.target.value })}
            className="[&_textarea]:min-h-20"
          />
        )}
      </Group>
    </div>
  )
}
