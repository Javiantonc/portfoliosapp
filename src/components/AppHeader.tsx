'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { AppLink, type View } from '@/lib/nav'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui'

const tabs: { to: View; label: ReactNode }[] = [
  { to: 'editor', label: 'Editor' },
  { to: 'cv', label: 'CV' },
  {
    to: 'portfolio',
    label: (
      <>
        Portfolio<span className="max-[379px]:hidden"> 3D</span>
      </>
    ),
  },
]

/** En móvil, las acciones de la cabecera se agrupan en un menú. */
function MobileActions({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', esc)
    return () => {
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('keydown', esc)
    }
  }, [open])
  return (
    <div ref={box} className="relative md:hidden">
      <button
        aria-label="Más opciones"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
      >
        <MoreHorizontal className="size-5" />
      </button>
      {open && (
        <div className="absolute top-12 right-0 z-40 flex min-w-52 flex-col items-stretch gap-1 rounded-2xl border border-line bg-white p-2 shadow-[0_20px_50px_-20px_rgb(21_23_58/0.4)] [&>*]:justify-start">
          {children}
        </div>
      )}
    </div>
  )
}

export function AppHeader({ current, actions, tone = 'light' }: { current: View; actions?: ReactNode; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark'
  return (
    <header
      className={cn(
        'relative z-30 flex h-16 shrink-0 items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6',
        dark ? 'stage bg-[color-mix(in_srgb,var(--st-bg,#121433)_60%,transparent)] text-[var(--st-text,#eceaff)] backdrop-blur-xl' : 'border-b border-line bg-paper/80 text-ink backdrop-blur-xl'
      )}
    >
      <AppLink to="home" aria-label="Inicio" className="shrink-0">
        <Logo compact />
      </AppLink>
      <nav aria-label="Secciones" className={cn('flex rounded-full p-1', dark ? 'bg-[color-mix(in_srgb,var(--st-text,#fff)_8%,transparent)]' : 'bg-ink/[0.05]')}>
        {tabs.map((t) => (
          <AppLink
            key={t.to}
            to={t.to}
            className={cn(
              'rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors sm:px-4 sm:py-1.5',
              current === t.to
                ? dark
                  ? 'bg-[var(--st-text,#ffffff)] text-[var(--st-bg,#121433)]'
                  : 'bg-white text-ink shadow-[0_1px_3px_rgb(21_23_58/0.12)]'
                : dark
                  ? 'text-[var(--st-mist,#a6a9d1)] hover:text-[var(--st-text,#ffffff)]'
                  : 'text-ink-soft hover:text-ink'
            )}
          >
            {t.label}
          </AppLink>
        ))}
      </nav>
      {actions ? (
        <>
          <div className="hidden shrink-0 items-center gap-2 md:flex">{actions}</div>
          <MobileActions>{actions}</MobileActions>
        </>
      ) : (
        <span className="w-10 md:hidden" aria-hidden />
      )}
    </header>
  )
}
