import type { SkillsView } from './schema/cv'

const nouns: Record<SkillsView['shape'], [string, 'f' | 'm']> = {
  sphere: ['esfera', 'f'],
  cube: ['cubo', 'm'],
  gem: ['cristal', 'm'],
  ring: ['anillo', 'm'],
}

export const shapeNoun = (s: SkillsView['shape']) => nouns[s][0]

/** Texto explicativo de la sección de habilidades, coherente con la vista elegida. */
export function skillsHintText(view: SkillsView, sectorHint: string) {
  if (view.hint.trim()) return view.hint.trim()
  const m = sectorHint.match(/^Cada esfera es (.+?): cuanto más grande y cálida, mayor (.+)\.$/)
  const item = m?.[1] ?? 'una habilidad'
  const measure = m?.[2] ?? 'el nivel'
  if (view.layout === 'list') return `La longitud de cada barra indica ${measure}.`
  if (view.layout === 'bars') return `Cada columna es ${item}: cuanto más alta, mayor ${measure}.`
  const [noun, g] = nouns[view.shape]
  const warm = view.colorMode === 'gradient' && !view.colorLow && !view.colorHigh ? (g === 'f' ? ' y cálida' : ' y cálido') : ''
  return `Cada ${noun} es ${item}: cuanto más grande${warm}, mayor ${measure}.`
}
