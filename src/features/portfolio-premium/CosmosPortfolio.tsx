'use client'
import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ArrowDown, ArrowUpRight, Code2, Globe, Mail, MapPin, UserRound } from 'lucide-react'
import type { CV } from '@/lib/schema/cv'
import { getLabels, getSector } from '@/lib/sectors'
import { headingFonts, isHex, mix } from '@/lib/design'
import { formatRange } from '@/lib/utils'
import { ContactForm, contactRecipient } from '@/features/portfolio-3d/ContactForm'
import { usePreviewFocus } from '@/features/portfolio-3d/focus'
import { firstName, href, sentences } from './shared'

const CosmosBackground = lazy(() => import('./CosmosBackground'))

/* Plantilla Premium «Cosmos»: narrativa al hacer scroll sobre una esfera iridiscente. */

function Label({ small, big }: { small: string; big: string }) {
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.22em] text-[var(--c-dim)] uppercase">{small}</p>
      <h2 className="mt-2 font-display text-[clamp(2rem,6cqw,3.6rem)] leading-none font-bold tracking-[-0.03em]">{big}</h2>
      <span className="mt-4 block h-px w-12 bg-[var(--c-glow)]/60" />
    </div>
  )
}

function Block({ id, small, big, children }: { id: string; small: string; big: string; children: ReactNode }) {
  return (
    <section data-scene={id} className="grid gap-8 px-5 py-20 @3xl:grid-cols-[minmax(220px,0.8fr)_2fr] @3xl:px-12">
      <Label small={small} big={big} />
      <div>{children}</div>
    </section>
  )
}

function Beat({ text, root, index }: { text: string; root: React.RefObject<HTMLDivElement | null>; index: number }) {
  const el = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(index === 0 ? 1 : 0)
  useEffect(() => {
    const scroller = root.current
    const node = el.current
    if (!scroller || !node) return
    const on = () => {
      const r = node.getBoundingClientRect()
      const s = scroller.getBoundingClientRect()
      const center = r.top + r.height / 2 - (s.top + s.height / 2)
      setV(Math.max(0, 1 - Math.abs(center) / (s.height * 0.55)))
    }
    on()
    scroller.addEventListener('scroll', on, { passive: true })
    return () => scroller.removeEventListener('scroll', on)
  }, [root])
  return (
    <div ref={el} className="grid h-[100cqh] place-items-center px-6 text-center">
      <p
        className="max-w-[18ch] font-display text-[clamp(2.2rem,8cqw,6rem)] leading-[1] font-bold tracking-[-0.035em]"
        style={{ opacity: v, transform: `translateY(${(1 - v) * 24}px) scale(${0.96 + v * 0.04})`, filter: `blur(${(1 - v) * 6}px)` }}
      >
        {text}
      </p>
    </div>
  )
}

