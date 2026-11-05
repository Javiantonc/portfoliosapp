import { buildImportPrompt } from '@/lib/import/prompt'
import { ImportError, type ImportCvFn } from '@/lib/import/types'

type SampleJson = (input: string, opts: { images?: Blob[]; modelTier?: string }) => Promise<unknown>
type SampleFn = { json: SampleJson }

/** Vista previa publicada: analiza el CV con la capacidad `sample` (imágenes declaradas). */
export const importCvViaSample: ImportCvFn = async ({ text, images }) => {
  const sample = (window.claude ? await window.claude.use('sample') : null) as SampleFn | null
  if (!sample) throw new ImportError('unavailable')
  try {
    return await sample.json(buildImportPrompt(text), { images: images.slice(0, 3), modelTier: 'default' })
  } catch (e) {
    const code = (e as { code?: string }).code
    if (code === 'rate_limited') throw new ImportError('rate_limited')
    if (code && ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'images_unavailable'].includes(code)) throw new ImportError('unavailable')
    throw new ImportError('failed')
  }
}
