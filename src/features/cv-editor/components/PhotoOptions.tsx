'use client'
import { PHOTO_PORTFOLIO, PHOTO_SHAPES } from '@/lib/schema/cv'
import { useCVStore } from '@/lib/store/cv-store'
import { Pills, Toggle } from './EffectsForm'

const shapeLabels: Record<(typeof PHOTO_SHAPES)[number], string> = { circle: 'Redonda', rounded: 'Redondeada', square: 'Cuadrada' }
const portfolioLabels: Record<(typeof PHOTO_PORTFOLIO)[number], string> = { frame: 'Marco 3D', avatar: 'Avatar pequeño', none: 'No mostrar' }

export function PhotoOptions() {
  const ph = useCVStore((s) => s.cv.settings.photo)
  const hasPhoto = useCVStore((s) => !!s.cv.personal.photoUrl)
  const setPhoto = useCVStore((s) => s.setPhoto)

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white/60 p-4">
      <p className="text-sm font-semibold text-ink">Dónde aparece tu foto</p>
      <div className="flex flex-col gap-3">
        <Toggle label="En el CV" hint="Junto a tu nombre, en la hoja que descargas en PDF." checked={ph.cv} onChange={(cv) => setPhoto({ cv })} />
        {ph.cv && <Pills label="Forma de la foto en el CV" options={PHOTO_SHAPES} value={ph.cvShape} labels={shapeLabels} onChange={(cvShape) => setPhoto({ cvShape })} />}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-ink">En el portfolio</p>
        <Pills label="Foto en el portfolio" options={PHOTO_PORTFOLIO} value={ph.portfolio} labels={portfolioLabels} onChange={(portfolio) => setPhoto({ portfolio })} />
        <p className="text-xs text-ink-soft">
          {ph.portfolio === 'frame'
            ? hasPhoto
              ? 'Tu foto flota en un marco 3D junto a tu nombre.'
              : 'Sube una foto para verla en un marco 3D junto a tu nombre.'
            : ph.portfolio === 'avatar'
              ? 'Un círculo pequeño junto a tu titular.'
              : 'Tu portfolio se mostrará sin foto.'}
        </p>
      </div>
    </div>
  )
}
