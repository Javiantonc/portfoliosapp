import { HEADING_FONTS, PORTFOLIO_TEMPLATES, SECTOR_IDS, SHAPES, SKILL_LAYOUTS, type CV, type HeadingFont, type LabelOverrides, type PortfolioTemplate, type SectorId } from '@/lib/schema/cv'
import { luminance } from '@/lib/design'
import { uid } from '@/lib/utils'

const str = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const arr = (v: unknown) => (Array.isArray(v) ? v : [])
const obj = (v: unknown) => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {})

function date(v: unknown) {
  const s = str(v, 20)
  const m = s.match(/^(\d{4})(?:[-/.](\d{1,2}))?/)
  if (!m) return ''
  return m[2] ? `${m[1]}-${m[2].padStart(2, '0')}` : m[1]
}

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

/** Convierte la respuesta de la IA en un CV válido, conservando el estilo y la foto del CV actual. */
export function normalizeImported(raw: unknown, base: CV): CV {
  const r = obj(raw)
  const p = obj(r.personal)
  const sector = (SECTOR_IDS as readonly string[]).includes(str(r.sector)) ? (str(r.sector) as SectorId) : base.settings.sector
  const email = str(p.email, 120)

  return {
    settings: { ...base.settings, sector, labels: { skills: '', experience: '', education: '', projects: '', contact: '' } },
    personal: {
      fullName: str(p.fullName, 80),
      headline: str(p.headline, 90),
      email: isEmail(email) ? email : '',
      phone: str(p.phone, 40),
      location: str(p.location, 80),
      summary: str(p.summary, 600),
      photoUrl: base.personal.photoUrl,
      links: arr(p.links)
        .map(obj)
        .map((l) => ({ id: uid(), label: str(l.label, 30), url: str(l.url, 200).replace(/^https?:\/\//, '') }))
        .filter((l) => l.label && l.url)
        .slice(0, 6),
    },
    skills: arr(r.skills)
      .map(obj)
      .map((s) => {
        const n = Number(s.level)
        return { id: uid(), name: str(s.name, 40), level: Number.isFinite(n) ? Math.round(Math.min(100, Math.max(0, n))) : 70 }
      })
      .filter((s) => s.name)
      .slice(0, 14),
    experience: arr(r.experience)
      .map(obj)
      .map((e) => {
        const current = e.current === true
        return {
          id: uid(),
          company: str(e.company, 80),
          role: str(e.role, 80),
          startDate: date(e.startDate),
          endDate: current ? '' : date(e.endDate),
          current,
          description: str(e.description, 400),
        }
      })
      .filter((e) => e.company || e.role)
      .slice(0, 10),
    education: arr(r.education)
      .map(obj)
      .map((e) => ({ id: uid(), institution: str(e.institution, 100), degree: str(e.degree, 120), startDate: date(e.startDate), endDate: date(e.endDate) }))
      .filter((e) => e.institution || e.degree)
      .slice(0, 8),
    projects: arr(r.projects)
      .map(obj)
      .map((x) => ({
        id: uid(),
        title: str(x.title, 80),
        description: str(x.description, 300),
        url: str(x.url, 200).replace(/^https?:\/\//, ''),
        tags: arr(x.tags).map((t) => str(t, 24)).filter(Boolean).slice(0, 5),
      }))
      .filter((x) => x.title)
      .slice(0, 8),
  }
}

/** Extrae el primer objeto JSON de un texto (por si la respuesta trae algo alrededor). */
export function parseJsonLoose(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (fence) return JSON.parse(fence[1])
    const a = text.indexOf('{')
    const b = text.lastIndexOf('}')
    if (a >= 0 && b > a) return JSON.parse(text.slice(a, b + 1))
    throw new Error('Respuesta sin JSON')
  }
}

/* ---------- Adaptación a la profesión ---------- */

export type Adaptation = {
  labels: LabelOverrides
  accent: string
  headingFont: HeadingFont | ''
  shape: Exclude<(typeof SHAPES)[number], 'auto'> | ''
  skillsLayout: (typeof SKILL_LAYOUTS)[number] | ''
  cvLayout: 'sidebar' | 'classic' | 'compact' | ''
  portfolioTemplate: PortfolioTemplate | ''
  reason: string
}

const oneOf = <T extends string>(v: unknown, list: readonly T[]): T | '' => (typeof v === 'string' && (list as readonly string[]).includes(v) ? (v as T) : '')

export function normalizeAdaptation(raw: unknown): Adaptation | null {
  const a = obj(obj(raw).adaptation)
  if (!Object.keys(a).length) return null
  const l = obj(a.labels)
  const label = (v: unknown) => str(v, 40).replace(/:$/, '')
  const accent = str(a.accent, 7)
  return {
    labels: { skills: label(l.skills), experience: label(l.experience), education: label(l.education), projects: label(l.projects), contact: label(l.contact) },
    // descartamos colores demasiado claros para leerse sobre blanco
    accent: /^#[0-9a-f]{6}$/i.test(accent) && luminance(accent) < 0.55 ? accent : '',
    headingFont: oneOf(a.headingFont, HEADING_FONTS.filter((f) => f !== 'auto') as HeadingFont[]),
    shape: oneOf(a.shape, SHAPES.filter((s) => s !== 'auto') as Exclude<(typeof SHAPES)[number], 'auto'>[]),
    skillsLayout: oneOf(a.skillsLayout, SKILL_LAYOUTS),
    cvLayout: oneOf(a.cvLayout, ['sidebar', 'classic', 'compact'] as const),
    portfolioTemplate: oneOf(a.portfolioTemplate, PORTFOLIO_TEMPLATES),
    reason: str(a.reason, 160),
  }
}

/** Aplica la adaptación propuesta (sin activar plantillas Premium por su cuenta). */
export function applyAdaptation(cv: CV, a: Adaptation): CV {
  const st = cv.settings
  return {
    ...cv,
    settings: {
      ...st,
      labels: { ...st.labels, ...Object.fromEntries(Object.entries(a.labels).filter(([, v]) => v)) },
      accent: a.accent || st.accent,
      headingFont: a.headingFont || st.headingFont,
      shape: a.shape || st.shape,
      cvLayout: a.cvLayout || st.cvLayout,
      skillsView: { ...st.skillsView, layout: a.skillsLayout || st.skillsView.layout },
    },
  }
}
