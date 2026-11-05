import type { CV } from '@/lib/schema/cv'

export const firstName = (cv: CV) => cv.personal.fullName.trim().split(/\s+/)[0] || 'Tu nombre'

export const sentences = (t: string) =>
  t
    .split(/(?<=[.;!?])\s+/)
    .map((s) => s.trim().replace(/[.;]$/, ''))
    .filter(Boolean)

/** Años de experiencia a partir del puesto más antiguo. */
export function yearsOfExperience(cv: CV) {
  const years = cv.experience.map((e) => Number(e.startDate.slice(0, 4))).filter((y) => y > 1950)
  if (!years.length) return 0
  return Math.max(0, new Date().getFullYear() - Math.min(...years))
}

const ym = (d: string) => {
  const [y, m] = d.split('-').map(Number)
  return y ? y * 12 + ((m || 1) - 1) : NaN
}

/** Duración en meses de un puesto (mínimo 1). */
export function months(start: string, end: string, current: boolean) {
  const now = new Date()
  const a = ym(start)
  const b = current || !end ? now.getFullYear() * 12 + now.getMonth() : ym(end)
  if (Number.isNaN(a) || Number.isNaN(b)) return 12
  return Math.max(1, b - a)
}

export const pad2 = (n: number) => String(n).padStart(2, '0')

export const href = (url: string) => (url.startsWith('http') ? url : `https://${url}`)
