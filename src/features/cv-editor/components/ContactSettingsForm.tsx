'use client'
import { useEffect } from 'react'
import { usePreviewFocus } from '@/features/portfolio-3d/focus'
import { AlertTriangle, Mail, MailOpen } from 'lucide-react'
import { useCVStore } from '@/lib/store/cv-store'
import { cn } from '@/lib/utils'
import { TextField } from '@/components/ui'
import { SectionHeader } from './ListItem'
import { Group } from './StyleForm'
import { Toggle } from './EffectsForm'

const methods = [
  {
    id: 'email' as const,
    icon: Mail,
    label: 'Enviar a mi correo',
    hint: 'El visitante escribe en la web y el mensaje te llega por email. Puedes contestar directamente desde tu correo.',
  },
  {
    id: 'mailto' as const,
    icon: MailOpen,
    label: 'Abrir el correo del visitante',
    hint: 'Se abre su programa de correo con el mensaje preparado. No necesita configuración, pero solo funciona si el visitante tiene uno instalado.',
  },
]

export function ContactSettingsForm() {
  const cv = useCVStore((s) => s.cv)
  const setContact = useCVStore((s) => s.setContact)
  const c = cv.settings.contact
  const first = cv.personal.fullName.split(/\s+/)[0] || 'tu nombre'
  const recipient = (c.recipient || cv.personal.email).trim()
  const focus = usePreviewFocus((s) => s.focus)

  useEffect(() => {
    focus('contact')
    return () => focus(null)
  }, [focus])

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Formulario de contacto"
        description="Aparece al final de tu portfolio, en la sección de contacto, para que cualquiera pueda escribirte."
      />

      <Toggle label="Mostrar el formulario" hint="Si lo desactivas, solo se verán tu email y tus enlaces." checked={c.enabled} onChange={(enabled) => setContact({ enabled })} />

      {c.enabled && (
        <>
          <Group title="¿A qué correo llegan los mensajes?">
            <TextField
              label="Correo de destino"
              type="email"
              placeholder={cv.personal.email || 'tu@email.com'}
              value={c.recipient}
              onChange={(e) => setContact({ recipient: e.target.value })}
              hint={cv.personal.email ? 'Déjalo vacío para usar el email de tu perfil.' : 'Escribe el correo donde quieres recibir los mensajes.'}
            />
            {!recipient && (
              <p className="flex items-start gap-2 rounded-xl bg-[#fff4e5] p-3 text-sm text-[#8a4b00]">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                Falta un correo de destino: hasta que lo añadas, el formulario no se mostrará en tu portfolio.
              </p>
            )}
          </Group>

          <Group title="Cómo se envían">
            <div role="radiogroup" aria-label="Cómo se envían los mensajes" className="grid gap-2 @lg:grid-cols-2">
              {methods.map((m) => {
                const on = c.method === m.id
                const Icon = m.icon
                return (
                  <button
                    key={m.id}
                    role="radio"
                    aria-checked={on}
                    onClick={() => setContact({ method: m.id })}
                    className={cn(
                      'flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-[border,box-shadow]',
                      on ? 'border-transparent bg-white shadow-[0_0_0_2px_var(--color-violet)]' : 'border-line bg-white/60 hover:border-ink/25 hover:bg-white'
                    )}
                  >
                    <Icon className={cn('size-5', on ? 'text-violet' : 'text-ink-soft')} />
                    <span className="text-sm font-semibold text-ink">{m.label}</span>
                    <span className="text-xs leading-snug text-ink-soft">{m.hint}</span>
                  </button>
                )
              })}
            </div>
          </Group>

          <Group title="Textos">
            <div className="grid gap-4 @lg:grid-cols-2">
              <TextField label="Título del formulario" placeholder={`Escribe a ${first}`} value={c.title} onChange={(e) => setContact({ title: e.target.value })} />
              <TextField label="Texto del botón" placeholder="Enviar mensaje" value={c.buttonText} onChange={(e) => setContact({ buttonText: e.target.value })} />
              <TextField
                label="Mensaje tras enviar"
                placeholder={`Mensaje enviado. ${first} te responderá pronto.`}
                value={c.successText}
                onChange={(e) => setContact({ successText: e.target.value })}
                className="@lg:col-span-2"
              />
            </div>
          </Group>
        </>
      )}
    </div>
  )
}
