import type { ReactNode } from 'react'
import { Check, Globe, Mail, MapPin, Phone } from 'lucide-react'
import type { CV } from '@/lib/schema/cv'
import type { SectorLabels } from '@/lib/sectors'
import { formatMonth, formatRange, initials } from '@/lib/utils'

type Part = { data: CV; L: SectorLabels }

const sentences = (t: string) =>
  t
    .split(/(?<=[.;])\s+/)
    .map((s) => s.trim().replace(/[.;]$/, ''))
    .filter(Boolean)

const levelWord = (n: number) => (n >= 85 ? 'Experto' : n >= 65 ? 'Avanzado' : n >= 40 ? 'Intermedio' : 'Básico')

function splitName(full: string) {
  const parts = (full || 'Tu nombre').trim().split(/\s+/)
  if (parts.length === 1) return [parts[0], '']
  return [parts[0], parts.slice(1).join(' ')]
}

function PhotoBox({ data, className, round = false }: { data: CV; className: string; round?: boolean }) {
  const p = data.personal
  return (
    <div className={`overflow-hidden ${round ? 'rounded-full' : ''} ${className}`}>
      {p.photoUrl ? (
        <img src={p.photoUrl} alt="" className="size-full object-cover" />
      ) : (
        <span className="grid size-full place-items-center font-display text-[30pt] font-extrabold text-white/80">{initials(p.fullName) || '–'}</span>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* EDITORIAL — banda de color, foto grande y bloques destacados        */
/* ------------------------------------------------------------------ */

function EdH({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 w-[85%] border-b-[1.5px] border-[var(--cv-accent)] pb-1 font-display text-[10.5pt] font-extrabold tracking-wide text-[var(--cv-accent)] uppercase">
      {children}
    </h2>
  )
}

export function Editorial({ data, L }: Part) {
  const p = data.personal
  const [first, rest] = splitName(p.fullName)
  const showPhoto = data.settings.photo?.cv !== false
  const contact = [
    p.location && { icon: MapPin, text: p.location },
    p.phone && { icon: Phone, text: p.phone },
    p.email && { icon: Mail, text: p.email },
    ...p.links.map((l) => ({ icon: Globe, text: l.url })),
  ].filter(Boolean) as { icon: typeof Mail; text: string }[]
  const tint = 'color-mix(in srgb, var(--cv-accent) 22%, white)'

  return (
    <div className="relative flex-1 text-[#1f2420]">
      {/* Cabecera */}
      <div className="flex gap-[6mm] px-[7mm] pt-[7mm]">
        <div className="w-[64mm] shrink-0">
          {showPhoto && (
            <PhotoBox data={data} className="h-[78mm] w-full rounded-[8mm] bg-[color-mix(in_srgb,var(--cv-accent)_80%,black)] shadow-[0_8px_24px_-12px_rgb(0_0_0/0.35)]" />
          )}
          <ul className={`space-y-[1.4mm] text-[8.6pt] ${showPhoto ? 'mt-[4mm]' : ''}`}>
            {contact.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-[2mm] break-all">
                <Icon className="size-[3.6mm] shrink-0 text-[var(--cv-accent)]" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex min-h-[78mm] flex-1 flex-col justify-center rounded-[9mm] bg-[var(--cv-accent)] px-[10mm] py-[10mm] text-white">
          <h1 className="font-display leading-[0.9] font-extrabold tracking-tight uppercase" style={{ fontSize: 'calc(38pt * var(--title-scale, 1))' }}>
            {first}
            {rest && (
              <>
                <br />
                {rest}
              </>
            )}
          </h1>
          {p.headline && (
            <p className="mt-[6mm] self-start rounded-full border border-white/80 px-[5mm] py-[1.6mm] text-[8.6pt] tracking-wide uppercase">{p.headline}</p>
          )}
          {p.summary && <p className="mt-[5mm] text-[8.6pt] leading-[1.5] font-semibold text-white/95">{sentences(p.summary).slice(0, 2).join('. ')}.</p>}
        </div>
      </div>

      {/* Cuerpo */}
      <div className="grid grid-cols-[64mm_1fr] gap-[8mm] px-[7mm] pt-[8mm] pb-[10mm]">
        <aside className="space-y-[7mm]">
          {data.skills.length > 0 && (
            <section>
              <EdH>{L.skills}</EdH>
              <ul className="space-y-[1.3mm] text-[9pt]">
                {data.skills.map((s) => (
                  <li key={s.id} className="flex items-center gap-[2mm]">
                    <span className="size-[2.4mm] shrink-0 rounded-full bg-[var(--cv-accent)]" />
                    {s.name}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {data.skills.length > 2 && (
            <section>
              <EdH>Competencias</EdH>
              <div className="grid grid-cols-3 border border-[color-mix(in_srgb,var(--cv-accent)_45%,white)] text-center text-[7.6pt] font-bold">
                {data.skills.slice(0, 6).map((s) => (
                  <div key={s.id} className="grid min-h-[11mm] place-items-center border border-[color-mix(in_srgb,var(--cv-accent)_30%,white)] px-[1mm] leading-tight">
                    {s.name}
                  </div>
                ))}
              </div>
            </section>
          )}
          {data.education.length > 0 && (
            <section>
              <EdH>{L.education}</EdH>
              <div className="space-y-[3mm]">
                {data.education.map((e) => (
                  <div key={e.id}>
                    <p className="font-display text-[9pt] font-extrabold uppercase">{e.institution}</p>
                    <p className="text-[8.6pt]">{e.degree}</p>
                    <p className="text-[7.6pt] tracking-wide text-[#6c7363] uppercase">{formatRange(e.startDate, e.endDate)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>

        <main className="space-y-[6mm]">
          {p.summary && (
            <section>
              <EdH>Perfil profesional</EdH>
              <p className="text-justify text-[9pt] leading-[1.55]">{p.summary}</p>
            </section>
          )}
          {data.experience.length > 0 && (
            <section>
              <EdH>{L.experience}</EdH>
              <div className="space-y-[5mm]">
                {data.experience.map((e) => (
                  <div key={e.id} className="break-inside-avoid">
                    <p className="font-display text-[11pt] leading-tight font-extrabold uppercase">{e.company}</p>
                    <p className="text-[8pt] tracking-wide text-[#6c7363] uppercase">
                      {e.role}
                      {formatRange(e.startDate, e.endDate, e.current) && ` · ${formatRange(e.startDate, e.endDate, e.current)}`}
                    </p>
                    {e.description && (
                      <ul className="mt-[1.6mm] space-y-[0.8mm] text-[8.8pt]">
                        {sentences(e.description).map((s) => (
                          <li key={s} className="flex gap-[1.6mm]">
                            <Check className="mt-[0.6mm] size-[3.4mm] shrink-0 text-[var(--cv-accent)]" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {data.projects.length > 0 && (
            <section className="break-inside-avoid rounded-[4mm] p-[5mm]" style={{ background: tint }}>
              <h2 className="mb-[2mm] font-display text-[12pt] font-extrabold text-white uppercase" style={{ textShadow: '0 1px 0 rgb(0 0 0 / 0.08)', color: 'var(--cv-accent)' }}>
                {L.projects}
              </h2>
              <div className="space-y-[2.4mm]">
                {data.projects.map((x) => (
                  <div key={x.id}>
                    <p className="text-[8.8pt] font-bold">{x.title}</p>
                    <p className="text-[8pt] leading-snug text-[#2c3328]">{x.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* IMPACTO — nombre gigante a dos colores, forma orgánica y foto       */
/* ------------------------------------------------------------------ */

function ImH({ children, right = false }: { children: ReactNode; right?: boolean }) {
  return <h2 className={`mb-[3mm] font-display text-[13pt] font-extrabold tracking-[0.06em] text-[var(--cv-accent)] uppercase ${right ? 'text-right' : ''}`}>{children}</h2>
}

function Dates({ start, end, current }: { start: string; end: string; current?: boolean }) {
  const a = formatMonth(start)
  const b = current ? 'Actualidad' : formatMonth(end)
  if (!a && !b) return null
  return (
    <p className="shrink-0 text-right font-display text-[8.6pt] leading-tight font-extrabold uppercase">
      {a}
      {b && (
        <>
          <br />/{b}
        </>
      )}
    </p>
  )
}

export function Impact({ data, L }: Part) {
  const p = data.personal
  const [first, rest] = splitName(p.fullName)
  const showPhoto = data.settings.photo?.cv !== false
  const contact = [p.phone, p.email, ...p.links.map((l) => l.url), p.location].filter(Boolean)

  return (
    <div className="relative flex-1 overflow-hidden text-[#2b2724]">
      <svg viewBox="0 0 400 420" className="absolute top-0 left-0 w-[118mm]" aria-hidden>
        <path
          d="M0 0h330c40 40 30 95-10 130-45 40-120 20-150 75-25 45 10 105-30 150C110 390 50 410 0 420Z"
          fill="color-mix(in srgb, var(--cv-accent) 20%, white)"
        />
      </svg>

      <header className="relative px-[12mm] pt-[12mm]">
        <div className="flex items-start justify-end gap-[6mm]">
          <ul className="mt-[3mm] space-y-[0.6mm] text-right text-[8.6pt]">
            {contact.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          {showPhoto && (
            <div className="rounded-full p-[2.4mm]" style={{ background: 'color-mix(in srgb, var(--cv-accent) 22%, white)' }}>
              <PhotoBox data={data} round className="size-[50mm] bg-[var(--cv-accent)]" />
            </div>
          )}
        </div>
        <h1
          className={`font-display leading-[0.86] font-extrabold tracking-[-0.02em] uppercase ${showPhoto ? '-mt-[30mm]' : 'mt-[2mm]'}`}
          style={{ fontSize: 'calc(50pt * var(--title-scale, 1))' }}
        >
          <span className="block text-[#2b2724]">{first}</span>
          {rest && <span className="block text-[var(--cv-accent)]">{rest}</span>}
        </h1>
        {p.headline && <p className="mt-[6mm] font-display text-[9.5pt] font-extrabold tracking-[0.32em] text-[var(--cv-accent)] uppercase">{p.headline}</p>}
        <div className="mt-[4mm] h-px bg-[color-mix(in_srgb,var(--cv-accent)_30%,white)]" />
      </header>

      <div className="relative grid grid-cols-[62mm_1fr] gap-[10mm] px-[12mm] pt-[7mm] pb-[10mm]">
        <aside className="space-y-[7mm]">
          {p.summary && (
            <section>
              <ImH>Perfil</ImH>
              <div className="space-y-[2mm] text-[9pt] leading-[1.55] text-[#55504b]">
                {sentences(p.summary)
                  .reduce<string[]>((acc, s, i) => {
                    if (i % 2 === 0) acc.push(s + '.')
                    else acc[acc.length - 1] += ' ' + s + '.'
                    return acc
                  }, [])
                  .map((t) => (
                    <p key={t}>{t}</p>
                  ))}
              </div>
            </section>
          )}
          {data.skills.length > 0 && (
            <section>
              <ImH>{L.skills}</ImH>
              <div className="space-y-[2.2mm]">
                {data.skills.map((s) => (
                  <div key={s.id}>
                    <p className="font-display text-[9pt] font-extrabold">{s.name}</p>
                    <p className="text-[8pt] text-[#8b857e]">{levelWord(s.level)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>

        <main className="space-y-[7mm]">
          {data.experience.length > 0 && (
            <section>
              <ImH right>{L.experience}</ImH>
              <div className="space-y-[5mm]">
                {data.experience.map((e) => (
                  <div key={e.id} className="break-inside-avoid">
                    <div className="flex items-start justify-between gap-[4mm]">
                      <div>
                        <p className="font-display text-[11pt] leading-tight font-extrabold uppercase">{e.company}</p>
                        <p className="mt-[0.8mm] font-display text-[8.4pt] font-extrabold tracking-[0.08em] text-[var(--cv-accent)] uppercase">[{e.role}]</p>
                      </div>
                      <Dates start={e.startDate} end={e.endDate} current={e.current} />
                    </div>
                    {e.description && (
                      <ul className="mt-[2mm] space-y-[1mm] text-[8.8pt] text-[#55504b]">
                        {sentences(e.description).map((s) => (
                          <li key={s} className="flex gap-[2mm]">
                            <span className="mt-[1.8mm] size-[1.6mm] shrink-0 rounded-full bg-[var(--cv-accent)]" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {data.education.length > 0 && (
            <section>
              <ImH right>{L.education}</ImH>
              <div className="space-y-[4mm]">
                {data.education.map((e) => (
                  <div key={e.id} className="flex items-start justify-between gap-[4mm]">
                    <div>
                      <p className="font-display text-[10.5pt] leading-tight font-extrabold uppercase">{e.institution}</p>
                      <p className="mt-[0.8mm] font-display text-[8.4pt] font-extrabold tracking-[0.08em] text-[var(--cv-accent)] uppercase">[{e.degree}]</p>
                    </div>
                    <Dates start={e.startDate} end={e.endDate} />
                  </div>
                ))}
              </div>
            </section>
          )}
          {data.projects.length > 0 && (
            <section>
              <ImH right>{L.projects}</ImH>
              <div className="space-y-[3mm]">
                {data.projects.map((x) => (
                  <div key={x.id}>
                    <p className="font-display text-[10pt] font-extrabold uppercase">{x.title}</p>
                    <p className="text-[8.6pt] text-[#55504b]">{x.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
