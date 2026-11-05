'use client'
import { useId, useState, type FormEvent } from 'react'
import { Check, Send } from 'lucide-react'
import { contactMessageSchema, type CV, type ContactMessage } from '@/lib/schema/cv'
import { ContactError } from '@/lib/contact/types'
import { useAppEnv } from '@/lib/nav'
import { cn } from '@/lib/utils'

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'notice'; text: string }

export const contactRecipient = (cv: CV) => (cv.settings.contact.recipient || cv.personal.email).trim()

const field =
  'w-full rounded-xl border border-[var(--st-line)] bg-[color-mix(in_srgb,var(--st-text)_6%,transparent)] px-3.5 text-[15px] text-[var(--st-text)] outline-none transition-[border,box-shadow] placeholder:text-[var(--st-mist)] focus:border-[var(--st-accent2)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--st-accent2)_20%,transparent)] aria-[invalid=true]:border-[#ff8a8a] focus-visible:outline-none'

export function ContactForm({ cv }: { cv: CV }) {
  const { sendContact } = useAppEnv()
  const c = cv.settings.contact
  const to = contactRecipient(cv)
  const first = cv.personal.fullName.split(/\s+/)[0] || 'esta persona'
  const id = useId()
  const [values, setValues] = useState<ContactMessage & { website: string }>({ name: '', email: '', message: '', website: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof ContactMessage, string>>>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const set = (k: keyof typeof values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    const parsed = contactMessageSchema.safeParse(values)
    if (!parsed.success) {
      const errs: typeof errors = {}
      for (const i of parsed.error.issues) errs[i.path[0] as keyof ContactMessage] ??= i.message
      setErrors(errs)
      return
    }
    setErrors({})

    if (c.method === 'mailto' || !sendContact) {
      const body = `${parsed.data.message}\n\n— ${parsed.data.name} (${parsed.data.email})`
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(`Contacto desde tu portfolio: ${parsed.data.name}`)}&body=${encodeURIComponent(body)}`
      setStatus({ kind: 'notice', text: `Se ha abierto tu programa de correo con el mensaje preparado. Si no se abre, escribe a ${to}.` })
      return
    }

    setStatus({ kind: 'sending' })
    try {
      await sendContact({ ...parsed.data, website: values.website, to })
      setStatus({ kind: 'sent' })
      setValues({ name: '', email: '', message: '', website: '' })
    } catch (err) {
      const code = err instanceof ContactError ? err.code : 'error'
      const text =
        code === 'preview'
          ? `Vista previa: aquí no se envían mensajes. En la web publicada, este formulario llegará a ${to}.`
          : code === 'rate_limited'
            ? 'Has enviado varios mensajes seguidos. Inténtalo de nuevo en unos minutos.'
            : code === 'invalid' && err instanceof Error && err.message !== 'invalid'
              ? err.message
              : `No se pudo enviar el mensaje. Escribe directamente a ${to}.`
      setStatus({ kind: 'notice', text })
    }
  }

  if (status.kind === 'sent')
    return (
      <div className="flex flex-col items-start gap-4 rounded-3xl border border-[var(--st-line)] bg-[color-mix(in_srgb,var(--st-bg2)_80%,transparent)] p-7 backdrop-blur-md" role="status">
        <span className="grid size-11 place-items-center rounded-full bg-[var(--st-accent2)] text-[var(--st-bg)]">
          <Check className="size-5" />
        </span>
        <p className="font-display text-2xl font-semibold">{c.successText.trim() || `Mensaje enviado. ${first} te responderá pronto.`}</p>
        <button onClick={() => setStatus({ kind: 'idle' })} className="text-sm text-[var(--st-accent2)] underline-offset-4 hover:underline">
          Enviar otro mensaje
        </button>
      </div>
    )

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-3.5 rounded-3xl border border-[var(--st-line)] bg-[color-mix(in_srgb,var(--st-bg2)_80%,transparent)] p-6 backdrop-blur-md"
    >
      <p className="font-display text-xl font-semibold">{c.title.trim() || `Escribe a ${first}`}</p>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-n`} className="text-sm text-[var(--st-soft)]">Nombre</label>
          <input id={`${id}-n`} autoComplete="name" value={values.name} onChange={set('name')} aria-invalid={!!errors.name} className={cn(field, 'h-11')} />
          {errors.name && <p className="text-xs text-[#ff9a9a]">{errors.name}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-e`} className="text-sm text-[var(--st-soft)]">Email</label>
          <input id={`${id}-e`} type="email" autoComplete="email" value={values.email} onChange={set('email')} aria-invalid={!!errors.email} className={cn(field, 'h-11')} />
          {errors.email && <p className="text-xs text-[#ff9a9a]">{errors.email}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-m`} className="text-sm text-[var(--st-soft)]">Mensaje</label>
        <textarea id={`${id}-m`} rows={4} value={values.message} onChange={set('message')} aria-invalid={!!errors.message} className={cn(field, 'resize-none py-3 leading-relaxed')} />
        {errors.message && <p className="text-xs text-[#ff9a9a]">{errors.message}</p>}
      </div>
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          No rellenar
          <input tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={status.kind === 'sending'}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--st-text)] px-5 text-[15px] font-medium text-[var(--st-bg)] transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          <Send className="size-4" />
          {status.kind === 'sending' ? 'Enviando…' : c.buttonText.trim() || 'Enviar mensaje'}
        </button>
        {c.method === 'mailto' && <span className="text-xs text-[var(--st-mist)]">Se abrirá tu programa de correo.</span>}
      </div>
      {status.kind === 'notice' && (
        <p role="status" className="rounded-xl bg-[color-mix(in_srgb,var(--st-text)_8%,transparent)] px-3.5 py-2.5 text-sm text-[var(--st-soft)]">
          {status.text}
        </p>
      )}
    </form>
  )
}
