'use client'
import { useEffect } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, X } from 'lucide-react'
import { personalSchema, type Personal } from '@/lib/schema/cv'
import { useCVStore, useSector } from '@/lib/store/cv-store'
import { uid } from '@/lib/utils'
import { Button, IconButton, TextArea, TextField } from '@/components/ui'
import { PhotoUpload } from './PhotoUpload'
import { SectionHeader } from './ListItem'

export function PersonalForm() {
  const L = useSector().labels
  const setPersonal = useCVStore((s) => s.setPersonal)
  const form = useForm<Personal>({
    defaultValues: useCVStore.getState().cv.personal,
    resolver: zodResolver(personalSchema),
    mode: 'onBlur',
  })
  const { register, control, watch, formState } = form
  const e = formState.errors
  const links = useFieldArray({ control, name: 'links', keyName: 'key' })

  useEffect(() => {
    const sub = watch((v) => setPersonal(v as Personal))
    return () => sub.unsubscribe()
  }, [watch, setPersonal])

  const summary = watch('summary') ?? ''

  return (
    <form onSubmit={(ev) => ev.preventDefault()} className="flex flex-col gap-5">
      <SectionHeader title="Perfil" description="Lo primero que verá quien abra tu CV o tu portfolio." />

      <Controller
        control={control}
        name="photoUrl"
        render={({ field }) => <PhotoUpload value={field.value} name={watch('fullName')} onChange={field.onChange} />}
      />

      <div className="grid gap-4 @md:grid-cols-2">
        <TextField label="Nombre completo" autoComplete="name" placeholder="Lucía Ferrer" error={e.fullName?.message} {...register('fullName')} />
        <TextField label="Titular" placeholder={L.headline} error={e.headline?.message} {...register('headline')} />
        <TextField label="Email" type="email" autoComplete="email" placeholder="tu@email.com" error={e.email?.message} {...register('email')} />
        <TextField label="Teléfono" type="tel" autoComplete="tel" placeholder="+34 600 000 000" {...register('phone')} />
        <TextField label="Ubicación" placeholder="Madrid, España" className="@md:col-span-2" {...register('location')} />
      </div>

      <TextArea
        label="Resumen"
        placeholder={L.summary}
        error={e.summary?.message}
        hint={`${summary.length}/600`}
        {...register('summary')}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink">Enlaces</p>
          <Button size="sm" variant="ghost" onClick={() => links.append({ id: uid(), label: '', url: '' })}>
            <Plus className="size-4" /> Añadir enlace
          </Button>
        </div>
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {links.fields.map((f, i) => (
              <motion.li
                key={f.key}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-[1fr_2fr_auto] items-end gap-2"
              >
                <TextField label="Nombre" placeholder="LinkedIn" error={e.links?.[i]?.label?.message} {...register(`links.${i}.label`)} />
                <TextField label="URL" placeholder="linkedin.com/in/tu-nombre" error={e.links?.[i]?.url?.message} {...register(`links.${i}.url`)} />
                <IconButton label="Quitar enlace" className="mb-1.5" onClick={() => links.remove(i)}>
                  <X className="size-4" />
                </IconButton>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </form>
  )
}
