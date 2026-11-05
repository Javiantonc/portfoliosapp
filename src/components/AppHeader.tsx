'use client'
import type { ReactNode } from 'react'
import { AppLink, type View } from '@/lib/nav'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui'

const tabs: { to: View; label: string }[] = [
  { to: 'editor', label: 'Editor' },
  { to: 'cv', label: 'CV' },
  { to: 'portfolio', label: 'Portfolio 3D' },
]

export function AppHeader({ current, actions, tone = 'light' }: { current: View; actions?: ReactNode; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark'
  return (
    <header
      className={cn(
        'relative z-30 flex h-16 shrink-0 items-center justify-between gap-4 px-4 sm:px-6',
        dark ? 'stage bg-[color-mix(in_srgb,var(--st-bg,#121433)_60%,transparent)] text-[var(--st-text,#eceaff)] backdrop-blur-xl' : 'border-b border-line bg-paper/80 text-ink backdrop-blur-xl'
      )}
    >
      <AppLink to="home" aria-label="Inicio" className="shrink-0">
        <Logo />
      </AppLink>
      <nav aria-label="Secciones" className={cn('flex rounded-full p-1', dark ? 'bg-[color-mix(in_srgb,var(--st-text,#fff)_8%,transparent)]' : 'bg-ink/[0.05]')}>
        {tabs.map((t) => (
          <AppLink
            key={t.to}
            to={t.to}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors sm:px-4',
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
      <div className="hidden shrink-0 items-center gap-2 md:flex">{actions}</div>
    </header>
  )
}
