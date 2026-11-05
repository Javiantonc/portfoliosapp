import { RELIEVE_ASSISTANT_PROMPT, trimTurns } from '@/lib/assistant/prompt'
import { AskError, type AskFn } from '@/lib/assistant/types'

type SampleFn = (
  input: { role: 'user' | 'assistant'; content: string }[],
  opts: { onText: (u: { text: string }) => void; signal: AbortSignal; cache: false; modelTier: 'quick' }
) => Promise<{ text: string }>

declare global {
  interface Window {
    claude?: { use: (name: string) => Promise<unknown> }
  }
}

let samplePromise: Promise<SampleFn | null> | null = null
const getSample = () => (samplePromise ??= window.claude ? (window.claude.use('sample') as Promise<SampleFn | null>) : Promise.resolve(null))

const unavailable = new Set(['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'])

/** Transporte de la vista previa publicada: usa la capacidad `sample` de Claude. */
export const askViaSample: AskFn = async (turns, { onText, signal }) => {
  const sample = await getSample()
  if (!sample) throw new AskError('unavailable')
  try {
    const { text } = await sample(
      [{ role: 'user', content: `${RELIEVE_ASSISTANT_PROMPT}\n\nA continuación empieza la conversación con el usuario. Responde como el asistente.` }, ...trimTurns(turns)],
      { onText: ({ text }) => onText(text), signal, cache: false, modelTier: 'quick' }
    )
    return text
  } catch (e) {
    const err = e as { code?: string; message?: string; text?: string }
    const code = err.code ?? ''
    if (code === 'cancelled') throw new AskError('cancelled', 'cancelled', err.text)
    if (unavailable.has(code)) throw new AskError('unavailable', code)
    if (code === 'rate_limited') throw new AskError('rate_limited', code, err.text)
    if (code === 'refused') throw new AskError('refused', code)
    throw new AskError('error', err.message ?? code, err.text)
  }
}
