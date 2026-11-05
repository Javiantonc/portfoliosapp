'use client'
import { RotateCcw } from 'lucide-react'
import { BACKGROUNDS, defaultEffects, MATERIALS, type Effects } from '@/lib/schema/cv'
import { useCVStore } from '@/lib/store/cv-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { SectionHeader } from './ListItem'
import { Group, Slider } from './StyleForm'

const presets: { name: string; hint: string; fx: Effects }[] = [
  { name: 'Equilibrado', hint: 'La configuración por defecto', fx: defaultEffects },
  { name: 'Sutil', hint: 'Movimiento suave y discreto', fx: { background: 'stars', density: 0.6, mouse: 0.5, speed: 0.5, float: true, bloom: 0, material: 'matte', tilt: true } },
  { name: 'Espectacular', hint: 'Neón, resplandor y mucho movimiento', fx: { background: 'stars', density: 1.8, mouse: 1.6, speed: 1.4, float: true, bloom: 1.2, material: 'neon', tilt: true } },
  { name: 'Futurista', hint: 'Cuadrícula y nombre de cristal', fx: { background: 'grid', density: 1, mouse: 1.2, speed: 1, float: true, bloom: 0.7, material: 'glass', tilt: true } },
  { name: 'Quieto', hint: 'Sin animaciones, ideal para leer', fx: { background: 'none', density: 1, mouse: 0, speed: 0, float: false, bloom: 0, material: 'metal', tilt: false } },
]

const bgLabels: Record<(typeof BACKGROUNDS)[number], string> = { stars: 'Estrellas', grid: 'Cuadrícula', none: 'Liso' }
const matLabels: Record<(typeof MATERIALS)[number], string> = { metal: 'Metálico', matte: 'Mate', glass: 'Cristal', neon: 'Neón' }

const same = (a: Effects, b: Effects) => (Object.keys(a) as (keyof Effects)[]).every((k) => a[k] === b[k])

export function Pills<T extends string>({ label, options, value, onChange, labels }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void; labels: Record<T, string> }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={cn(
            'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
            value === o ? 'bg-ink text-white' : 'bg-white text-ink-soft ring-1 ring-line hover:text-ink'
          )}
        >
          {labels[o]}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4">
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="block text-xs text-ink-soft">{hint}</span>
      </span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-paper-2 transition-colors peer-checked:bg-violet peer-focus-visible:ring-2 peer-focus-visible:ring-violet peer-focus-visible:ring-offset-2" />
        <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  )
}

const level = (v: number) => (v === 0 ? 'Desactivado' : `${Math.round(v * 100)} %`)

export function EffectsForm() {
  const fx = useCVStore((s) => s.cv.settings.effects)
  const setEffects = useCVStore((s) => s.setEffects)

  return (
    <div className="flex flex-col gap-9">
      <SectionHeader
        title="Efectos 3D"
        description="Decide cuánto se mueve y brilla tu portfolio. Los cambios se ven al instante en la vista previa."
        action={
          <Button size="sm" variant="ghost" onClick={() => setEffects(defaultEffects)}>
            <RotateCcw className="size-4" /> Restablecer
          </Button>
        }
      />

      <Group title="Combinaciones rápidas" hint="Un punto de partida. Después puedes ajustar cada efecto.">
        <div role="radiogroup" aria-label="Combinaciones de efectos" className="grid grid-cols-2 gap-2 @xl:grid-cols-3">
          {presets.map((p) => {
            const on = same(fx, p.fx)
            return (
              <button
                key={p.name}
                role="radio"
                aria-checked={on}
                onClick={() => setEffects(p.fx)}
                className={cn(
                  'rounded-2xl border p-3 text-left transition-[border,box-shadow]',
                  on ? 'border-transparent bg-white shadow-[0_0_0_2px_var(--color-violet)]' : 'border-line bg-white/60 hover:border-ink/25 hover:bg-white'
                )}
              >
                <span className="block text-sm font-semibold text-ink">{p.name}</span>
                <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{p.hint}</span>
              </button>
            )
          })}
        </div>
      </Group>

      <Group title="Fondo animado">
        <Pills label="Fondo animado" options={BACKGROUNDS} value={fx.background} labels={bgLabels} onChange={(background) => setEffects({ background })} />
        {fx.background !== 'none' && (
          <Slider label={fx.background === 'grid' ? 'Densidad de la cuadrícula' : 'Cantidad de estrellas'} value={fx.density} min={0.3} max={2} onChange={(density) => setEffects({ density })} />
        )}
      </Group>

      <Group title="Movimiento">
        <div className="grid gap-5 @md:grid-cols-2">
          <Slider label="Reacción al ratón" value={fx.mouse} min={0} max={2} format={level} onChange={(mouse) => setEffects({ mouse })} />
          <Slider label="Velocidad de las animaciones" value={fx.speed} min={0} max={2} format={(v) => (v === 0 ? 'Quieto' : `${Math.round(v * 100)} %`)} onChange={(speed) => setEffects({ speed })} />
        </div>
        <div className="grid gap-2 @md:grid-cols-2">
          <Toggle label="Flotación" hint="Las formas suben y bajan suavemente." checked={fx.float} onChange={(float) => setEffects({ float })} />
          <Toggle label="Inclinar tarjetas" hint="Los proyectos se inclinan hacia el cursor." checked={fx.tilt} onChange={(tilt) => setEffects({ tilt })} />
        </div>
      </Group>

      <Group title="Luz y acabado">
        <Slider label="Resplandor" value={fx.bloom} min={0} max={2} format={level} onChange={(bloom) => setEffects({ bloom })} />
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ink">Acabado del nombre</p>
          <Pills label="Acabado del nombre" options={MATERIALS} value={fx.material} labels={matLabels} onChange={(material) => setEffects({ material })} />
          <p className="text-xs text-ink-soft">El neón luce más con el resplandor activado.</p>
        </div>
      </Group>
    </div>
  )
}
