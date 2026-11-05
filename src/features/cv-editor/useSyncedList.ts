'use client'
import { useEffect } from 'react'
import { useFieldArray, useForm, type ArrayPath, type DefaultValues, type FieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCVStore } from '@/lib/store/cv-store'
import type { CV, ListSection } from '@/lib/schema/cv'

/** Formulario de lista (skills, experiencia...) sincronizado en vivo con el store. */
export function useSyncedList<K extends ListSection>(key: K, itemSchema: z.ZodType<CV[K][number]>) {
  type Values = { items: CV[K] }
  const initial = useCVStore.getState().cv[key]
  const setSection = useCVStore((s) => s.setSection)

  const form = useForm<Values>({
    defaultValues: { items: initial } as DefaultValues<Values>,
    resolver: zodResolver(z.object({ items: z.array(itemSchema) })) as never,
    mode: 'onBlur',
  })

  const fields = useFieldArray<Values, ArrayPath<Values>, 'key'>({
    control: form.control,
    name: 'items' as ArrayPath<Values>,
    keyName: 'key',
  })

  useEffect(() => {
    const sub = form.watch((v) => setSection(key, (v.items ?? []) as CV[K]))
    return () => sub.unsubscribe()
  }, [form, key, setSection])

  const append = (item: CV[K][number]) => fields.append(item as FieldArray<Values, ArrayPath<Values>>)

  return { form, fields, append }
}
