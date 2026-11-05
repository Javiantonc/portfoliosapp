import type { CVLayout, HeadingFont, SectorId } from './schema/cv'

export type HeroShape = 'core' | 'knot' | 'helix' | 'columns' | 'rings' | 'blocks' | 'bars'

export type StageTheme = {
  bg: string
  bg2: string
  text: string
  soft: string
  mist: string
  accent: string
  accent2: string
  warm: string
  font: HeadingFont
  shape: HeroShape
}

export type SectorLabels = {
  headline: string
  summary: string
  skills: string
  skillsHint: string
  skillPlaceholder: string
  experience: string
  rolePlaceholder: string
  education: string
  degreePlaceholder: string
  projects: string
  projectsDescription: string
  projectSingular: string
  projectPlaceholder: string
  projectLink: string
  contact: string
}

export type Sector = {
  id: SectorId
  label: string
  short: string
  examples: string
  cvLayout: CVLayout
  cvAccent: string
  theme: StageTheme
  labels: SectorLabels
}

const base: SectorLabels = {
  headline: 'Tu puesto o especialidad',
  summary: 'Qué haces, para quién y qué te hace diferente.',
  skills: 'Habilidades',
  skillsHint: 'Cada esfera es una habilidad: cuanto más grande y cálida, mayor el nivel.',
  skillPlaceholder: 'Habilidad',
  experience: 'Experiencia',
  rolePlaceholder: 'Puesto',
  education: 'Formación',
  degreePlaceholder: 'Titulación',
  projects: 'Proyectos',
  projectsDescription: 'Cada elemento se convierte en una tarjeta flotante en tu portfolio.',
  projectSingular: 'proyecto',
  projectPlaceholder: 'Título',
  projectLink: 'Ver más',
  contact: 'Hablemos.',
}

