'use client'
import { Download, PenLine } from 'lucide-react'
import { useCVStore } from '@/lib/store/cv-store'
import { AppLink, useAppEnv } from '@/lib/nav'
import { Button, buttonClass } from '@/components/ui'
import { AppHeader } from '@/components/AppHeader'
import { CVDocument } from './CVDocument'
import { useResolvedStyle } from '@/lib/use-style'
import { isPremiumLayout, PremiumBadge, usePremium } from '@/features/premium/premium'
import { ScaledSheet } from './ScaledSheet'

export function CVView() {
  const cv = useCVStore((s) => s.cv)
  const { isPreview } = useAppEnv()
  useResolvedStyle(cv)
  const { canCv, openUpgrade } = usePremium()
  const locked = isPremiumLayout(cv) && !canCv

  return (
    <div className="flex min-h-dvh flex-col bg-paper-2">
      <AppHeader current="cv" />
      <div className="mx-auto flex w-full max-w-[900px] flex-wrap items-center justify-between gap-3 px-6 pt-8">
        <div>
          <h1 className="flex items-center gap-2 font-display text-3xl font-bold">
            Tu CV {isPremiumLayout(cv) && <PremiumBadge />}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {isPreview ? 'En la app instalada este botón genera el PDF en tamaño A4.' : 'Elige «Guardar como PDF» en el diálogo de impresión.'}
          </p>
        </div>
        <div className="flex gap-2">
          <AppLink to="editor" className={buttonClass('secondary')}>
            <PenLine className="size-4" /> Editar
          </AppLink>
          <Button onClick={() => (locked ? openUpgrade() : window.print())}>
            <Download className="size-4" /> {locked ? 'Descargar con Premium' : 'Descargar PDF'}
          </Button>
        </div>
      </div>
      <ScaledSheet padding={24}>
        <CVDocument data={cv} />
      </ScaledSheet>
    </div>
  )
}
