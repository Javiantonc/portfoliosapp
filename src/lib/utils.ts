export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)

export const cn = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ')

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function formatMonth(value: string) {
  if (!value) return ''
  const [y, m] = value.split('-')
  if (!m) return y
  return `${MONTHS[Number(m) - 1] ?? ''} ${y}`
}

export function formatRange(start: string, end: string, current = false) {
  const a = formatMonth(start)
  const b = current ? 'Actualidad' : formatMonth(end)
  if (!a && !b) return ''
  if (!b) return a
  return `${a} – ${b}`
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

export async function fileToResizedDataUrl(file: File, max = 480): Promise<string> {
  const src = await new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = rej
    r.readAsDataURL(file)
  })
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = src
  })
  const side = Math.min(img.width, img.height)
  const size = Math.min(max, side)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
  return canvas.toDataURL('image/jpeg', 0.86)
}
