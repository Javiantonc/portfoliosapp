'use client'
import { useEffect, useRef, useState } from 'react'
import { usePreviewFocus } from './focus'
import { useIsTouch } from '@/lib/use-touch'
import { useLabelLayer } from './label-layer'
import { ContactForm, contactRecipient } from './ContactForm'
import { skillsHintText } from '@/lib/skills-text'
import { isHex } from '@/lib/design'
import { useFrame, useThree } from '@react-three/fiber'
import { Scroll, ScrollControls, useScroll } from '@react-three/drei'
import { easing } from 'maath'
import type { Group, Mesh } from 'three'
import type { CV } from '@/lib/schema/cv'
import { formatRange, initials } from '@/lib/utils'
import { NameText3D } from './objects/NameText3D'
import { HeroShape } from './objects/HeroShape'
import { Backdrop } from './objects/Backdrop'
import { SkillsViz } from './objects/SkillsViz'
import { PhotoFrame } from './objects/PhotoFrame'
import { CARD_H, CARD_W, MAX_TILT, ProjectPanels, useCardHover, useProjectLayout } from './objects/ProjectCards'
import { StageThemeProvider, useFx, useStageTheme } from './theme'
import { AppEnvProvider, useAppEnv } from '@/lib/nav'
import { getLabels, getSector } from '@/lib/sectors'
import { create } from 'zustand'

/** Altura real (px) del contenido de las secciones de texto, para que nunca se solapen en pantallas pequeñas. */
const useSectionSizes = create<{ about: number; skills: number; experience: number; contact: number }>(() => ({ about: 0, skills: 0, experience: 0, contact: 0 }))
type Measured = 'about' | 'skills' | 'experience' | 'contact'

function useLayout(cv: CV) {
  const { viewport, size } = useThree()
  const wide = size.width >= 900
  const projects = useProjectLayout(cv.projects.length)
  const projectPages = Math.max(1, (projects.worldHeight + 0.6) / viewport.height)

  const sizes = useSectionSizes()
  const fit = (px: number, min: number) => Math.max(min, px ? (px + 96) / size.height : min)
  const hasForm = cv.settings.contact.enabled && !!contactRecipient(cv)
  // en móvil las habilidades van en su propia pantalla, debajo del texto «Sobre mí»
  const skillsOwnPage = !wide && cv.skills.length > 0
  const aboutPages = fit(sizes.about, 1)
  const skillsPages = skillsOwnPage ? fit(sizes.skills, 1) : 0
  const experiencePages = fit(sizes.experience, 1)
  const contactPages = fit(sizes.contact, hasForm && wide ? 1 : 0.85)

  const about = 1
  const skills = about + aboutPages
  const experience = skills + skillsPages
  const projectsStart = experience + experiencePages
  const contact = projectsStart + projectPages
  const start = { hero: 0, about, skills, experience, projects: projectsStart, contact }
  // redondeado para no rehacer el scroll por cambios mínimos de altura
  const pages = Math.round((contact + contactPages) * 20) / 20
  return { wide, pages, start, viewport, size, projects, hasForm, contactPages, aboutPages, skillsPages, experiencePages, skillsOwnPage }
}

function Knot({ position }: { position: [number, number, number] }) {
  const c = useStageTheme()
  const ref = useRef<Mesh>(null!)
  useFrame((s, dt) => {
    ref.current.rotation.x += dt * 0.1 * c.fx.speed
    ref.current.rotation.y += dt * 0.14 * c.fx.speed
    easing.damp3(ref.current.position, [position[0] + s.pointer.x * 0.3 * c.fx.mouse, position[1] + s.pointer.y * 0.2 * c.fx.mouse, position[2]], 0.5, dt)
  })
  return (
    <mesh ref={ref} position={position}>
      <torusKnotGeometry args={[1.1, 0.32, 220, 24, 2, 3]} />
      <meshPhysicalMaterial color={c.accent2} metalness={0.7} roughness={0.2} clearcoat={1} wireframe />
    </mesh>
  )
}

