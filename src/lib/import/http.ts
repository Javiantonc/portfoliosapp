import { ImportError, type ImportCvFn } from './types'

const toBase64 = (b: Blob) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(String(r.result).split(',')[1] ?? '')
    r.onerror = rej
    r.readAsDataURL(b)
  })

/** Transporte de la app: /api/import-cv analiza el CV con la API de Anthropic. */
export const importCvViaApi: ImportCvFn = async ({ text, images }) => {
  const imgs = await Promise.all(images.slice(0, 3).map(async (b) => ({ data: await toBase64(b), mediaType: b.type || 'image/jpeg' })))
  let res: Response
  try {
    res = await fetch('/api/import-cv', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, images: imgs }) })
  } catch {
    throw new ImportError('failed', 'No hay conexión. Inténtalo de nuevo.')
  }
  const data = (await res.json().catch(() => ({}))) as { cv?: unknown; error?: string }
  if (res.ok && data.cv) return data.cv
  if (res.status === 503) throw new ImportError('unavailable', data.error)
  if (res.status === 429) throw new ImportError('rate_limited', data.error)
  throw new ImportError('failed', data.error)
}
