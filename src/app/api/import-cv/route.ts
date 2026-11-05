import Anthropic from '@anthropic-ai/sdk'
import { buildImportPrompt } from '@/lib/import/prompt'
import { parseJsonLoose } from '@/lib/import/normalize'

const MODEL = process.env.IMPORT_MODEL || 'claude-sonnet-5-5'
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
type ImgType = (typeof TYPES)[number]

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return Response.json({ error: 'La lectura de CV no está configurada en el servidor (falta ANTHROPIC_API_KEY).' }, { status: 503 })

  const body = (await req.json().catch(() => null)) as { text?: unknown; images?: unknown } | null
  const text = typeof body?.text === 'string' ? body.text.slice(0, 40000) : ''
  const images = (Array.isArray(body?.images) ? body.images : [])
    .filter((i): i is { data: string; mediaType: ImgType } => !!i && typeof i.data === 'string' && TYPES.includes(i.mediaType))
    .slice(0, 3)
  if (!text.trim() && images.length === 0) return Response.json({ error: 'El archivo está vacío.' }, { status: 400 })

  const client = new Anthropic({ apiKey })
  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: [
            ...images.map((i) => ({ type: 'image' as const, source: { type: 'base64' as const, media_type: i.mediaType, data: i.data } })),
            { type: 'text' as const, text: buildImportPrompt(text) },
          ],
        },
      ],
    })
    const out = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
    return Response.json({ cv: parseJsonLoose(out) })
  } catch (e) {
    const status = (e as { status?: number }).status
    if (status === 429) return Response.json({ error: 'Hay muchas peticiones ahora mismo. Inténtalo en un minuto.' }, { status: 429 })
    return Response.json({ error: 'No se pudo analizar el CV. Inténtalo de nuevo.' }, { status: 502 })
  }
}
