'use client'
import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Box, Briefcase, Check, FileText, FolderKanban, GraduationCap, Layers, Mail, Maximize2, Paintbrush, Zap, Sparkles, User } from 'lucide-react'
import { useCVStore, useSector } from '@/lib/store/cv-store'
import { type SectorLabels } from '@/lib/sectors'
import { styleVars } from '@/lib/design'
import { useResolvedStyle } from '@/lib/use-style'
import type { CV } from '@/lib/schema/cv'
import { AppLink } from '@/lib/nav'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { AppHeader } from '@/components/AppHeader'
import { CVDocument } from '@/features/cv-document/CVDocument'
import { ScaledSheet } from '@/features/cv-document/ScaledSheet'
import { PersonalForm } from './components/PersonalForm'
import { SkillsForm } from './components/SkillsForm'
import { ExperienceForm } from './components/ExperienceForm'
import { EducationForm } from './components/EducationForm'
import { ProjectsForm } from './components/ProjectsForm'
import { SectorForm } from './components/SectorForm'
import { StyleForm } from './components/StyleForm'
import { EffectsForm } from './components/EffectsForm'
import { ContactSettingsForm } from './components/ContactSettingsForm'

const PortfolioCanvas = lazy(() => import('@/features/portfolio-3d/PortfolioCanvas'))

type SectionId = 'sector' | 'style' | 'effects' | 'contact' | 'personal' | 'skills' | 'experience' | 'education' | 'projects'

const sections: { id: SectionId; label: (L: SectorLabels) => string; icon: typeof User; done: (cv: CV) => boolean; Form: () => React.JSX.Element }[] = [
  { id: 'sector', label: () => 'Sector y diseño', icon: Layers, done: () => true, Form: SectorForm },
  { id: 'style', label: () => 'Personalizar', icon: Paintbrush, done: () => true, Form: StyleForm },
  { id: 'effects', label: () => 'Efectos 3D', icon: Zap, done: () => true, Form: EffectsForm },
  { id: 'personal', label: () => 'Perfil', icon: User, done: (cv) => !!cv.personal.fullName && !!cv.personal.headline, Form: PersonalForm },
  { id: 'skills', label: (L) => L.skills, icon: Sparkles, done: (cv) => cv.skills.length > 0, Form: SkillsForm },
  { id: 'experience', label: (L) => L.experience, icon: Briefcase, done: (cv) => cv.experience.length > 0, Form: ExperienceForm },
  { id: 'education', label: (L) => L.education, icon: GraduationCap, done: (cv) => cv.education.length > 0, Form: EducationForm },
  { id: 'projects', label: (L) => L.projects, icon: FolderKanban, done: (cv) => cv.projects.length > 0, Form: ProjectsForm },
  { id: 'contact', label: () => 'Contacto', icon: Mail, done: (cv) => !cv.settings.contact.enabled || !!(cv.settings.contact.recipient || cv.personal.email), Form: ContactSettingsForm },
]

function ClearButton() {
  const clear = useCVStore((s) => s.clear)
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 3000)
    return () => clearTimeout(t)
  }, [armed])
  return (
    <Button size="sm" variant={armed ? 'danger' : 'ghost'} onClick={() => (armed ? (clear(), setArmed(false)) : setArmed(true))}>
      {armed ? 'Pulsa otra vez para vaciar' : 'Empezar de cero'}
    </Button>
  )
}

