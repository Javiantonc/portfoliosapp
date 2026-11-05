'use client'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { AnimatePresence } from 'motion/react'
import { Plus, X } from 'lucide-react'
import { projectSchema } from '@/lib/schema/cv'
import { useSector } from '@/lib/store/cv-store'
import { uid } from '@/lib/utils'
import { Button, TextArea, TextField } from '@/components/ui'
import { useSyncedList } from '../useSyncedList'
import { EmptyState, ListItem, SectionHeader } from './ListItem'

function TagInput({ value, onChange, id }: { value: string[]; onChange: (v: string[]) => void; id: string }) {
  const [draft, setDraft] = useState('')
  const commit = () => {
    const t = draft.trim().replace(/,$/, '')
    if (t && !value.includes(t)) onChange([...value, t])
    setDraft('')
  }
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">Etiquetas</label>
      <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-line bg-white px-2 py-1.5 focus-within:border-violet focus-within:ring-4 focus-within:ring-violet/12">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-violet/10 py-1 pr-1 pl-2.5 text-xs font-medium text-violet">
            {t}
            <button type="button" aria-label={`Quitar ${t}`} className="grid size-4 place-items-center rounded-full hover:bg-violet/15" onClick={() => onChange(value.filter((x) => x !== t))}>
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => (e.target.value.endsWith(',') ? (setDraft(e.target.value), setTimeout(commit)) : setDraft(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.preventDefault(), commit())
            if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1))
          }}
          onBlur={commit}
          placeholder={value.length ? '' : 'Escribe y pulsa Enter'}
          className="min-w-24 flex-1 bg-transparent px-1.5 text-[15px] outline-none placeholder:text-mist"
        />
      </div>
    </div>
  )
}

export function ProjectsForm() {
  const L = useSector().labels
  const { form, fields, append } = useSyncedList('projects', projectSchema)
  const { register, control, watch, formState } = form
  const err = formState.errors.items
  const add = () => append({ id: uid(), title: '', description: '', url: '', tags: [] })

  return (
    <div>
      <SectionHeader
        title={L.projects}
        description={L.projectsDescription}
        action={fields.fields.length > 0 && <Button size="sm" variant="secondary" onClick={add}><Plus className="size-4" /> Añadir</Button>}
      />
      {fields.fields.length === 0 && (
        <EmptyState text={`Añade un ${L.projectSingular} del que estés orgulloso.`} action={<Button size="sm" onClick={add}><Plus className="size-4" /> Añadir</Button>} />
      )}
      <ul className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {fields.fields.map((f, i) => (
            <ListItem key={f.key} title={watch(`items.${i}.title`) || 'Sin título'} index={i} total={fields.fields.length} onMove={fields.move} onRemove={() => fields.remove(i)}>
              <div className="grid gap-4 @md:grid-cols-2">
                <TextField label="Título" placeholder={L.projectPlaceholder} error={err?.[i]?.title?.message} {...register(`items.${i}.title`)} />
                <TextField label="Enlace" placeholder="Opcional" {...register(`items.${i}.url`)} />
                <TextArea label="Descripción" placeholder="Qué hiciste y qué resultado tuvo." className="@md:col-span-2" {...register(`items.${i}.description`)} />
                <div className="@md:col-span-2">
                  <Controller control={control} name={`items.${i}.tags`} render={({ field }) => <TagInput id={`tags-${f.key}`} value={field.value} onChange={field.onChange} />} />
                </div>
              </div>
            </ListItem>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