function World({ cv }: { cv: CV }) {
  const { wide, start, viewport } = useLayout(cv)
  const H = viewport.height
  const W = viewport.width
  const root = useRef<Group>(null!)
  const labelLayer = useLabelLayer()
  const fx = useFx()
  const frame = cv.settings.photo.portfolio === 'frame' && !!cv.personal.photoUrl

  useFrame((state, dt) => {
    easing.dampE(root.current.rotation, [state.pointer.y * -0.03 * fx.mouse, state.pointer.x * 0.05 * fx.mouse, 0], 0.4, dt)
  })

  return (
    <group ref={root}>
      <Backdrop count={wide ? 1100 : 600} spread={[W * 1.6, H * 7, 10]} height={H * 7} />

      <group position={[0, -H * start.hero, 0]}>
        <NameText3D
          name={cv.personal.fullName}
          widthRatio={wide ? 0.5 : 0.86}
          position={wide ? [-W * 0.16, 0.25, 0] : [0, H * (frame ? 0.25 : 0.17), 0]}
        />
        {frame ? (
          <>
            <PhotoFrame
              url={cv.personal.photoUrl}
              size={wide ? Math.min(2.6, H * 0.42, W * 0.26) : Math.min(W * 0.46, H * 0.22)}
              position={wide ? [W * 0.27, 0, 0] : [0, -H * 0.05, 0]}
            />
            <HeroShape position={wide ? [W * 0.36, H * 0.12, -3.5] : [W * 0.3, H * 0.36, -5]} scale={wide ? 0.95 : 0.7} />
          </>
        ) : (
          <HeroShape position={wide ? [W * 0.3, -0.1, -1.5] : [W * 0.22, H * 0.3, -4]} scale={wide ? 1.15 : 0.9} />
        )}
      </group>

      <group position={[0, -H * (wide ? start.about : start.skills), 0]}>
        {labelLayer && (
          <SkillsViz
            portal={labelLayer}
            skills={cv.skills}
            view={cv.settings.skillsView}
            position={wide ? [W * 0.24, -0.2, 0] : [0, -H * 0.06, -1]}
            radius={wide ? 2.3 : Math.min(1.6, W * 0.33)}
          />
        )}
      </group>

      {wide && (
        <group position={[0, -H * start.experience, 0]}>
          <Knot position={[W * 0.3, -0.2, -1.5]} />
        </group>
      )}

      <group position={[0, -H * start.projects, 0]}>
        <ProjectPanels projects={cv.projects} />
      </group>
    </group>
  )
}

function Section({ top, height, children, className = '' }: { top: number; height: number; children: React.ReactNode; className?: string }) {
  return (
    <section className={`absolute inset-x-0 ${className}`} style={{ top, height }}>
      {children}
    </section>
  )
}

/** Sección centrada que mide su contenido para ajustar la altura de la página. */
function MeasuredSection({ id, top, height, children, className = '' }: { id: Measured; top: number; height: number; children: React.ReactNode; className?: string }) {
  const inner = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = inner.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const px = Math.ceil(el.offsetHeight)
      if (Math.abs(useSectionSizes.getState()[id] - px) > 2) useSectionSizes.setState({ [id]: px })
    })
    ro.observe(el)
    return () => {
      ro.disconnect()
      useSectionSizes.setState({ [id]: 0 })
    }
  }, [id])
  return (
    <section className="absolute inset-x-0 flex flex-col pt-16" style={{ top, height }}>
      <div ref={inner} className={`my-auto w-full ${className}`}>
        {children}
      </div>
    </section>
  )
}

