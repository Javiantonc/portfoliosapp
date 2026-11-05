'use client'
import { getSector } from '@/lib/sectors'
import { useCVStore } from '@/lib/store/cv-store'
import type { LabelOverrides } from '@/lib/schema/cv'
import { TextField } from '@/components/ui'

const fields: { key: keyof LabelOverrides; label: string }[] = [
  { key: 'skills', label: 'Habilidades' },
  { key: 'experience', label: 'Experiencia' },
  { key: 'education', label: 'Formación' },
  { key: 'projects', label: 'Proyectos' },
  { key: 'contact', label: 'Título de contacto' },
]

/** Nombres de los apartados adaptados a la profesión (también los propone la importación con IA). */
export function LabelsForm() {
  const sector = useCVStore((s) => s.cv.settings.sector)
  const labels = useCVStore((s) => s.cv.settings.labels)
  const setSettings = useCVStore((s) => s.setSettings)
  const base = getSector(sector).labels
  const custom = Object.values(labels).some((v) => v.trim())

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-ink">Nombres de los apartados</h3>
          <p className="mt-1 text-sm text-ink-soft">Llámalos como se dice en tu trabajo. Se usan en el CV, el portfolio y el editor.</p>
        </div>
        {custom && (
          <button onClick={() => setSettings({ labels: { skills: '', experience: '', education: '', projects: '', contact: '' } })} className="shrink-0 text-sm font-medium text-violet">
            Usar los del sector
          </button>
        )}
      </div>
      <div className="mt-4 grid gap-3 @md:grid-cols-2">
        {fields.map((f) => (
          <TextField
            key={f.key}
            label={f.label}
            placeholder={base[f.key]}
            maxLength={40}
            value={labels[f.key]}
            onChange={(e) => setSettings({ labels: { ...labels, [f.key]: e.target.value } })}
          />
        ))}
      </div>
    </div>
  )
}
