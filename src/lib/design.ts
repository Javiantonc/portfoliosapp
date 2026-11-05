import type { BodyFont, CV, HeadingFont } from './schema/cv'
import { getSector, type HeroShape, type StageTheme } from './sectors'

type FontDef = { label: string; family: string; google: string }

export const headingFonts: Record<HeadingFont, FontDef & { serif: boolean; typeface: () => Promise<{ default: unknown }> }> = {
  bricolage: { label: 'Bricolage', family: '"Bricolage Grotesque", sans-serif', google: 'Bricolage+Grotesque:opsz,wght@12..96,400..800', serif: false, typeface: () => import('@/assets/bricolage-bold.typeface.json') },
  fraunces: { label: 'Fraunces', family: '"Fraunces", Georgia, serif', google: 'Fraunces:opsz,wght@9..144,400..800', serif: true, typeface: () => import('@/assets/fraunces-bold.typeface.json') },
  playfair: { label: 'Playfair', family: '"Playfair Display", Georgia, serif', google: 'Playfair+Display:wght@400..900', serif: true, typeface: () => import('@/assets/playfair-display-bold.typeface.json') },
  space: { label: 'Space Grotesk', family: '"Space Grotesk", sans-serif', google: 'Space+Grotesk:wght@400..700', serif: false, typeface: () => import('@/assets/space-grotesk-bold.typeface.json') },
  outfit: { label: 'Outfit', family: '"Outfit", sans-serif', google: 'Outfit:wght@300..800', serif: false, typeface: () => import('@/assets/outfit-bold.typeface.json') },
  montserrat: { label: 'Montserrat', family: '"Montserrat", sans-serif', google: 'Montserrat:wght@400..800', serif: false, typeface: () => import('@/assets/montserrat-bold.typeface.json') },
  syne: { label: 'Syne', family: '"Syne", sans-serif', google: 'Syne:wght@400..800', serif: false, typeface: () => import('@/assets/syne-bold.typeface.json') },
}

export const bodyFonts: Record<BodyFont, FontDef> = {
  geist: { label: 'Geist', family: '"Geist", system-ui, sans-serif', google: 'Geist:wght@400..700' },
  inter: { label: 'Inter', family: '"Inter", system-ui, sans-serif', google: 'Inter:wght@400..700' },
  plex: { label: 'IBM Plex Sans', family: '"IBM Plex Sans", system-ui, sans-serif', google: 'IBM+Plex+Sans:wght@400;500;600;700' },
  nunito: { label: 'Nunito', family: '"Nunito", system-ui, sans-serif', google: 'Nunito:wght@400..800' },
  lora: { label: 'Lora', family: '"Lora", Georgia, serif', google: 'Lora:wght@400..700' },
  sourceserif: { label: 'Source Serif', family: '"Source Serif 4", Georgia, serif', google: 'Source+Serif+4:opsz,wght@8..60,400..700' },
}

export const accentPresets = ['#5d49ff', '#2563eb', '#0891b2', '#0f8f87', '#15803d', '#65a30d', '#d26a00', '#c2410c', '#dc2626', '#d6336c', '#9333ea', '#8a6a2f', '#15173a']
export const stagePresets = ['#121433', '#0b2629', '#0d1f19', '#1c1915', '#2a1013', '#24102b', '#141a21', '#000000', '#f3f1ea', '#eef2ff', '#fff5f7', '#ffffff']

/* ---------- color ---------- */

const hex = (h: string) => {
  const v = h.replace('#', '')
  const n = parseInt(v.length === 3 ? v.split('').map((c) => c + c).join('') : v, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const toHex = (r: number[]) => '#' + r.map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')
export const mix = (a: string, b: string, t: number) => {
  const x = hex(a)
  const y = hex(b)
  return toHex(x.map((v, i) => v + (y[i] - v) * t))
}
export const luminance = (h: string) => {
  const [r, g, b] = hex(h).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
export const isHex = (v: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)

/* ---------- resolución de estilo ---------- */

export type ResolvedStyle = {
  theme: StageTheme & { light: boolean }
  cvAccent: string
  heading: HeadingFont
  headingFamily: string
  bodyFamily: string
  textScale: number
  titleScale: number
}

export function resolveStyle(cv: CV): ResolvedStyle {
  const st = cv.settings
  const sector = getSector(st.sector)
  const heading: HeadingFont = st.headingFont === 'auto' ? sector.theme.font : st.headingFont
  const theme = { ...sector.theme, font: heading, light: false }

  if (isHex(st.accent)) theme.accent = st.accent
  if (st.shape !== 'auto') theme.shape = st.shape as HeroShape
  if (isHex(st.stageBg)) {
    const bg = st.stageBg
    const light = luminance(bg) > 0.4
    const text = light ? mix(bg, '#0b0c1c', 0.9) : mix(bg, '#ffffff', 0.93)
    Object.assign(theme, {
      bg,
      bg2: mix(bg, light ? '#000000' : '#ffffff', light ? 0.06 : 0.08),
      text,
      soft: mix(text, bg, 0.22),
      mist: mix(text, bg, 0.42),
      light,
    })
    if (light && !isHex(st.accent)) theme.accent = sector.cvAccent
  }

  return {
    theme,
    cvAccent: isHex(st.accent) ? st.accent : sector.cvAccent,
    heading,
    headingFamily: headingFonts[heading].family,
    bodyFamily: bodyFonts[st.bodyFont]?.family ?? bodyFonts.geist.family,
    textScale: st.textScale ?? 1,
    titleScale: st.titleScale ?? 1,
  }
}

/* ---------- carga de Google Fonts bajo demanda ---------- */

export function ensureGoogleFonts(params: string[]) {
  if (typeof document === 'undefined') return
  for (const p of params) {
    const id = `gf-${p.split(':')[0]}`
    if (document.getElementById(id)) continue
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${p}&display=swap`
    document.head.appendChild(link)
  }
}

export function ensureStyleFonts(s: ResolvedStyle, cv: CV) {
  ensureGoogleFonts([headingFonts[s.heading].google, (bodyFonts[cv.settings.bodyFont] ?? bodyFonts.geist).google])
}

export const ensureAllFonts = () =>
  ensureGoogleFonts([...Object.values(headingFonts).map((f) => f.google), ...Object.values(bodyFonts).map((f) => f.google)])

export function styleVars(s: ResolvedStyle): React.CSSProperties {
  const t = s.theme
  return {
    ['--st-bg' as string]: t.bg,
    ['--st-bg2' as string]: t.bg2,
    ['--st-text' as string]: t.text,
    ['--st-soft' as string]: t.soft,
    ['--st-mist' as string]: t.mist,
    ['--st-accent' as string]: t.accent,
    ['--st-accent2' as string]: t.accent2,
    ['--st-warm' as string]: t.warm,
    ['--st-line' as string]: `color-mix(in srgb, ${t.text} 16%, transparent)`,
    ['--st-display' as string]: s.headingFamily,
    ['--st-body' as string]: s.bodyFamily,
  }
}
