'use client'
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUp, MessageCircle, Square, X } from 'lucide-react'
import { useAppEnv } from '@/lib/nav'
import { ASSISTANT_GREETING, ASSISTANT_NAME, ASSISTANT_SUGGESTIONS, type ChatTurn } from '@/lib/assistant/prompt'
import { AskError } from '@/lib/assistant/types'
import { LogoMark } from '@/components/ui'
import { cn } from '@/lib/utils'

const errorCopy: Record<string, string> = {
  unavailable: 'El asistente no está disponible en este momento. Inténtalo más tarde o escribe a soporte.',
  rate_limited: 'Hay demasiadas consultas seguidas. Espera un momento y vuelve a intentarlo.',
  refused: 'No puedo responder a eso. Prueba a preguntarlo de otra forma.',
  error: 'No se pudo obtener respuesta. Vuelve a intentarlo.',
}

/* ---------- Markdown mínimo: párrafos, listas y **negrita** ---------- */

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>
  )
}

function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = []
  let list: { ordered: boolean; items: string[] } | null = null
  const flush = () => {
    if (!list) return
    const Tag = list.ordered ? 'ol' : 'ul'
    blocks.push(
      <Tag key={blocks.length} className={cn('space-y-1 pl-5', list.ordered ? 'list-decimal' : 'list-disc')}>
        {list.items.map((it, i) => <li key={i}>{inline(it)}</li>)}
      </Tag>
    )
    list = null
  }
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    const bullet = line.match(/^[-*•]\s+(.*)/)
    const num = line.match(/^\d+[.)]\s+(.*)/)
    if (bullet || num) {
      const ordered = !!num
      if (!list || list.ordered !== ordered) {
        flush()
        list = { ordered, items: [] }
      }
      list.items.push((bullet ?? num)![1])
    } else if (line) {
      flush()
      blocks.push(<p key={blocks.length}>{inline(line.replace(/^#+\s*/, ''))}</p>)
    } else flush()
  }
  flush()
  return <div className="space-y-2">{blocks}</div>
}

/* ---------- Widget ---------- */

type Msg = ChatTurn & { error?: boolean }

export function AssistantWidget() {
  const { ask } = useAppEnv()
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const ctl = useRef<AbortController | null>(null)
  const list = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) input.current?.focus()
  }, [open])

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight })
  }, [msgs])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => () => ctl.current?.abort(), [])

  if (!ask) return null

  async function send(text: string) {
    const content = text.trim()
    if (!content || busy || !ask) return
    const history: ChatTurn[] = [...msgs.filter((m) => !m.error), { role: 'user', content }]
    setMsgs([...history, { role: 'assistant', content: '' }])
    setDraft('')
    setBusy(true)
    const controller = new AbortController()
    ctl.current = controller
    const setLast = (m: Partial<Msg>) => setMsgs((prev) => prev.map((x, i) => (i === prev.length - 1 ? { ...x, ...m } : x)))
    try {
      const answer = await ask(history, { signal: controller.signal, onText: (t) => setLast({ content: t }) })
      setLast({ content: answer })
    } catch (e) {
      const err = e instanceof AskError ? e : new AskError('error')
      if (err.code === 'cancelled') {
        if (err.partial?.trim()) setLast({ content: err.partial })
        else setMsgs((prev) => prev.slice(0, -1))
      } else {
        setLast({ content: errorCopy[err.code] ?? errorCopy.error, error: true })
      }
    } finally {
      setBusy(false)
      ctl.current = null
      input.current?.focus()
    }
  }

  const showSuggestions = msgs.length === 0

  return (
    <div className="print:hidden">
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label={ASSISTANT_NAME}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'bottom right' }}
            className="fixed inset-x-2 top-2 bottom-[4.75rem] z-50 flex flex-col overflow-hidden rounded-[26px] border border-line bg-white text-ink shadow-[0_30px_80px_-20px_rgb(21_23_58/0.45)] sm:inset-x-auto sm:top-auto sm:right-5 sm:bottom-20 sm:h-[min(600px,calc(100dvh-7rem))] sm:w-[400px]"
          >
            <header className="flex items-center gap-3 border-b border-line px-4 py-3.5">
              <LogoMark className="size-8 text-ink" />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-[15px] leading-tight font-bold">{ASSISTANT_NAME}</h2>
                <p className="text-xs text-ink-soft">Dudas sobre el editor, el CV y tu portfolio</p>
              </div>
              <button
                aria-label="Cerrar asistente"
                onClick={() => setOpen(false)}
                className="grid size-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </header>

            <div ref={list} className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-4 text-[14px] leading-relaxed" aria-live="polite">
              <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-paper-2/80 px-3.5 py-2.5">{ASSISTANT_GREETING}</div>
              {showSuggestions && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ASSISTANT_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-violet/25 bg-violet/[0.06] px-3 py-1.5 text-[13px] text-violet transition-colors hover:bg-violet/10"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {msgs.map((m, i) =>
                m.role === 'user' ? (
                  <div key={i} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-md bg-violet px-3.5 py-2.5 whitespace-pre-wrap text-white">
                    {m.content}
                  </div>
                ) : (
                  <div
                    key={i}
                    className={cn(
                      'max-w-[88%] rounded-2xl rounded-tl-md px-3.5 py-2.5',
                      m.error ? 'border border-[#c23a52]/25 bg-[#c23a52]/[0.06] text-[#8f2238]' : 'bg-paper-2/80'
                    )}
                  >
                    {m.content ? (
                      <RichText text={m.content} />
                    ) : (
                      <span className="inline-flex items-center gap-1 text-ink-soft" aria-label="Escribiendo">
                        {[0, 1, 2].map((d) => (
                          <motion.span
                            key={d}
                            className="size-1.5 rounded-full bg-current"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
                          />
                        ))}
                      </span>
                    )}
                  </div>
                )
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(draft)
              }}
              className="border-t border-line p-3"
            >
              <div className="flex items-end gap-2 rounded-2xl border border-line bg-paper/60 p-1.5 focus-within:border-violet focus-within:ring-4 focus-within:ring-violet/12">
                <label htmlFor="assistant-input" className="sr-only">
                  Escribe tu pregunta
                </label>
                <textarea
                  id="assistant-input"
                  ref={input}
                  rows={1}
                  value={draft}
                  maxLength={2000}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send(draft)
                    }
                  }}
                  placeholder="Escribe tu pregunta…"
                  className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-[14px] outline-none placeholder:text-mist focus-visible:outline-none"
                />
                {busy ? (
                  <button
                    type="button"
                    aria-label="Detener respuesta"
                    onClick={() => ctl.current?.abort()}
                    className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink text-white"
                  >
                    <Square className="size-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    aria-label="Enviar"
                    disabled={!draft.trim()}
                    className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet text-white transition-opacity disabled:opacity-35"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                )}
              </div>
              <p className="mt-2 px-1 text-[11px] text-ink-soft">Respuestas generadas con IA: pueden contener errores.</p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente de ayuda'}
        className="fixed right-3 bottom-3 z-50 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-3.5 text-sm font-medium text-white shadow-[0_12px_30px_-10px_rgb(21_23_58/0.6)] transition-transform hover:-translate-y-0.5 active:scale-[0.98] sm:right-5 sm:bottom-5 sm:pr-5 sm:pl-4"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
        <span className="max-sm:sr-only">{open ? 'Cerrar' : '¿Dudas?'}</span>
      </button>
    </div>
  )
}
