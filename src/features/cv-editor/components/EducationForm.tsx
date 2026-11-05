'use client'
import { AnimatePresence } from 'motion/react'
import { Plus } from 'lucide-react'
import { educationSchema } from '@/lib/schema/cv'
import { useSector } from '@/lib/store/cv-store'
import { uid } from '@/lib/utils'
import { Button, TextField } from '@/components/ui'
import { useSyncedList } from '../useSyncedList'
import { EmptyState, ListItem, SectionHeader } from './ListItem'

export function EducationForm() {
  const L = useSector().labels
  const { form, fields, append } = useSyncedList('education', educationSchema)
  const { register, watch, formState } = form
  const err = formState.errors.items
  const add = () => append({ id: uid(), institution: '', degree: '', startDate: '', endDate: '' })

  return (
    <div>
      <SectionHeader
        title={L.education}
        description="Estudios, certificaciones y cursos relevantes."
        action={fields.fields.length > 0 && <Button size="sm" variant="secondary" onClick={add}><Plus className="size-4" /> Añadir</Button>}
      />
      {fields.fields.length === 0 && (
        <EmptyState text="Añade tus estudios o certificaciones." action={<Button size="sm" onClick={add}><Plus className="size-4" /> Añadir formación</Button>} />
      )}
      <ul className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {fields.fields.map((f, i) => (
            <ListItem key={f.key} title={watch(`items.${i}.degree`) || 'Nueva formación'} index={i} total={fields.fields.length} onMove={fields.move} onRemove={() => fields.remove(i)}>
              <div className="grid gap-4 @md:grid-cols-2">
                <TextField label="Titulación" placeholder={L.degreePlaceholder} error={err?.[i]?.degree?.message} {...register(`items.${i}.degree`)} />
                <TextField label="Centro" placeholder="Universidad" error={err?.[i]?.institution?.message} {...register(`items.${i}.institution`)} />
                <TextField label="Inicio" type="month" {...register(`items.${i}.startDate`)} />
                <TextField label="Fin" type="month" {...register(`items.${i}.endDate`)} />
              </div>
            </ListItem>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