export function CosmosPortfolio({ cv, embedded = false }: { cv: CV; embedded?: boolean }) {
  const p = cv.personal
  const L = getLabels(cv)
  const violet = isHex(cv.settings.accent) ? cv.settings.accent : '#7b3dff'
  const glow = mix(violet, '#ffffff', 0.55)
  const scroller = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const focus = usePreviewFocus((s) => s.section)
  const recipient = contactRecipient(cv)
  const heading = cv.settings.headingFont === 'auto' ? '"Geist", system-ui, sans-serif' : headingFonts[cv.settings.headingFont].family

  const beats = [`Hola, soy ${firstName(cv)}`, p.headline || L.headline, sentences(p.summary)[0] || ''].filter(Boolean)

  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const on = () => {
      progress.current = el.scrollTop / Math.max(1, el.clientHeight * beats.length)
    }
    on()
    el.addEventListener('scroll', on, { passive: true })
    return () => el.removeEventListener('scroll', on)
  }, [beats.length])

  useEffect(() => {
    if (!focus) return
    scroller.current?.querySelector(`[data-scene="${focus === 'about' ? 'skills' : 'contact'}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [focus])

  const vars = {
    '--c-violet': violet,
    '--c-glow': glow,
    '--c-dim': '#aaa8be',
    '--st-display': heading,
    '--st-bg': '#0b0717',
    '--st-bg2': mix(violet, '#000000', 0.82),
    '--st-text': '#f4f3fb',
    '--st-soft': '#d6d4e6',
    '--st-mist': '#aaa8be',
    '--st-accent': violet,
    '--st-accent2': glow,
    '--st-line': 'rgba(244,243,251,.16)',
  } as CSSProperties

  const links = p.links.map((l) => ({ ...l, Icon: /github|gitlab/i.test(l.url + l.label) ? Code2 : /linkedin/i.test(l.url + l.label) ? UserRound : Globe }))

  return (
    <div className="relative h-full overflow-hidden bg-black text-[#f4f3fb]" style={{ ...vars, fontFamily: '"Geist", system-ui, sans-serif' }}>
      <div className="pointer-events-none absolute inset-0">
        <Suspense fallback={null}>
          <CosmosBackground accent={violet} progress={progress} />
        </Suspense>
      </div>
      <div ref={scroller} className="stage-content scrollbar-thin relative h-full overflow-y-auto [container-type:size]">
        <button
          onClick={() => scroller.current?.querySelector('[data-scene="cv"]')?.scrollIntoView({ behavior: 'smooth' })}
          className={`sticky z-20 float-right mr-4 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-sm backdrop-blur-md ${embedded ? 'top-16' : 'top-4'}`}
        >
          Ir al CV <ArrowDown className="inline size-3.5" />
        </button>

        {beats.map((t, i) => (
          <Beat key={i} text={t} index={i} root={scroller} />
        ))}
        <p className="-mt-16 mb-10 text-center font-mono text-xs tracking-[0.3em] text-[var(--c-dim)] uppercase">desliza</p>

        <div data-scene="cv" className="relative bg-gradient-to-b from-transparent via-black/70 to-black/85 backdrop-blur-[2px]">
          <Block id="profile" small="Sobre mí" big="Perfil">
            <p className="text-[clamp(1.25rem,3cqw,1.9rem)] leading-snug font-medium">{p.summary || 'Cuenta en dos o tres frases qué haces y qué te hace diferente.'}</p>
          </Block>

          {cv.projects.length > 0 && (
            <section data-scene="projects" className="px-5 py-20 @3xl:px-12">
              <Label small="Lo que he hecho" big={L.projects} />
              <div className="mt-10 space-y-6">
                {cv.projects.map((x, i) => (
                  <article
                    key={x.id}
                    className="sticky grid gap-6 overflow-hidden rounded-[28px] border border-white/10 p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] @3xl:grid-cols-[1fr_1.15fr] @3xl:p-9"
                    style={{ top: `${(embedded ? 64 : 24) + i * 14}px`, background: `linear-gradient(135deg, ${mix(violet, '#000', 0.72)}, #0a0616 70%)` }}
                  >
                    <div className="flex flex-col justify-center">
                      <h3 className="font-display text-[clamp(1.6rem,4cqw,2.6rem)] leading-tight font-bold">{x.title}</h3>
                      <p className="mt-3 leading-relaxed text-[#d6d4e6]">{x.description}</p>
                      {x.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {x.tags.map((t) => (
                            <span key={t} className="rounded-full border border-[var(--c-glow)]/30 px-3 py-1 font-mono text-[11px] text-[var(--c-glow)]">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      {x.url && (
                        <a href={href(x.url)} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-fit items-center gap-1 rounded-full bg-[var(--c-violet)] px-4 py-2 text-sm font-medium text-white">
                          {L.projectLink} <ArrowUpRight className="size-4" />
                        </a>
                      )}
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40" aria-hidden>
                      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 font-mono text-[11px] text-white/60">
                        <span className="text-white/40">● ● ●</span>
                        <span className="truncate">{x.url || `${x.title.toLowerCase().replace(/\s+/g, '-')}.app`}</span>
                      </div>
                      <div className="grid aspect-[16/10] place-items-center p-6" style={{ background: `linear-gradient(160deg, ${mix(violet, '#ffffff', 0.86)}, ${mix(violet, '#ffd2c2', 0.7)})` }}>
                        <div className="text-center text-[#1d1230]">
                          <p className="font-display text-[clamp(1.4rem,4cqw,2.6rem)] font-bold">{x.title}</p>
                          <p className="mt-1 font-mono text-[10px] tracking-[0.3em] uppercase opacity-60">{x.tags[0] ?? L.projectSingular}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {cv.experience.length > 0 && (
            <Block id="experience" small="Trayectoria" big={L.experience}>
              <ol className="space-y-8">
                {cv.experience.map((e) => (
                  <li key={e.id} className="grid gap-2 border-l border-white/15 pl-6 @3xl:grid-cols-[180px_1fr] @3xl:border-0 @3xl:pl-0">
                    <p className="font-mono text-xs tracking-[0.1em] text-[var(--c-dim)] uppercase">{formatRange(e.startDate, e.endDate, e.current)}</p>
                    <div>
                      <p className="font-display text-xl font-bold">
                        {e.role} <span className="font-normal text-[var(--c-dim)]">· {e.company}</span>
                      </p>
                      {e.description && <p className="mt-1.5 leading-relaxed text-[#d6d4e6]">{e.description}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </Block>
          )}

          {cv.education.length > 0 && (
            <Block id="education" small="Estudios" big={L.education}>
              <ul className="space-y-6">
                {cv.education.map((e) => (
                  <li key={e.id} className="grid gap-1 @3xl:grid-cols-[180px_1fr]">
                    <p className="font-mono text-xs tracking-[0.1em] text-[var(--c-dim)] uppercase">{formatRange(e.startDate, e.endDate)}</p>
                    <div>
                      <p className="font-display text-xl font-bold">{e.degree}</p>
                      <p className="text-[var(--c-dim)]">{e.institution}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {cv.skills.length > 0 && (
            <Block id="skills" small="Lo que domino" big={L.skills}>
              <ul className="grid gap-5 @2xl:grid-cols-2">
                {cv.skills.map((s) => (
                  <li key={s.id}>
                    <div className="flex justify-between">
                      <span className="font-medium">{s.name}</span>
                      {cv.settings.skillsView.labels !== 'none' && <span className="font-mono text-sm text-[var(--c-dim)]">{s.level}%</span>}
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full" style={{ width: `${s.level}%`, background: `linear-gradient(90deg, var(--c-violet), var(--c-glow))` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          <Block id="contact" small="Hablemos" big="Contacto">
            <div className="grid gap-8 @4xl:grid-cols-[1fr_1.1fr]">
              <ul className="space-y-3">
                {p.email && (
                  <li>
                    <a href={`mailto:${p.email}`} className="inline-flex items-center gap-3 text-lg hover:text-[var(--c-glow)]">
                      <Mail className="size-5 text-[var(--c-glow)]" /> {p.email}
                    </a>
                  </li>
                )}
                {links.map(({ id, label, url, Icon }) => (
                  <li key={id}>
                    <a href={href(url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-lg hover:text-[var(--c-glow)]">
                      <Icon className="size-5 text-[var(--c-glow)]" /> {label}
                    </a>
                  </li>
                ))}
                {p.location && (
                  <li className="inline-flex items-center gap-3 text-lg text-[var(--c-dim)]">
                    <MapPin className="size-5 text-[var(--c-glow)]" /> {p.location}
                  </li>
                )}
              </ul>
              {cv.settings.contact.enabled && recipient && <ContactForm cv={cv} />}
            </div>
          </Block>

          <footer className="border-t border-white/10 px-5 py-8 text-sm text-[var(--c-dim)] @3xl:px-12">
            {p.fullName} · {p.headline}
          </footer>
        </div>
      </div>
    </div>
  )
}
