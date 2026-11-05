import { z } from 'zod'

export const linkSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Añade un nombre'),
  url: z.string().min(1, 'Añade la URL'),
})

export const skillSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Escribe la habilidad'),
  level: z.number().min(0).max(100),
})

export const experienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Escribe la empresa'),
  role: z.string().min(1, 'Escribe el puesto'),
  startDate: z.string(),
  endDate: z.string(),
  current: z.boolean(),
  description: z.string(),
})

export const educationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, 'Escribe el centro'),
  degree: z.string().min(1, 'Escribe la titulación'),
  startDate: z.string(),
  endDate: z.string(),
})

export const projectSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Escribe el título'),
  description: z.string(),
  url: z.string(),
  tags: z.array(z.string()),
})

export const personalSchema = z.object({
  fullName: z.string().min(1, 'Escribe tu nombre'),
  headline: z.string(),
  email: z.string().email('Email no válido').or(z.literal('')),
  phone: z.string(),
  location: z.string(),
  summary: z.string().max(600, 'Máximo 600 caracteres'),
  photoUrl: z.string(),
  links: z.array(linkSchema),
})

export const SECTOR_IDS = ['tech', 'creative', 'health', 'legal', 'education', 'hospitality', 'engineering', 'business'] as const
export const CV_LAYOUTS = ['auto', 'sidebar', 'classic', 'compact'] as const

export const HEADING_FONTS = ['auto', 'bricolage', 'fraunces', 'playfair', 'space', 'outfit', 'montserrat', 'syne'] as const
export const BODY_FONTS = ['geist', 'inter', 'plex', 'nunito', 'lora', 'sourceserif'] as const
export const SHAPES = ['auto', 'core', 'knot', 'helix', 'columns', 'rings', 'blocks', 'bars'] as const

export const BACKGROUNDS = ['stars', 'grid', 'none'] as const
export const MATERIALS = ['metal', 'matte', 'glass', 'neon'] as const

export const effectsSchema = z.object({
  background: z.enum(BACKGROUNDS),
  /** cantidad de partículas (0.3 – 2) */
  density: z.number().min(0.3).max(2),
  /** reacción al ratón (0 – 2) */
  mouse: z.number().min(0).max(2),
  /** velocidad de las animaciones (0 – 2) */
  speed: z.number().min(0).max(2),
  float: z.boolean(),
  /** resplandor (0 = desactivado, hasta 2) */
  bloom: z.number().min(0).max(2),
  material: z.enum(MATERIALS),
  tilt: z.boolean(),
})

export const defaultEffects: z.infer<typeof effectsSchema> = {
  background: 'stars',
  density: 1,
  mouse: 1,
  speed: 1,
  float: true,
  bloom: 0,
  material: 'metal',
  tilt: true,
}

export const SKILL_LAYOUTS = ['orbit', 'cloud', 'bars', 'list'] as const
export const SKILL_SHAPES = ['sphere', 'cube', 'gem', 'ring'] as const
export const SKILL_LABELS = ['full', 'name', 'none'] as const

export const skillsViewSchema = z.object({
  layout: z.enum(SKILL_LAYOUTS),
  shape: z.enum(SKILL_SHAPES),
  colorMode: z.enum(['gradient', 'single']),
  /** '' = color del tema */
  colorLow: z.string(),
  colorHigh: z.string(),
  labels: z.enum(SKILL_LABELS),
  /** tamaño de los elementos (0.6 – 1.6) */
  size: z.number().min(0.6).max(1.6),
  /** separación (0.7 – 1.4) */
  spread: z.number().min(0.7).max(1.4),
  core: z.boolean(),
  /** '' = título por defecto */
  title: z.string(),
  showHint: z.boolean(),
  /** '' = texto automático */
  hint: z.string(),
})

export const defaultSkillsView: z.infer<typeof skillsViewSchema> = {
  layout: 'orbit',
  shape: 'sphere',
  colorMode: 'gradient',
  colorLow: '',
  colorHigh: '',
  labels: 'full',
  size: 1,
  spread: 1,
  core: true,
  title: '',
  showHint: true,
  hint: '',
}

export const contactSchema = z.object({
  enabled: z.boolean(),
  /** '' = el email del perfil */
  recipient: z.string(),
  /** email: lo envía el servidor de Relieve · mailto: abre el correo del visitante */
  method: z.enum(['email', 'mailto']),
  title: z.string(),
  buttonText: z.string(),
  successText: z.string(),
})

export const defaultContact: z.infer<typeof contactSchema> = {
  enabled: true,
  recipient: '',
  method: 'email',
  title: '',
  buttonText: '',
  successText: '',
}

/** Lo que rellena el visitante del portfolio. */
export const contactMessageSchema = z.object({
  name: z.string().trim().min(1, 'Escribe tu nombre').max(100),
  email: z.string().trim().email('Escribe un email válido'),
  message: z.string().trim().min(10, 'Escribe al menos 10 caracteres').max(3000, 'Máximo 3000 caracteres'),
})
export type ContactMessage = z.infer<typeof contactMessageSchema>

export const settingsSchema = z.object({
  sector: z.enum(SECTOR_IDS),
  cvLayout: z.enum(CV_LAYOUTS),
  /** '' = color del sector */
  accent: z.string(),
  /** '' = fondo del sector */
  stageBg: z.string(),
  headingFont: z.enum(HEADING_FONTS),
  bodyFont: z.enum(BODY_FONTS),
  /** tamaño del texto del CV (0.85 – 1.15) */
  textScale: z.number().min(0.85).max(1.15),
  /** tamaño del nombre en CV y portfolio (0.8 – 1.3) */
  titleScale: z.number().min(0.8).max(1.3),
  shape: z.enum(SHAPES),
  effects: effectsSchema,
  skillsView: skillsViewSchema,
  contact: contactSchema,
})

export const defaultStyle = {
  accent: '',
  stageBg: '',
  headingFont: 'auto',
  bodyFont: 'geist',
  textScale: 1,
  titleScale: 1,
  shape: 'auto',
} as const satisfies Partial<z.infer<typeof settingsSchema>>

export const cvSchema = z.object({
  settings: settingsSchema,
  personal: personalSchema,
  skills: z.array(skillSchema),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  projects: z.array(projectSchema),
})

export type CV = z.infer<typeof cvSchema>
export type Personal = CV['personal']
export type Settings = CV['settings']
export type Effects = CV['settings']['effects']
export type SkillsView = CV['settings']['skillsView']
export type ContactSettings = CV['settings']['contact']
export type SectorId = (typeof SECTOR_IDS)[number]
export type CVLayout = Exclude<(typeof CV_LAYOUTS)[number], 'auto'>
export type HeadingFont = Exclude<(typeof HEADING_FONTS)[number], 'auto'>
export type BodyFont = (typeof BODY_FONTS)[number]
export type Skill = CV['skills'][number]
export type Experience = CV['experience'][number]
export type Education = CV['education'][number]
export type Project = CV['projects'][number]
export type ListSection = 'skills' | 'experience' | 'education' | 'projects'

export const emptyCV: CV = {
  settings: { sector: 'tech', cvLayout: 'auto', ...defaultStyle, effects: defaultEffects, skillsView: defaultSkillsView, contact: defaultContact },
  personal: {
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    photoUrl: '',
    links: [],
  },
  skills: [],
  experience: [],
  education: [],
  projects: [],
}
