import type { CSSProperties, ReactNode } from 'react'
import type { CV } from '@/lib/schema/cv'
import { getSector, resolveLayout, type SectorLabels } from '@/lib/sectors'
import { headingFonts, resolveStyle } from '@/lib/design'
import { formatRange, initials } from '@/lib/utils'

const SHEET: CSSProperties = { width: '210mm', minHeight: '297mm', fontSize: '10pt', lineHeight: 1.5 }
const sheetClass = 'cv-sheet cv-doc bg-white text-[#15173a] shadow-[0_30px_80px_-30px_rgb(21_23_58/0.35)]'

type Part = { data: CV; L: SectorLabels }

function H({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`mb-3 font-display text-[13px] font-bold text-[var(--cv-accent)] ${className}`}>{children}</h2>
}

function Photo({ data, size, className = '' }: { data: CV; size: string; className?: string }) {
  const p = data.personal
  return (
    <div className={`shrink-0 overflow-hidden rounded-full bg-[#e2e4f3] ${className}`} style={{ width: size, height: size }}>
      {p.photoUrl ? (
        <img src={p.photoUrl} alt="" className="size-full object-cover" />
      ) : (
        <span className="grid size-full place-items-center font-display text-[20pt] font-bold text-[#4b4f7c]">{initials(p.fullName) || '–'}</span>
      )}
    </div>
  )
}

function Experience({ data }: { data: CV }) {
  return (
    <div className="space-y-4">
      {data.experience.map((e) => (
        <div key={e.id} className="break-inside-avoid">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-display text-[11pt] font-semibold">{e.role}</p>
            <p className="shrink-0 text-[8.5pt] text-[#4b4f7c]">{formatRange(e.startDate, e.endDate, e.current)}</p>
          </div>
          <p className="text-[9pt] font-medium text-[var(--cv-accent)]">{e.company}</p>
          {e.description && <p className="mt-1 text-[9pt] text-[#2e3260]">{e.description}</p>}
        </div>
      ))}
    </div>
  )
}

