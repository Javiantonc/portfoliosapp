'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SkillsViewForm } from './SkillsViewForm'
import { Controller } from 'react-hook-form'
import { AnimatePresence } from 'motion/react'
import { Plus } from 'lucide-react'
import { skillSchema } from '@/lib/schema/cv'
import { useSector } from '@/lib/store/cv-store'
import { uid } from '@/lib/utils'
import { Button, TextField } from '@/components/ui'
import { useSyncedList } from '../useSyncedList'
import { EmptyState, ListItem, SectionHeader } from './ListItem'

const levelName = (n: number) => (n >= 85 ? 'Experto' : n >= 65 ? 'Avanzado' : n >= 40 ? 'Intermedio' : 'Básico')

function SkillsList() {
  const L = useSector().labels
  const { form, fields, append } = useSyncedList('skills', skillSchema)
  const { register, control, watch, formState } = form
  const add = () => append({ id: uid(), name: '', level: 60 })

  return (
    <div>
      <SectionHeader
        title={L.skills}
        description="El nivel define el tamaño y el color de cada esfera en tu portfolio 3D."
        action={
          fields.fields.length > 0 && (
            <Button size="sm" variant="secondary" onClick={add}>
              <Plus className="size-4" /> Añadir
            </Button>
          )
        }
      />
      {fields.fields.length === 0 && (
        <EmptyState text={`Añade tus ${L.skills.toLowerCase()} más importantes.`} action={<Button size="sm" onClick={add}><Plus className="size-4" /> Añadir</Button>} />
      )}
      <ul className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {fields.fields.map((f, i) => (
            <ListItem
              key={f.key}
              title={watch(`items.${i}.name`) || 'Sin nombre'}
              index={i}
              total={fields.fields.length}
              onMove={fields.move}
              onRemove={() => fields.remove(i)}
            >
              <div className="grid items-end gap-4 @lg:grid-cols-[1fr_1.3fr]">
                <TextField label="Nombre" placeholder={L.skillPlaceholder} error={formState.errors.items?.[i]?.name?.message} {...register(`items.${i}.name`)} />
                <Controller
                  control={control}
                  name={`items.${i}.level`}
                  render={({ field }) => (
                    <div className="flex flex-col gap-2 pb-1">
                      <div className="flex items-baseline justify-between text-sm">
                        <label htmlFor={`lvl-${f.key}`} className="font-medium text-ink">Nivel</label>
                        <span className="text-ink-soft">
                          {levelName(field.value)} <span className="tabular-nums text-ink">{field.value}</span>
                        </span>
                      </div>
                      <input
                        id={`lvl-${f.key}`}
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="level w-full"
                        style={{ ['--val' as string]: `${field.value}%` }}
                      />
                    </div>
                  )}
                />
              </div>
            </ListItem>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}

export function SkillsForm() {
  const [tab, setTab] = useState<'list' | 'view'>('list')
  const L = useSector().labels
  return (
    <div>
      <div role="tablist" aria-label="Opciones de habilidades" className="mb-6 inline-flex rounded-full bg-ink/[0.05] p-1">
        {([
          ['list', `Mis ${L.skills.toLowerCase()}`],
          ['view', 'Aspecto en el portfolio'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              tab === id ? 'bg-white text-ink shadow-[0_1px_3px_rgb(21_23_58/0.12)]' : 'text-ink-soft hover:text-ink'
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'list' ? (
        <SkillsList />
      ) : (
        <SkillsViewForm />
      )}
    </div>
  )
}
