import { ContactError, type SendContactFn } from './types'

/** Envía el mensaje a /api/contact, que lo reenvía por email a la persona del portfolio. */
export const sendContactViaApi: SendContactFn = async (payload) => {
  const slug = typeof window !== 'undefined' ? window.location.pathname.match(/^\/p\/([^/]+)/)?.[1] : undefined
  let res: Response
  try {
    res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...payload, slug: payload.slug ?? slug }),
    })
  } catch {
    throw new ContactError('error')
  }
  if (res.ok) return
  const data = (await res.json().catch(() => ({}))) as { error?: string }
  if (res.status === 503) throw new ContactError('unavailable', data.error)
  if (res.status === 429) throw new ContactError('rate_limited', data.error)
  if (res.status === 400) throw new ContactError('invalid', data.error)
  throw new ContactError('error', data.error)
}
