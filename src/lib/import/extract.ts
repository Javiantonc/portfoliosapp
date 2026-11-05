'use client'
import { ImportError } from './types'

export type Extracted = { text: string; images: Blob[]; kind: 'pdf' | 'docx' | 'image' | 'text' }

const MAX_BYTES = 10 * 1024 * 1024
const MAX_PAGES = 6

async function blobFromCanvas(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('canvas'))), 'image/jpeg', 0.85))
}

/** Reduce una imagen a un tamaño razonable para enviarla a la IA. */
export async function downscaleImage(file: Blob, max = 1600): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image()
      i.onload = () => res(i)
      i.onerror = () => rej(new ImportError('unsupported', 'No se pudo abrir la imagen. Prueba con JPG o PNG.'))
      i.src = url
    })
    const k = Math.min(1, max / Math.max(img.width, img.height))
    const c = document.createElement('canvas')
    c.width = Math.round(img.width * k)
    c.height = Math.round(img.height * k)
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
    return await blobFromCanvas(c)
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function extractPdf(file: File, workerBase: string): Promise<Extracted> {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.js', new URL(workerBase, document.baseURI)).href
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  const pages = Math.min(doc.numPages, MAX_PAGES)
  let text = ''
  for (let i = 1; i <= pages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    for (const item of content.items as { str?: string; hasEOL?: boolean }[]) {
      if (typeof item.str !== 'string') continue
      text += item.str + (item.hasEOL ? '\n' : ' ')
    }
    text += '\n\n'
  }
  // PDF escaneado (sin texto): enviamos las primeras páginas como imágenes
  if (text.replace(/\s/g, '').length < 150) {
    const images: Blob[] = []
    for (let i = 1; i <= Math.min(pages, 2); i++) {
      const page = await doc.getPage(i)
      const viewport = page.getViewport({ scale: 1.6 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvas, viewport }).promise
      images.push(await blobFromCanvas(canvas))
    }
    return { text: '', images, kind: 'pdf' }
  }
  return { text, images: [], kind: 'pdf' }
}

async function extractDocx(file: File): Promise<Extracted> {
  const mod = (await import('mammoth/mammoth.browser')) as unknown as {
    default?: { extractRawText: (o: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> }
    extractRawText?: (o: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>
  }
  const extract = mod.extractRawText ?? mod.default?.extractRawText
  if (!extract) throw new ImportError('failed', 'No se pudo leer el documento de Word.')
  const { value } = await extract({ arrayBuffer: await file.arrayBuffer() })
  return { text: value, images: [], kind: 'docx' }
}

/** Lee el CV en el navegador: texto de PDF/Word/TXT o imágenes para CV escaneados o fotos. */
export async function extractCv(file: File, workerBase = '/'): Promise<Extracted> {
  if (file.size > MAX_BYTES) throw new ImportError('unsupported', 'El archivo supera 10 MB. Prueba con una versión más ligera.')
  const name = file.name.toLowerCase()
  const type = file.type

  let out: Extracted
  if (type === 'application/pdf' || name.endsWith('.pdf')) out = await extractPdf(file, workerBase)
  else if (name.endsWith('.docx') || type.includes('wordprocessingml')) out = await extractDocx(file)
  else if (name.endsWith('.doc')) throw new ImportError('unsupported', 'El formato .doc antiguo no se puede leer. Guárdalo como .docx o PDF.')
  else if (type.startsWith('image/')) {
    if (/heic|heif/.test(type) || /\.(heic|heif)$/.test(name)) throw new ImportError('unsupported', 'Las fotos HEIC no se pueden leer. Haz una captura o expórtala como JPG.')
    out = { text: '', images: [await downscaleImage(file)], kind: 'image' }
  } else if (type.startsWith('text/') || /\.(txt|md)$/.test(name)) out = { text: await file.text(), images: [], kind: 'text' }
  else throw new ImportError('unsupported', 'Formato no compatible. Sube un PDF, un Word (.docx), una imagen o un texto.')

  if (!out.text.trim() && out.images.length === 0) throw new ImportError('empty', 'No hemos encontrado texto en el archivo.')
  return { ...out, text: out.text.slice(0, 40000) }
}
