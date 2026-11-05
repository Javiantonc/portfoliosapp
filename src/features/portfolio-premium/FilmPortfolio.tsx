'use client'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ArrowDown, ArrowRight, Check, Copy, MapPin, Phone } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { CV } from '@/lib/schema/cv'
import { getLabels, getSector } from '@/lib/sectors'
import { headingFonts, isHex, mix } from '@/lib/design'
import { formatRange, initials } from '@/lib/utils'
import { ContactForm, contactRecipient } from '@/features/portfolio-3d/ContactForm'
import { usePreviewFocus } from '@/features/portfolio-3d/focus'
import { firstName, href, months, pad2, sentences, yearsOfExperience } from './shared'

/* Plantilla Premium «Cine»: el portfolio como una producción audiovisual. */

function palette(cv: CV) {
  const accent = isHex(cv.settings.accent) ? cv.settings.accent : '#5c6a4a'
  return {
    accent,
    forest: mix(accent, '#0b0e0a', 0.68),
    sage: mix(accent, '#ffffff', 0.45),
    sageL: mix(accent, '#ffffff', 0.78),
    cream: '#f6f5ef',
    paper: '#fbfaf6',
    ink: '#1c2219',
    mute: '#6c7363',
  }
}

function SceneTag({ n, title, take, dark = false }: { n: number; title: string; take: string; dark?: boolean }) {
  const line = dark ? 'border-white/25 text-white/80' : 'border-[var(--f-ink)]/25 text-[var(--f-ink)]'
  return (
    <div className={`inline-flex overflow-hidden rounded-full border font-mono text-[11px] tracking-[0.12em] uppercase ${line}`}>
      <span className={dark ? 'bg-white px-3 py-1.5 text-[var(--f-forest)]' : 'bg-[var(--f-forest)] px-3 py-1.5 text-white'}>Escena {pad2(n)}</span>
      <span className="border-l border-inherit px-3 py-1.5">{title}</span>
      <span className="hidden border-l border-inherit px-3 py-1.5 @md:inline">{take}</span>
    </div>
  )
}

function Heading({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <h2 className={`mt-5 max-w-[20ch] font-display text-[clamp(2rem,6.4cqw,4rem)] leading-[1.02] font-bold tracking-[-0.02em] ${dark ? 'text-white' : 'text-[var(--f-ink)]'}`}>
      {children}
    </h2>
  )
}

const Hi = ({ children }: { children: ReactNode }) => <span className="text-[var(--f-accent)]">{children}</span>

