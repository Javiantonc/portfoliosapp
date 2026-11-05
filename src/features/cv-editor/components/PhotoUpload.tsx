'use client'
import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { fileToResizedDataUrl, initials } from '@/lib/utils'
import { isSupabaseConfigured, uploadAvatar } from '@/lib/supabase/client'
import { Button } from '@/components/ui'

export function PhotoUpload({ value, name, onChange }: { value: string; name: string; onChange: (v: string) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [drag, setDrag] = useState(false)

  async function handle(file?: File) {
    setError('')
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('Elige una imagen JPG, PNG o WebP.')
    if (file.size > 8 * 1024 * 1024) return setError('La imagen supera 8 MB. Elige una más ligera.')
    try {
      const remote = isSupabaseConfigured ? await uploadAvatar(file) : null
      onChange(remote ?? (await fileToResizedDataUrl(file)))
    } catch {
      setError('No se pudo subir la foto. Inténtalo de nuevo.')
    }
  }

  return (
    <div
      onDragOver={(e) => (e.preventDefault(), setDrag(true))}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => (e.preventDefault(), setDrag(false), handle(e.dataTransfer.files[0]))}
      className={`flex items-center gap-5 rounded-2xl border p-4 transition-colors ${drag ? 'border-violet bg-violet/5' : 'border-line bg-white'}`}
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-paper-2">
        {value ? (
          <img src={value} alt="Tu foto" className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center font-display text-2xl font-bold text-ink-soft">{initials(name) || '?'}</span>
        )}
      </div>
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm font-medium text-ink">Foto de perfil</p>
        <p className="text-xs text-ink-soft">Arrastra una imagen o elígela. Se recorta en cuadrado.</p>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => input.current?.click()}>
            <ImagePlus className="size-4" /> {value ? 'Cambiar foto' : 'Subir foto'}
          </Button>
          {value && (
            <Button size="sm" variant="ghost" onClick={() => onChange('')}>
              <X className="size-4" /> Quitar
            </Button>
          )}
        </div>
        {error && <p className="text-xs text-[#c23a52]" role="alert">{error}</p>}
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => handle(e.target.files?.[0])} />
    </div>
  )
}