function SkillList({ cv, className }: { cv: CV; className: string }) {
  const sv = cv.settings.skillsView
  return (
    <ul className={className}>
      {cv.skills.slice(0, 12).map((s) => (
        <li key={s.id}>
          <div className="flex justify-between text-sm">
            <span className="font-medium">{s.name}</span>
            {sv.labels === 'full' && <span className="tabular-nums text-[var(--st-mist)]">{s.level}</span>}
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--st-line)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${s.level}%`,
                background:
                  sv.colorMode === 'single'
                    ? isHex(sv.colorHigh)
                      ? sv.colorHigh
                      : 'var(--st-warm)'
                    : `linear-gradient(90deg, ${isHex(sv.colorLow) ? sv.colorLow : 'var(--st-accent2)'}, ${isHex(sv.colorHigh) ? sv.colorHigh : 'var(--st-warm)'})`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

function ProjectCardsDom({ cv, top }: { cv: CV; top: number }) {
  const { viewport, size } = useThree()
  const { cards, scale } = useProjectLayout(cv.projects.length)
  const ppu = size.height / viewport.height
  const w = CARD_W * scale * ppu
  const h = CARD_H * scale * ppu
  const set = useCardHover.setState
  const hoverId = useCardHover((s) => s.id)
  const hx = useCardHover((s) => s.x)
  const hy = useCardHover((s) => s.y)
  const tilt = useFx().tilt ? MAX_TILT : 0
  const compact = w < 380
  const tiny = h < 190

  return (
    <>
      {cv.projects.map((pr, i) => {
        const active = hoverId === pr.id
        const href = pr.url ? (pr.url.startsWith('http') ? pr.url : `https://${pr.url}`) : undefined
        return (
          <div
            key={pr.id}
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              set({ id: pr.id, x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1 })
            }}
            onPointerLeave={() => set({ id: null, x: 0, y: 0 })}
            className="absolute flex flex-col justify-between"
            style={{
              left: size.width / 2 + cards[i].x * ppu - w / 2,
              top: top + (viewport.height / 2 - cards[i].y) * ppu - h / 2,
              width: w,
              height: h,
              padding: tiny ? '14px 16px 14px 20px' : compact ? '18px 20px 18px 24px' : '26px 28px 24px 32px',
              transform: `perspective(${ppu * 9}px) rotateX(${active ? -hy * tilt : 0}rad) rotateY(${active ? hx * tilt : 0}rad) translateZ(${active && tilt ? 0.25 * ppu : 0}px)`,
              transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            <div className="min-h-0 overflow-hidden">
              <h3 className={`font-display leading-[1.05] font-bold ${compact ? 'text-xl' : 'text-[28px]'}`}>{pr.title}</h3>
              <p className={`mt-2 leading-relaxed text-[var(--st-soft)] ${tiny ? 'line-clamp-1 text-[13px]' : compact ? 'line-clamp-2 text-[13px]' : 'line-clamp-3 text-[15px]'}`}>{pr.description}</p>
            </div>
            <div className="flex items-end justify-between gap-3">
              <div className="flex min-w-0 flex-wrap gap-1.5">
                {pr.tags.slice(0, tiny ? 1 : compact ? 2 : 4).map((t) => (
                  <span key={t} className="rounded-full border border-[var(--st-line)] px-2.5 py-0.5 text-[12px] text-[var(--st-soft)]">
                    {t}
                  </span>
                ))}
              </div>
              {href && (
                <a href={href} target="_blank" rel="noreferrer" className="shrink-0 text-[13px] text-[var(--st-accent2)] underline-offset-4 hover:underline">
                  {getLabels(cv).projectLink}
                </a>
              )}
            </div>
          </div>
        )
      })}
    </>
  )
}

