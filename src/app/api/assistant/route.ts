import Anthropic from '@anthropic-ai/sdk'
import { RELIEVE_ASSISTANT_PROMPT, trimTurns, type ChatTurn } from '@/lib/assistant/prompt'

const MODEL = process.env.ASSISTANT_MODEL || 'claude-haiku-5-5'
const MAX_CHARS = 2000

function parseTurns(body: unknown): ChatTurn[] | null {
  const raw = (body as { messages?: unknown })?.messages
  if (!Array.isArray(raw)) return null
  const turns = raw
    .filter((m): m is ChatTurn => !!m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim() !== '')
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }))
  const t = trimTurns(turns)
  return t.length && t[t.length - 1].role === 'user' ? t : null
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return Response.json({ error: 'Falta ANTHROPIC_API_KEY en el servidor' }, { status: 503 })

  const turns = parseTurns(await req.json().catch(() => null))
  if (!turns) return Response.json({ error: 'Conversación no válida' }, { status: 400 })

  const client = new Anthropic({ apiKey })
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 700,
    system: RELIEVE_ASSISTANT_PROMPT,
    messages: turns,
  })

  const enc = new TextEncoder()
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on('text', (delta) => controller.enqueue(enc.encode(delta)))
      stream
        .finalMessage()
        .then(() => controller.close())
        .catch((err) => controller.error(err))
    },
    cancel() {
      stream.abort()
    },
  })

  req.signal.addEventListener('abort', () => stream.abort())

  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } })
}
