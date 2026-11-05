import { AskError, type AskFn } from './types'

/** Transporte para la app Next.js: llama a /api/assistant y lee la respuesta en streaming. */
export const askViaApi: AskFn = async (turns, { onText, signal }) => {
  let res: Response
  try {
    res = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: turns }),
      signal,
    })
  } catch (e) {
    if (signal.aborted) throw new AskError('cancelled')
    throw new AskError('error', String(e))
  }
  if (res.status === 503) throw new AskError('unavailable')
  if (res.status === 429) throw new AskError('rate_limited')
  if (!res.ok || !res.body) throw new AskError('error', `HTTP ${res.status}`)

  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let text = ''
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      text += dec.decode(value, { stream: true })
      if (text.trim()) onText(text)
    }
  } catch (e) {
    if (signal.aborted) throw new AskError('cancelled', 'cancelled', text)
    throw new AskError('error', String(e), text)
  }
  if (!text.trim()) throw new AskError('error', 'Respuesta vacía')
  return text
}