function Overlay({ cv }: { cv: CV }) {
  const { wide, start, size, hasForm, contactPages, aboutPages, skillsPages, experiencePages, skillsOwnPage } = useLayout(cv)
  const L = getLabels(cv)
  const sv = cv.settings.skillsView
  const ph = cv.settings.photo
  const showAvatar = ph.portfolio === 'avatar' || (ph.portfolio === 'frame' && !cv.personal.photoUrl)
  const touch = useIsTouch()
  const tiltOn = useFx().tilt
  const h = size.height
  const pad = wide ? 'px-16' : 'px-6'
  const p = cv.personal

  return (
    <div className="stage stage-content text-[var(--st-text)]" style={{ width: size.width }}>
      <Section top={0} height={h} className={`flex flex-col justify-end pb-14 ${pad}`}>
        <div className={`flex items-end gap-4 ${wide ? 'max-w-[46%]' : ''}`}>
          {showAvatar &&
            (p.photoUrl ? (
              <img src={p.photoUrl} alt="" className="size-14 shrink-0 rounded-full object-cover ring-2 ring-white/20" />
            ) : (
              <div className="grid size-14 shrink-0 place-items-center rounded-full bg-white/10 font-display text-lg font-bold">
                {initials(p.fullName || 'Tu nombre')}
              </div>
            ))}
          <div>
            <p className="font-display text-xl leading-tight font-semibold">{p.headline || L.headline}</p>
            {p.location && <p className="mt-1 text-sm text-[var(--st-mist)]">{p.location}</p>}
          </div>
        </div>
        <p className="mt-8 text-xs text-[var(--st-mist)]">Desliza para recorrer el portfolio</p>
      </Section>

      <MeasuredSection id="about" top={start.about * h} height={h * aboutPages} className={`flex items-center ${pad}`}>
        <div className={wide ? 'max-w-[42%]' : 'max-w-xl'}>
          <h2 className="font-display text-4xl font-bold md:text-5xl">{sv.title.trim() || 'Sobre mí'}</h2>
          <p className="mt-5 text-lg leading-relaxed text-[var(--st-soft)]">{p.summary || 'Cuenta en dos o tres frases qué haces y qué te hace diferente.'}</p>
          {!skillsOwnPage && cv.skills.length > 0 && sv.showHint && <p className="mt-6 text-sm text-[var(--st-mist)]">{skillsHintText(sv, L.skillsHint)}</p>}
        </div>
        {wide && sv.layout === 'list' && cv.skills.length > 0 && <SkillList cv={cv} className="ml-auto w-[38%] space-y-4" />}
      </MeasuredSection>

      {skillsOwnPage && (
        <MeasuredSection id="skills" top={start.skills * h} height={h * skillsPages} className={pad}>
          {sv.showHint && <p className="text-sm text-[var(--st-mist)]">{skillsHintText(sv, L.skillsHint)}</p>}
          {sv.layout === 'list' ? <SkillList cv={cv} className="mt-6 space-y-3" /> : <div style={{ height: h * 0.62 }} aria-hidden />}
        </MeasuredSection>
      )}

      <MeasuredSection id="experience" top={start.experience * h} height={h * experiencePages} className={pad}>
        <div className={wide ? 'w-[48%]' : 'w-full'}>
          <h2 className="font-display text-4xl font-bold md:text-5xl">Trayectoria</h2>
          <ol className="mt-8 space-y-6 border-l border-[var(--st-line)] pl-6">
            {cv.experience.slice(0, 4).map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute top-2 -left-[29px] size-2.5 rounded-full bg-[var(--st-accent2)] ring-4 ring-[var(--st-bg)]" />
                <p className="text-xs text-[var(--st-mist)]">{formatRange(e.startDate, e.endDate, e.current)}</p>
                <p className="mt-1 font-display text-xl font-semibold">
                  {e.role} <span className="font-normal text-[var(--st-mist)]">en {e.company}</span>
                </p>
                {e.description && <p className="mt-1.5 text-sm leading-relaxed text-[var(--st-soft)]">{e.description}</p>}
              </li>
            ))}
            {cv.education.slice(0, 2).map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute top-2 -left-[29px] size-2.5 rounded-full bg-[var(--st-accent)] ring-4 ring-[var(--st-bg)]" />
                <p className="text-xs text-[var(--st-mist)]">{formatRange(e.startDate, e.endDate)}</p>
                <p className="mt-1 font-display text-lg font-semibold">{e.degree}</p>
                <p className="text-sm text-[var(--st-mist)]">{e.institution}</p>
              </li>
            ))}
          </ol>
        </div>
      </MeasuredSection>

      <Section top={start.projects * h} height={h * 0.3} className={`pt-16 ${pad}`}>
        <h2 className="font-display text-4xl font-bold md:text-5xl">{L.projects}</h2>
        {!touch && tiltOn && <p className="mt-3 text-[var(--st-mist)]">Pasa el ratón por una tarjeta para inclinarla.</p>}
      </Section>
      <ProjectCardsDom cv={cv} top={start.projects * h} />

      <MeasuredSection
        id="contact"
        top={start.contact * h}
        height={h * contactPages}
        className={`flex pb-10 ${hasForm && wide ? 'items-center gap-12' : 'flex-col gap-10'} ${pad}`}
      >
        <div className={hasForm && wide ? 'flex-1' : ''}>
        <h2 className="font-display text-5xl leading-[0.95] font-bold md:text-7xl">{L.contact}</h2>
        {p.email && (
          <a href={`mailto:${p.email}`} className="mt-6 w-fit font-display text-2xl text-[var(--st-accent2)] underline-offset-8 hover:underline md:text-3xl">
            {p.email}
          </a>
        )}
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {p.phone && <span className="rounded-full border border-[var(--st-line)] px-4 py-2 text-[var(--st-soft)]">{p.phone}</span>}
          {p.links.map((l) => (
            <a
              key={l.id}
              href={l.url.startsWith('http') ? l.url : `https://${l.url}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[var(--st-line)] px-4 py-2 text-[var(--st-soft)] transition-colors hover:border-[var(--st-accent2)] hover:text-[var(--st-text)]"
            >
              {l.label}
            </a>
          ))}
        </div>
        </div>
        {hasForm && (
          <div className={wide ? 'w-[min(460px,44%)] shrink-0' : 'w-full max-w-xl'}>
            <ContactForm cv={cv} />
          </div>
        )}
      </MeasuredSection>
    </div>
  )
}

/**
 * Si el lienzo se vuelve a renderizar (p. ej. al escribir en el editor), R3F reconecta los eventos
 * al canvas y el scroll deja de funcionar. Este componente los devuelve al contenedor de scroll.
 */
function KeepScrollConnected() {
  const scroll = useScroll()
  const events = useThree((s) => s.events)
  useFrame(() => {
    if (events.connected !== scroll.el) events.connect?.(scroll.el)
  })
  return null
}

function ScrollFocus({ cv }: { cv: CV }) {
  const scroll = useScroll()
  const { start, wide, pages } = useLayout(cv)
  const section = usePreviewFocus((s) => s.section)
  // en pantallas estrechas el gráfico queda debajo del texto
  const target = section === 'contact' ? Math.min(start.contact, pages - 1) : wide ? start.about : start.skills
  useEffect(() => {
    if (!section) return
    const el = scroll.el
    // se repite por si el lienzo aún no escuchaba el scroll al montarse
    const go = () => {
      el.scrollTop = target * el.clientHeight
      el.dispatchEvent(new Event('scroll'))
    }
    const ts = [120, 700, 1600].map((ms) => setTimeout(go, ms))
    return () => ts.forEach(clearTimeout)
  }, [section, scroll, target])
  return null
}

/**
 * Cuando cambia el número de páginas (p. ej. al escribir en el editor), ScrollControls recrea
 * su contenedor y vuelve arriba. Este componente recuerda la posición y la restaura.
 */
function PreserveScroll({ pages }: { pages: number }) {
  const scroll = useScroll()
  const last = useRef(0)
  const first = useRef(true)
  useFrame(() => {
    if (scroll.el.scrollTop > 1) last.current = scroll.el.scrollTop
  })
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const px = last.current
    const t = setTimeout(() => {
      scroll.el.scrollTop = px
      scroll.el.dispatchEvent(new Event('scroll'))
    }, 30)
    return () => clearTimeout(t)
  }, [pages, scroll])
  return null
}

function Controls({ cv }: { cv: CV }) {
  const { pages } = useLayout(cv)
  // <Scroll html> se pinta en una raíz de React aparte: hay que volver a pasarle los contextos
  const env = useAppEnv()
  const stage = useStageTheme()
  return (
    <ScrollControls pages={pages} damping={0.22}>
      <KeepScrollConnected />
      <PreserveScroll pages={pages} />
      <ScrollFocus cv={cv} />
      <Scroll>
        <World cv={cv} />
      </Scroll>
      <Scroll html style={{ width: '100%' }}>
        <AppEnvProvider value={env}>
          <StageThemeProvider value={stage}>
            <Overlay cv={cv} />
          </StageThemeProvider>
        </AppEnvProvider>
      </Scroll>
    </ScrollControls>
  )
}

export function PortfolioScene({ data }: { data: CV }) {
  return <Controls cv={data} />
}