function Preview({ cv }: { cv: CV }) {
  const style = useResolvedStyle(cv)
  const [mode, setMode] = useState<'3d' | 'cv'>('3d')
  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-[28px]"
      style={{ ...styleVars(style), background: style.theme.bg }}
    >
      <div className="stage absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3">
        <div role="tablist" aria-label="Tipo de vista previa" className="flex rounded-full bg-[color-mix(in_srgb,var(--st-bg)_80%,transparent)] p-1 backdrop-blur-md">
          {([
            ['3d', 'Portfolio 3D', Box],
            ['cv', 'CV', FileText],
          ] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              role="tab"
              aria-selected={mode === id}
              onClick={() => setMode(id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                mode === id ? 'bg-[var(--st-text)] text-[var(--st-bg)]' : 'text-[var(--st-soft)] hover:text-[var(--st-text)]'
              )}
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </div>
        <AppLink
          to={mode === '3d' ? 'portfolio' : 'cv'}
          className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--st-bg)_80%,transparent)] px-3.5 py-2 text-sm text-[var(--st-text)] backdrop-blur-md transition-colors hover:bg-[var(--st-bg)]"
        >
          <Maximize2 className="size-4" /> Pantalla completa
        </AppLink>
      </div>
      <div className="relative min-h-0 flex-1">
        {mode === '3d' ? (
          <Suspense fallback={<div className="grid h-full place-items-center text-sm text-[var(--st-mist)]">Cargando escena 3D…</div>}>
            <PortfolioCanvas data={cv} />
          </Suspense>
        ) : (
          <div className="scrollbar-thin h-full overflow-y-auto bg-[#e7e9f4] pt-14">
            <ScaledSheet padding={28}>
              <CVDocument data={cv} />
            </ScaledSheet>
          </div>
        )}
      </div>
    </div>
  )
}

export function EditorShell() {
  const cv = useCVStore((s) => s.cv)
  const rev = useCVStore((s) => s.rev)
  const loadDemo = useCVStore((s) => s.loadDemo)
  const sector = useSector()
  const [active, setActive] = useState<SectionId>('sector')
  const current = sections.find((s) => s.id === active)!
  const Form = current.Form
  const doneCount = sections.filter((s) => s.done(cv)).length

  return (
    <div className="flex h-dvh flex-col bg-paper">
      <AppHeader
        current="editor"
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={() => loadDemo()}>
              Cargar ejemplo
            </Button>
            <ClearButton />
          </>
        }
      />

      <div className="flex min-h-0 flex-1 gap-4 p-3 sm:p-4">
        <div className="flex min-h-0 w-full flex-col overflow-hidden rounded-[28px] border border-line bg-white/60 lg:w-[min(640px,48%)] xl:flex-row">
          <nav aria-label="Apartados del CV" className="shrink-0 border-b border-line p-3 xl:w-56 xl:border-r xl:border-b-0 xl:p-4">
            <p className="mb-3 hidden px-2 text-xs text-ink-soft xl:block">
              {doneCount} de {sections.length} apartados listos
            </p>
            <ul className="scrollbar-thin flex gap-1 overflow-x-auto xl:flex-col">
              {sections.map((s) => {
                const Icon = s.icon
                const done = s.done(cv)
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => setActive(s.id)}
                      aria-current={active === s.id ? 'step' : undefined}
                      className={cn(
                        'relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium whitespace-nowrap transition-colors',
                        active === s.id ? 'text-ink' : 'text-ink-soft hover:bg-ink/[0.04] hover:text-ink'
                      )}
                    >
                      {active === s.id && (
                        <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-white shadow-[0_1px_3px_rgb(21_23_58/0.1)]" transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }} />
                      )}
                      <Icon className="relative size-4 shrink-0" />
                      <span className="relative min-w-0 flex-1 truncate">{s.label(sector.labels)}</span>
                      {done && <Check className="relative size-3.5 shrink-0 text-[#1f9e86]" aria-label="Completo" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="scrollbar-thin @container min-h-0 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${active}-${rev}`}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="p-5 sm:p-7"
              >
                <Form />
              </motion.div>
            </AnimatePresence>
            <div className="flex flex-col gap-2 border-t border-line p-5 sm:hidden">
              <AppLink to="portfolio" className="text-sm font-medium text-violet">Ver mi portfolio 3D</AppLink>
              <AppLink to="cv" className="text-sm font-medium text-violet">Ver mi CV</AppLink>
            </div>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 lg:block">
          <Preview cv={cv} />
        </div>
      </div>
    </div>
  )
}