export const sectors: Record<SectorId, Sector> = {
  tech: {
    id: 'tech',
    label: 'Tecnología y software',
    short: 'Tecnología',
    examples: 'Desarrollo, datos, sistemas, ciberseguridad',
    cvLayout: 'sidebar',
    cvAccent: '#5d49ff',
    theme: { bg: '#121433', bg2: '#1c1f4a', text: '#eceaff', soft: '#c9cbea', mist: '#a6a9d1', accent: '#7c6bff', accent2: '#6fe3cf', warm: '#ffb37c', font: 'bricolage', shape: 'core' },
    labels: { ...base, headline: 'Desarrolladora full-stack', skills: 'Habilidades técnicas', skillPlaceholder: 'React', rolePlaceholder: 'Frontend Developer', degreePlaceholder: 'Grado en Ingeniería Informática', projectPlaceholder: 'Nombre del proyecto', projectLink: 'Ver proyecto' },
  },
  creative: {
    id: 'creative',
    label: 'Diseño, arte y comunicación',
    short: 'Creatividad',
    examples: 'Diseño gráfico, fotografía, audiovisual, periodismo',
    cvLayout: 'compact',
    cvAccent: '#d6336c',
    theme: { bg: '#24102b', bg2: '#371a40', text: '#fff0f6', soft: '#ecc9da', mist: '#c29bb2', accent: '#ff5fa2', accent2: '#ffd166', warm: '#ff8a5c', font: 'bricolage', shape: 'knot' },
    labels: { ...base, headline: 'Directora de arte', skills: 'Disciplinas y herramientas', skillPlaceholder: 'Dirección de arte', rolePlaceholder: 'Diseñadora gráfica', degreePlaceholder: 'Grado en Bellas Artes', projects: 'Trabajos', projectsDescription: 'Cada trabajo se muestra como una pieza flotante en tu portfolio.', projectSingular: 'trabajo', projectPlaceholder: 'Campaña, serie o pieza', projectLink: 'Ver trabajo' },
  },
  health: {
    id: 'health',
    label: 'Salud y bienestar',
    short: 'Salud',
    examples: 'Medicina, enfermería, fisioterapia, psicología',
    cvLayout: 'compact',
    cvAccent: '#0f8f87',
    theme: { bg: '#0b2629', bg2: '#123a3e', text: '#e8fbf8', soft: '#bfe5df', mist: '#8fbcb6', accent: '#3fd0c9', accent2: '#a7f3d0', warm: '#ffd7a8', font: 'bricolage', shape: 'helix' },
    labels: { ...base, headline: 'Enfermera de cuidados intensivos', skills: 'Competencias clínicas', skillsHint: 'Cada esfera es una competencia: cuanto más grande y cálida, mayor el dominio.', skillPlaceholder: 'Cuidados críticos', rolePlaceholder: 'Enfermera', education: 'Formación y colegiación', degreePlaceholder: 'Grado en Enfermería', projects: 'Logros e investigación', projectsDescription: 'Protocolos, publicaciones, voluntariados o mejoras que hayas liderado.', projectSingular: 'logro', projectPlaceholder: 'Protocolo, estudio o iniciativa', projectLink: 'Ver más' },
  },
  legal: {
    id: 'legal',
    label: 'Derecho y consultoría',
    short: 'Derecho',
    examples: 'Abogacía, asesoría, notaría, compliance',
    cvLayout: 'classic',
    cvAccent: '#8a6a2f',
    theme: { bg: '#1c1915', bg2: '#2b2620', text: '#f6efe2', soft: '#ddd2bd', mist: '#a99c86', accent: '#c9a86a', accent2: '#e8dcc2', warm: '#d98e5a', font: 'fraunces', shape: 'columns' },
    labels: { ...base, headline: 'Abogada mercantilista', skills: 'Áreas de práctica', skillsHint: 'Cada esfera es un área de práctica: cuanto más grande y cálida, mayor la especialización.', skillPlaceholder: 'Derecho mercantil', rolePlaceholder: 'Asociada sénior', education: 'Formación y colegiación', degreePlaceholder: 'Grado en Derecho', projects: 'Casos y operaciones', projectsDescription: 'Operaciones, litigios o asesoramientos destacados, sin datos confidenciales.', projectSingular: 'caso', projectPlaceholder: 'Operación o asunto', projectLink: 'Ver detalle', contact: 'Contacto.' },
  },
  education: {
    id: 'education',
    label: 'Educación y formación',
    short: 'Educación',
    examples: 'Docencia, orientación, formación corporativa',
    cvLayout: 'sidebar',
    cvAccent: '#2563eb',
    theme: { bg: '#0f1f3b', bg2: '#182d52', text: '#eef4ff', soft: '#c6d6f2', mist: '#93a9cf', accent: '#ffcc4d', accent2: '#7cc4ff', warm: '#ff9f6b', font: 'bricolage', shape: 'rings' },
    labels: { ...base, headline: 'Profesor de Física y Química', skills: 'Competencias docentes', skillsHint: 'Cada esfera es una competencia: cuanto más grande y cálida, mayor el nivel.', skillPlaceholder: 'Aprendizaje basado en proyectos', rolePlaceholder: 'Profesor de secundaria', degreePlaceholder: 'Máster en Profesorado', projects: 'Proyectos educativos', projectsDescription: 'Programas, materiales, actividades o innovaciones que hayas puesto en marcha.', projectSingular: 'proyecto', projectPlaceholder: 'Programa o actividad' },
  },
  hospitality: {
    id: 'hospitality',
    label: 'Hostelería, turismo y gastronomía',
    short: 'Hostelería',
    examples: 'Cocina, sala, hoteles, eventos, turismo',
    cvLayout: 'compact',
    cvAccent: '#c2410c',
    theme: { bg: '#2a1013', bg2: '#3d1a1e', text: '#fff3e8', soft: '#f0d2bf', mist: '#c69d8c', accent: '#ff7a45', accent2: '#ffd59e', warm: '#f2c14e', font: 'fraunces', shape: 'core' },
    labels: { ...base, headline: 'Jefe de cocina', skills: 'Especialidades', skillsHint: 'Cada esfera es una especialidad: cuanto más grande y cálida, mayor el dominio.', skillPlaceholder: 'Cocina mediterránea', rolePlaceholder: 'Jefe de partida', degreePlaceholder: 'Técnico Superior en Dirección de Cocina', projects: 'Menús y eventos', projectsDescription: 'Cartas, aperturas, eventos o reconocimientos de los que estés orgulloso.', projectSingular: 'menú o evento', projectPlaceholder: 'Carta, evento o apertura', projectLink: 'Ver más' },
  },
  engineering: {
    id: 'engineering',
    label: 'Arquitectura, ingeniería e industria',
    short: 'Ingeniería',
    examples: 'Arquitectura, obra civil, industria, energía',
    cvLayout: 'sidebar',
    cvAccent: '#d26a00',
    theme: { bg: '#141a21', bg2: '#1f2833', text: '#eef3f7', soft: '#c9d4de', mist: '#93a3b3', accent: '#ff9f1c', accent2: '#9fd3ff', warm: '#ffd166', font: 'bricolage', shape: 'blocks' },
    labels: { ...base, headline: 'Arquitecto técnico', skills: 'Competencias técnicas', skillPlaceholder: 'BIM / Revit', rolePlaceholder: 'Jefe de obra', degreePlaceholder: 'Grado en Arquitectura Técnica', projects: 'Obras y proyectos', projectsDescription: 'Obras, instalaciones o proyectos en los que hayas participado.', projectSingular: 'obra', projectPlaceholder: 'Nombre de la obra', projectLink: 'Ver obra' },
  },
  business: {
    id: 'business',
    label: 'Empresa, marketing y finanzas',
    short: 'Empresa',
    examples: 'Marketing, ventas, finanzas, RR. HH., administración',
    cvLayout: 'classic',
    cvAccent: '#15803d',
    theme: { bg: '#0d1f19', bg2: '#163128', text: '#ecfbf2', soft: '#c3e6d2', mist: '#8db8a0', accent: '#4ade80', accent2: '#c4f0d4', warm: '#facc15', font: 'fraunces', shape: 'bars' },
    labels: { ...base, headline: 'Responsable de marketing digital', skills: 'Competencias', skillsHint: 'Cada esfera es una competencia: cuanto más grande y cálida, mayor el nivel.', skillPlaceholder: 'Estrategia de marca', rolePlaceholder: 'Account manager', degreePlaceholder: 'Grado en ADE', projects: 'Logros y campañas', projectsDescription: 'Resultados medibles: campañas, ventas, ahorros o equipos que hayas liderado.', projectSingular: 'logro', projectPlaceholder: 'Campaña o resultado', projectLink: 'Ver más' },
  },
}

export const sectorList = Object.values(sectors)

export const getSector = (id: SectorId | undefined) => sectors[id ?? 'tech'] ?? sectors.tech

export const resolveLayout = (sector: Sector, layout: string): CVLayout =>
  layout === 'auto' ? sector.cvLayout : (layout as CVLayout)