function Projects({ data, cols = 2 }: { data: CV; cols?: 1 | 2 }) {
  return (
    <div className={`grid gap-x-6 gap-y-3.5 ${cols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {data.projects.map((pr) => (
        <div key={pr.id} className="break-inside-avoid">
          <p className="font-display text-[10pt] font-semibold">{pr.title}</p>
          <p className="text-[8.5pt] text-[#2e3260]">{pr.description}</p>
          {pr.tags.length > 0 && <p className="mt-0.5 text-[8pt] text-[#4b4f7c]">{pr.tags.join(', ')}</p>}
        </div>
      ))}
    </div>
  )
}

function Education({ data }: { data: CV }) {
  return (
    <div className="space-y-3">
      {data.education.map((e) => (
        <div key={e.id} className="flex items-baseline justify-between gap-4 break-inside-avoid">
          <div>
            <p className="font-display text-[10pt] font-semibold">{e.degree}</p>
            <p className="text-[9pt] text-[#4b4f7c]">{e.institution}</p>
          </div>
          <p className="shrink-0 text-[8.5pt] text-[#4b4f7c]">{formatRange(e.startDate, e.endDate)}</p>
        </div>
      ))}
    </div>
  )
}

function SkillBars({ data }: { data: CV }) {
  return (
    <ul className="space-y-2.5">
      {data.skills.map((s) => (
        <li key={s.id}>
          <div className="flex justify-between text-[9pt]">
            <span className="font-medium">{s.name}</span>
            <span className="text-[#4b4f7c] tabular-nums">{s.level}</span>
          </div>
          <div className="mt-1 h-[3px] rounded-full bg-[#dcdff0]">
            <div className="h-full rounded-full bg-[var(--cv-accent)]" style={{ width: `${s.level}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function SkillDots({ data }: { data: CV }) {
  return (
    <ul className="space-y-1.5">
      {data.skills.map((s) => {
        const n = Math.max(1, Math.round(s.level / 20))
        return (
          <li key={s.id} className="flex items-center justify-between gap-3 text-[9pt]">
            <span>{s.name}</span>
            <span className="flex shrink-0 gap-1" aria-label={`Nivel ${n} de 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`size-[6px] rounded-full ${i < n ? 'bg-[var(--cv-accent)]' : 'bg-[#dcdff0]'}`} />
              ))}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function Sidebar({ data, L }: Part) {
  const p = data.personal
  const contact = [p.email, p.phone, p.location].filter(Boolean)
  return (
    <>
      <aside className="flex w-[66mm] shrink-0 flex-col gap-7 bg-[color-mix(in_srgb,var(--cv-accent)_7%,#f3f4f8)] px-[9mm] py-[12mm]">
        <Photo data={data} size="34mm" />
        {contact.length > 0 && (
          <section>
            <H>Contacto</H>
            <ul className="space-y-1.5 text-[9pt] break-words text-[#4b4f7c]">
              {contact.map((c) => <li key={c}>{c}</li>)}
              {p.links.map((l) => (
                <li key={l.id}>
                  <span className="font-medium text-[#15173a]">{l.label}</span>
                  <br />
                  {l.url}
                </li>
              ))}
            </ul>
          </section>
        )}
        {data.skills.length > 0 && (
          <section>
            <H>{L.skills}</H>
            <SkillBars data={data} />
          </section>
        )}
      </aside>
      <div className="flex-1 px-[11mm] py-[12mm]">
        <header className="mb-8">
          <h1 className="font-display leading-[1.02] font-extrabold tracking-tight" style={{ fontSize: 'calc(28pt * var(--title-scale, 1))' }}>{p.fullName || 'Tu nombre'}</h1>
          {p.headline && <p className="mt-2 text-[12pt] text-[#4b4f7c]">{p.headline}</p>}
          {p.summary && <p className="mt-4 max-w-[118mm] text-[9.5pt] leading-[1.6] text-[#2e3260]">{p.summary}</p>}
        </header>
        {data.experience.length > 0 && (
          <section className="mb-7">
            <H>{L.experience}</H>
            <Experience data={data} />
          </section>
        )}
        {data.projects.length > 0 && (
          <section className="mb-7">
            <H>{L.projects}</H>
            <Projects data={data} />
          </section>
        )}
        {data.education.length > 0 && (
          <section>
            <H>{L.education}</H>
            <Education data={data} />
          </section>
        )}
      </div>
    </>
  )
}

function ClassicSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid grid-cols-[38mm_1fr] gap-6 border-t border-[#d9d6cf] py-5">
      <h2 className="font-display text-[11.5pt] font-semibold text-[var(--cv-accent)]">{title}</h2>
      <div>{children}</div>
    </section>
  )
}

function Classic({ data, L }: Part) {
  const p = data.personal
  const contact = [p.email, p.phone, p.location, ...p.links.map((l) => l.url)].filter(Boolean)
  return (
    <div className="flex-1 px-[18mm] py-[16mm]">
      <header className="mb-7 flex items-center gap-7">
        {p.photoUrl && <Photo data={data} size="26mm" />}
        <div>
          <h1 className="font-display leading-none font-semibold" style={{ fontSize: 'calc(30pt * var(--title-scale, 1))' }}>{p.fullName || 'Tu nombre'}</h1>
          {p.headline && <p className="mt-2 text-[12pt] text-[#4b4f7c] italic">{p.headline}</p>}
          {contact.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[8.5pt] text-[#4b4f7c]">
              {contact.map((c) => <li key={c}>{c}</li>)}
            </ul>
          )}
        </div>
      </header>
      {p.summary && (
        <ClassicSection title="Perfil">
          <p className="text-[9.5pt] leading-[1.65] text-[#2e3260]">{p.summary}</p>
        </ClassicSection>
      )}
      {data.experience.length > 0 && (
        <ClassicSection title={L.experience}>
          <Experience data={data} />
        </ClassicSection>
      )}
      {data.projects.length > 0 && (
        <ClassicSection title={L.projects}>
          <Projects data={data} cols={1} />
        </ClassicSection>
      )}
      {data.education.length > 0 && (
        <ClassicSection title={L.education}>
          <Education data={data} />
        </ClassicSection>
      )}
      {data.skills.length > 0 && (
        <ClassicSection title={L.skills}>
          <div className="columns-2 gap-8">
            <SkillDots data={data} />
          </div>
        </ClassicSection>
      )}
    </div>
  )
}

function Compact({ data, L }: Part) {
  const p = data.personal
  const contact = [p.email, p.phone, p.location].filter(Boolean)
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-7 bg-[var(--cv-accent)] px-[14mm] py-[11mm] text-white">
        <Photo data={data} size="30mm" className="ring-4 ring-white/30" />
        <div className="min-w-0">
          <h1 className="font-display leading-none font-extrabold tracking-tight" style={{ fontSize: 'calc(28pt * var(--title-scale, 1))' }}>{p.fullName || 'Tu nombre'}</h1>
          {p.headline && <p className="mt-2 text-[12pt] text-white/85">{p.headline}</p>}
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[8.5pt] text-white/80">
            {contact.map((c) => <li key={c}>{c}</li>)}
            {p.links.map((l) => <li key={l.id}>{l.url}</li>)}
          </ul>
        </div>
      </header>
      <div className="grid flex-1 grid-cols-[1fr_62mm] gap-[10mm] px-[14mm] py-[10mm]">
        <div>
          {p.summary && <p className="mb-7 text-[9.5pt] leading-[1.65] text-[#2e3260]">{p.summary}</p>}
          {data.experience.length > 0 && (
            <section className="mb-7">
              <H>{L.experience}</H>
              <Experience data={data} />
            </section>
          )}
          {data.projects.length > 0 && (
            <section>
              <H>{L.projects}</H>
              <Projects data={data} cols={1} />
            </section>
          )}
        </div>
        <div className="flex flex-col gap-7">
          {data.skills.length > 0 && (
            <section>
              <H>{L.skills}</H>
              <SkillDots data={data} />
            </section>
          )}
          {data.education.length > 0 && (
            <section>
              <H>{L.education}</H>
              <div className="space-y-3">
                {data.education.map((e) => (
                  <div key={e.id}>
                    <p className="font-display text-[9.5pt] font-semibold">{e.degree}</p>
                    <p className="text-[8.5pt] text-[#4b4f7c]">{e.institution}</p>
                    <p className="text-[8pt] text-[#4b4f7c]">{formatRange(e.startDate, e.endDate)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export function CVDocument({ data }: { data: CV }) {
  const sector = getSector(data.settings?.sector)
  const layout = resolveLayout(sector, data.settings?.cvLayout ?? 'auto')
  const st = resolveStyle(data)
  const L = sector.labels
  const heading = data.settings.headingFont === 'auto' && layout === 'classic' ? headingFonts.fraunces.family : st.headingFamily
  const z = st.textScale
  const style = {
    ...SHEET,
    fontFamily: st.bodyFamily,
    ['--cv-accent' as string]: st.cvAccent,
    ['--st-display' as string]: heading,
    ['--title-scale' as string]: st.titleScale,
  } as CSSProperties
  return (
    <article className={sheetClass} style={style}>
      <div className="flex" style={{ zoom: z, width: `calc(210mm / ${z})`, minHeight: `calc(297mm / ${z})` }}>
        {layout === 'classic' ? <Classic data={data} L={L} /> : layout === 'compact' ? <Compact data={data} L={L} /> : <Sidebar data={data} L={L} />}
      </div>
    </article>
  )
}
