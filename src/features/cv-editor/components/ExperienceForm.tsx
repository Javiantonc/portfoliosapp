'use client'
import { AnimatePresence } from 'motion/react'
import { Plus } from 'lucide-react'
import { experienceSchema } from '@/lib/schema/cv'
import { useSector } from '@/lib/store/cv-store'
import { uid } from '@/lib/utils'
import { Button, TextArea, TextField } from '@/components/ui'
import { useSyncedList } from '../useSyncedList'
import { EmptyState, ListItem, SectionHeader } from './ListItem'

export function ExperienceForm() {
  const L = useSector().labels
  const { form, fields, append } = useSyncedList('experience', experienceSchema)
  const { register, watch, formState } = form
  const err = formState.errors.items
  const add = () => append({ id: uid(), company: '', role: '', startDate: '', endDate: '', current: false, description: '' })

  return (
    <div>
      <SectionHeader
        title={L.experience}
        description="Empieza por el puesto más reciente. Usa las flechas para reordenar."
        action={fields.fields.length > 0 && <Button size="sm" variant="secondary" onClick={add}><Plus className="size-4" /> Añadir</Button>}
      />
      {fields.fields.length === 0 && (
        <EmptyState text="Añade tu primer puesto de trabajo." action={<Button size="sm" onClick={add}><Plus className="size-4" /> Añadir puesto</Button>} />
      )}
      <ul className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {fields.fields.map((f, i) => {
            const current = watch(`items.${i}.current`)
            const title = [watch(`items.${i}.role`), watch(`items.${i}.company`)].filter(Boolean).join(' en ')
            return (
              <ListItem key={f.key} title={title || 'Nuevo puesto'} index={i} total={fields.fields.length} onMove={fields.move} onRemove={() => fields.remove(i)}>
                <div className="grid gap-4 @md:grid-cols-2">
                  <TextField label="Puesto" placeholder={L.rolePlaceholder} error={err?.[i]?.role?.message} {...register(`items.${i}.role`)} />
                  <TextField label="Organización" placeholder="Empresa, centro u organización" error={err?.[i]?.company?.message} {...register(`items.${i}.company`)} />
                  <TextField label="Inicio" type="month" {...register(`items.${i}.startDate`)} />
                  <TextField label="Fin" type="month" disabled={current} {...register(`items.${i}.endDate`)} />
                  <label className="flex items-center gap-2.5 text-sm text-ink @md:col-span-2">
                    <input type="checkbox" className="size-4 accent-violet" {...register(`items.${i}.current`)} />
                    Trabajo aquí actualmente
                  </label>
                  <TextArea
                    label="Qué hiciste"
                    placeholder="Logros concretos, con cifras si las tienes."
                    className="@md:col-span-2"
                    {...register(`items.${i}.description`)}
                  />
                </div>
              </ListItem>
            )
          })}
        </AnimatePresence>
      </ul>
    </div>
  )
}