function Countdown({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(3)
  useEffect(() => {
    if (n === 0) {
      const t = setTimeout(onDone, 250)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setN(n - 1), 700)
    return () => clearTimeout(t)
  }, [n, onDone])
  return (
    <motion.button
      aria-label="Saltar la introducción"
      onClick={onDone}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 grid place-items-center bg-[var(--f-forest)]"
    >
      <span className="relative grid size-[min(46cqw,260px)] place-items-center rounded-full border-2 border-white/40">
        <span className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(var(--f-sage) ${((3 - n) / 3) * 360}deg, transparent 0)`, opacity: 0.55 }} />
        <span className="absolute inset-x-0 top-1/2 h-px bg-white/30" />
        <span className="absolute inset-y-0 left-1/2 w-px bg-white/30" />
        <span className="relative font-display text-[min(24cqw,140px)] font-extrabold text-white">{n || ''}</span>
      </span>
      <span className="absolute bottom-6 font-mono text-[11px] tracking-[0.2em] text-white/70 uppercase">Toca para saltar</span>
    </motion.button>
  )
}

export function FilmPortfolio({ cv, embedded = false }: { cv: CV; embedded?: boolean }) {
  const pal = useMemo(() => palette(cv), [cv])
  const p = cv.personal
  const L = getLabels(cv)
  const reduce = useReducedMotion()
  const [intro, setIntro] = useState(!reduce)
  const [clip, setClip] = useState(0)
  const [time, setTime] = useState(0)
  const [copied, setCopied] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const years = yearsOfExperience(cv)
  const first = firstName(cv)
  const heading = cv.settings.headingFont === 'auto' ? headingFonts.lexend.family : headingFonts[cv.settings.headingFont].family
  const exp = cv.experience
  const sel = exp[Math.min(clip, Math.max(0, exp.length - 1))]
  const total = exp.reduce((a, e) => a + months(e.startDate, e.endDate, e.current), 0) || 1
  const tiers = [
    { name: 'Dominio', hint: 'Mesa principal', items: cv.skills.filter((s) => s.level >= 85) },
    { name: 'Avanzado', hint: 'Montaje y post', items: cv.skills.filter((s) => s.level >= 65 && s.level < 85) },
    { name: 'En desarrollo', hint: 'En rodaje', items: cv.skills.filter((s) => s.level < 65) },
  ].filter((t) => t.items.length)
  const recipient = contactRecipient(cv)
  const focus = usePreviewFocus((s) => s.section)

  // Código de tiempo que avanza con el scroll (25 fotogramas por segundo, 2 minutos de «metraje»)
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const on = () => setTime((el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)) * 120)
    el.addEventListener('scroll', on, { passive: true })
    return () => el.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    if (!focus) return
    const target = scroller.current?.querySelector(`[data-scene="${focus === 'about' ? 'skills' : 'contact'}"]`)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [focus])

  const tc = `${pad2(Math.floor(time / 3600))}:${pad2(Math.floor(time / 60) % 60)}:${pad2(Math.floor(time) % 60)}:${pad2(Math.floor((time % 1) * 25))}`
  const go = (id: string) => scroller.current?.querySelector(`[data-scene="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const vars = {
    '--f-accent': pal.accent,
    '--f-forest': pal.forest,
    '--f-sage': pal.sage,
    '--f-sagel': pal.sageL,
    '--f-cream': pal.cream,
    '--f-paper': pal.paper,
    '--f-ink': pal.ink,
    '--f-mute': pal.mute,
    '--st-display': heading,
    // variables que usa el formulario de contacto
    '--st-bg': pal.paper,
    '--st-bg2': '#ffffff',
    '--st-text': pal.ink,
    '--st-soft': '#3a4234',
    '--st-mist': pal.mute,
    '--st-accent': pal.accent,
    '--st-accent2': pal.accent,
    '--st-line': 'rgba(28,34,25,.14)',
    fontFamily: '"Lexend", system-ui, sans-serif',
  } as CSSProperties

  const nav = [
    ['profile', 'Perfil'],
    ['experience', 'Experiencia'],
    ['skills', 'Herramientas'],
    ['projects', L.projects],
    ['education', 'Formación'],
    ['contact', 'Contacto'],
  ] as const

  return (
    <div className="relative h-full overflow-hidden bg-[var(--f-cream)] text-[var(--f-ink)]" style={vars}>
      {intro && <Countdown onDone={() => setIntro(false)} />}
      <div ref={scroller} className="stage-content scrollbar-thin @container h-full overflow-y-auto font-light" style={{ fontFamily: vars.fontFamily as string }}>
        {/* Navegación */}
        <header className={`sticky top-0 z-30 flex items-center justify-between gap-3 bg-[var(--f-cream)]/85 px-4 py-3 backdrop-blur-md @lg:px-8 ${embedded ? 'pt-14' : ''}`}>
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-[var(--f-accent)] font-display text-xs font-bold text-white">{initials(p.fullName) || 'TU'}</span>
            <span className="hidden font-display text-sm font-semibold @sm:inline">{p.fullName || 'Tu nombre'}</span>
          </div>
          <nav className="hidden gap-1 @3xl:flex">
            {nav.map(([id, label]) => (
              <button key={id} onClick={() => go(id)} className="rounded-full px-3 py-1.5 text-[13px] font-medium hover:bg-[var(--f-sagel)]">
                {label}
              </button>
            ))}
          </nav>
          <span className="rounded-full bg-[var(--f-forest)] px-3 py-1.5 font-mono text-[11px] text-white" aria-hidden>
            <span className="text-[#ff5d4f]">●</span> {tc}
          </span>
        </header>

        {/* Cabecera */}
        <section className="grid items-center gap-8 px-4 pt-6 pb-14 @lg:px-8 @3xl:grid-cols-[1.25fr_1fr] @3xl:pt-12">
          <div>
            <span className="inline-flex rounded-full border border-[var(--f-ink)]/25 px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase">● {getSector(cv.settings.sector).short}</span>
            <h1
              className="mt-6 font-display leading-[0.86] font-extrabold tracking-[-0.03em] uppercase"
              style={{ fontSize: `calc(clamp(3rem, 13cqw, 8.5rem) * ${cv.settings.titleScale})` }}
            >
              {p.fullName || 'Tu nombre'}
            </h1>
            <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed">
              <strong className="font-semibold">{p.headline || L.headline}.</strong> {sentences(p.summary)[0] ? `${sentences(p.summary)[0]}.` : ''}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => go('experience')} className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--f-forest)] px-5 text-sm font-medium text-white">
                Ver mi trabajo <ArrowRight className="size-4" />
              </button>
              <button onClick={() => go('contact')} className="h-11 rounded-full border border-[var(--f-ink)]/30 px-5 text-sm font-medium">
                Hablemos
              </button>
            </div>
            {p.location && (
              <p className="mt-6 flex items-center gap-1.5 text-sm text-[var(--f-mute)]">
                <MapPin className="size-4" /> {p.location}
              </p>
            )}
          </div>
          <div className="relative mx-auto w-full max-w-[420px]">
            <div className="aspect-[4/5] overflow-hidden rounded-[28px] bg-[var(--f-accent)]">
              {p.photoUrl && cv.settings.photo.portfolio !== 'none' ? (
                <img src={p.photoUrl} alt={p.fullName} className="size-full object-cover" />
              ) : (
                <span className="grid size-full place-items-center font-display text-7xl font-extrabold text-white/80">{initials(p.fullName) || 'TU'}</span>
              )}
            </div>
            <span className="absolute top-4 left-4 rounded-full bg-black/55 px-3 py-1 font-mono text-[11px] text-white backdrop-blur">
              <span className="text-[#ff5d4f]">●</span> REC 4K · 25P
            </span>
            {years > 0 && (
              <span className="absolute -bottom-5 -left-3 rounded-3xl bg-[var(--f-forest)] px-5 py-3 text-white shadow-lg @md:-left-6">
                <span className="block font-display text-3xl font-extrabold">+{years}</span>
                <span className="text-xs text-white/75">años de experiencia</span>
              </span>
            )}
          </div>
        </section>

        {/* Escena 01 · Perfil */}
        <section data-scene="profile" className="px-4 py-16 @lg:px-8">
          <SceneTag n={1} title="Perfil profesional" take="Toma 1" />
          <Heading>
            Mi perfil, <Hi>en una sola</Hi> toma.
          </Heading>
          <div className="mt-8 grid gap-8 @3xl:grid-cols-[1.2fr_1fr]">
            <p className="text-[17px] leading-relaxed">{p.summary || 'Cuenta en dos o tres frases qué haces y qué te hace diferente.'}</p>
            {cv.skills.length > 0 && (
              <ul className="grid gap-2 @md:grid-cols-2">
                {cv.skills.slice(0, 8).map((s) => (
                  <li key={s.id} className="flex items-center gap-2 rounded-2xl bg-[var(--f-paper)] px-4 py-3 text-sm ring-1 ring-[var(--f-ink)]/10">
                    <Check className="size-4 shrink-0 text-[var(--f-accent)]" /> {s.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Escena 02 · Experiencia */}
        {exp.length > 0 && sel && (
          <section data-scene="experience" className="bg-[var(--f-forest)] px-4 py-16 text-white @lg:px-8">
            <SceneTag n={2} title={L.experience} take={`${exp.length} clips`} dark />
            <Heading dark>
              Mi trayectoria, <span className="text-[var(--f-sage)]">montada</span> en una línea de tiempo.
            </Heading>
            <div
              className="mt-8 overflow-hidden rounded-[24px] border border-white/10 bg-black/20"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') setClip((c) => Math.min(exp.length - 1, c + 1))
                if (e.key === 'ArrowLeft') setClip((c) => Math.max(0, c - 1))
              }}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 font-mono text-[11px] tracking-[0.1em] text-white/60 uppercase">
                <span>● ● ● Proyecto · {(first || 'TU').toUpperCase()}_TRAYECTORIA</span>
                <span>
                  Clip {pad2(clip + 1)} / {pad2(exp.length)}
                </span>
              </div>
              <div className="grid gap-6 p-4 @3xl:grid-cols-[1fr_1.1fr] @lg:p-6">
                <div className="relative flex aspect-video flex-col justify-between rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.02] p-4 ring-1 ring-white/10">
                  <div className="flex justify-between font-mono text-[11px] text-white/70">
                    <span>
                      <span className="text-[#ff5d4f]">●</span> PROGRAMA
                    </span>
                    <span>C{pad2(clip + 1)}</span>
                  </div>
                  <div>
                    <p className="font-display text-[clamp(1.4rem,4cqw,2.4rem)] leading-tight font-bold">{sel.company}</p>
                    <span className="mt-2 inline-block rounded-full bg-[var(--f-sage)] px-3 py-1 text-xs font-semibold text-[var(--f-forest)]">{sel.role}</span>
                  </div>
                </div>
                <div>
                  <p className="font-mono text-[11px] tracking-[0.12em] text-white/60 uppercase">{formatRange(sel.startDate, sel.endDate, sel.current)}</p>
                  {sel.description && (
                    <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-white/85">
                      {sentences(sel.description).map((s) => (
                        <li key={s} className="flex gap-2.5">
                          <Check className="mt-1 size-4 shrink-0 text-[var(--f-sage)]" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {/* Línea de tiempo */}
              <div className="border-t border-white/10 px-4 pt-3 pb-4 @lg:px-6">
                <div className="flex justify-between font-mono text-[10px] text-white/40">
                  {['00:00', '00:10', '00:20', '00:30', '00:40', '00:50', '01:00'].map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="w-6 font-mono text-[10px] text-white/50">V1</span>
                  <div className="flex flex-1 gap-1">
                    {[...exp].reverse().map((e) => {
                      const i = exp.indexOf(e)
                      return (
                        <button
                          key={e.id}
                          onClick={() => setClip(i)}
                          aria-label={`Clip ${i + 1}: ${e.company}`}
                          aria-pressed={clip === i}
                          className={`h-9 truncate rounded-md px-2 text-left text-[11px] font-medium transition-colors ${clip === i ? 'bg-[var(--f-sage)] text-[var(--f-forest)]' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                          style={{ flexGrow: months(e.startDate, e.endDate, e.current) / total, flexBasis: 0, minWidth: 40 }}
                        >
                          {e.company}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="mt-1.5 flex items-center gap-2" aria-hidden>
                  <span className="w-6 font-mono text-[10px] text-white/50">A1</span>
                  <div className="flex h-6 flex-1 items-center gap-[2px] overflow-hidden rounded-md bg-white/5 px-1">
                    {Array.from({ length: 80 }, (_, i) => (
                      <span key={i} className="w-[3px] shrink-0 rounded-full bg-[var(--f-sage)]/60" style={{ height: `${20 + Math.abs(Math.sin(i * 1.7) * 70)}%` }} />
                    ))}
                  </div>
                </div>
                <p className="mt-3 font-mono text-[10px] tracking-[0.12em] text-white/40 uppercase">Pulsa un clip · o usa ← → del teclado</p>
              </div>
            </div>
          </section>
        )}

        {/* Escena 03 · Herramientas */}
        {tiers.length > 0 && (
          <section data-scene="skills" className="rounded-t-[36px] bg-[var(--f-cream)] px-4 py-16 @lg:px-8">
            <SceneTag n={3} title={L.skills} take="Equipo técnico" />
            <Heading>
              Del <Hi>guion</Hi> al resultado final, con mi propio equipo.
            </Heading>
            <div className="mt-8 grid gap-4">
              {tiers.map((t, i) => {
                const dark = i === 1
                return (
                  <div key={t.name} className={`rounded-[24px] p-6 ${dark ? 'bg-[var(--f-accent)] text-white' : 'bg-[var(--f-paper)] ring-1 ring-[var(--f-ink)]/10'}`}>
                    <p className="font-display text-lg font-bold">{t.name}</p>
                    <p className={`font-mono text-[11px] tracking-[0.12em] uppercase ${dark ? 'text-white/70' : 'text-[var(--f-mute)]'}`}>{t.hint}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {t.items.map((s) => (
                        <span key={s.id} className={`rounded-xl px-3.5 py-2 text-sm ${dark ? 'bg-white/15' : 'bg-white ring-1 ring-[var(--f-ink)]/10'}`}>
                          {s.name}
                          {cv.settings.skillsView.labels === 'full' && <span className="ml-2 font-mono text-[11px] opacity-60">{s.level}</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Escena 04 · Proyectos */}
        {cv.projects.length > 0 && (
          <section data-scene="projects" className="px-4 py-16 @lg:px-8">
            <SceneTag n={4} title={L.projects} take="Toma buena" />
            <Heading>
              Las tomas que <Hi>me representan</Hi>.
            </Heading>
            <ol className="mt-8 grid gap-4 @3xl:grid-cols-2">
              {cv.projects.map((x, i) => (
                <li key={x.id} className="rounded-[24px] bg-[var(--f-paper)] p-6 ring-1 ring-[var(--f-ink)]/10">
                  <span className="font-display text-4xl font-extrabold text-[var(--f-sage)]">{pad2(i + 1)}</span>
                  <p className="mt-2 font-display text-xl font-bold">{x.title}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#3a4234]">{x.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {x.tags.map((t) => (
                      <span key={t} className="rounded-full bg-[var(--f-sagel)] px-3 py-1 text-xs font-medium">
                        {t}
                      </span>
                    ))}
                    {x.url && (
                      <a href={href(x.url)} target="_blank" rel="noreferrer" className="ml-auto text-sm font-medium text-[var(--f-accent)] underline-offset-4 hover:underline">
                        {L.projectLink} ↗
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Escena 05 · Formación como créditos */}
        {cv.education.length > 0 && (
          <section data-scene="education" className="bg-[var(--f-forest)] px-4 py-20 text-center text-white @lg:px-8">
            <SceneTag n={5} title={L.education} take="Créditos" dark />
            <Heading dark>
              <span className="mx-auto block">Los créditos de mi formación.</span>
            </Heading>
            <div className="mx-auto mt-12 max-w-xl space-y-10">
              {cv.education.map((e) => (
                <div key={e.id}>
                  <p className="font-mono text-[11px] tracking-[0.2em] text-white/55 uppercase">{e.degree}</p>
                  <p className="mt-2 font-display text-[clamp(1.4rem,4cqw,2.2rem)] font-bold">{e.institution}</p>
                  <p className="mt-1 text-sm text-white/55">{formatRange(e.startDate, e.endDate)}</p>
                </div>
              ))}
              <p className="pt-6 font-display text-3xl font-extrabold tracking-[0.3em]">FIN</p>
            </div>
          </section>
        )}

        {/* Escena 06 · Contacto */}
        <section data-scene="contact" className="px-4 py-16 @lg:px-8">
          <SceneTag n={6} title="Contacto" take="Última toma" />
          <Heading>
            ¿<Hi>Rodamos</Hi> juntos?
          </Heading>
          <div className="mt-8 grid gap-8 @3xl:grid-cols-[1fr_1fr]">
            <div className="space-y-3">
              {p.email && (
                <div className="flex flex-wrap items-center gap-3 rounded-[24px] bg-[var(--f-paper)] p-5 ring-1 ring-[var(--f-ink)]/10">
                  <span className="min-w-0 flex-1 truncate font-display text-xl font-bold">{p.email}</span>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(p.email)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 1800)
                      } catch {
                        /* el portapapeles puede no estar disponible */
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--f-forest)] px-4 py-2 text-sm text-white"
                  >
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? 'Email copiado' : 'Copiar'}
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {p.phone && (
                  <a href={`tel:${p.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--f-ink)]/25 px-4 py-2 text-sm">
                    <Phone className="size-4" /> {p.phone}
                  </a>
                )}
                {p.links.map((l) => (
                  <a key={l.id} href={href(l.url)} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--f-ink)]/25 px-4 py-2 text-sm">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
            {cv.settings.contact.enabled && recipient && <ContactForm cv={cv} />}
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--f-ink)]/10 px-4 py-6 text-sm text-[var(--f-mute)] @lg:px-8">
          <span>
            © {new Date().getFullYear()} {p.fullName}
            {p.location && ` · ${p.location}`}
          </span>
          <button onClick={() => scroller.current?.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex items-center gap-1 font-medium text-[var(--f-ink)]">
            Volver al inicio <ArrowDown className="size-4 rotate-180" />
          </button>
        </footer>
      </div>
    </div>
  )
}
