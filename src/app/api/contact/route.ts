import { createClient } from '@supabase/supabase-js'
import { contactMessageSchema, type CV } from '@/lib/schema/cv'

/**
 * Formulario de contacto de los portfolios.
 * Reenvía el mensaje al correo de la persona usando Resend (https://resend.com).
 *
 * Variables de entorno:
 *   RESEND_API_KEY   clave de Resend
 *   CONTACT_FROM     remitente verificado, p. ej. "Relieve <portfolio@tudominio.com>"
 *   CONTACT_ALLOW_CLIENT_RECIPIENT=true  solo en desarrollo: acepta el destinatario que envía el navegador
 * Con Supabase configurado, el destinatario se busca en el portfolio publicado (slug),
 * así nadie puede usar este endpoint para enviar correos a direcciones arbitrarias.
 */

const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

function limited(ip: string) {
  const now = Date.now()
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  list.push(now)
  hits.set(ip, list)
  return list.length > MAX_PER_WINDOW
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
const isEmail = (s: unknown): s is string => typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

async function recipientFromSlug(slug: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const sb = createClient(url, key, { auth: { persistSession: false } })
  const { data } = await sb.from('portfolios').select('published, resumes(data)').eq('slug', slug).maybeSingle()
  const row = data as { published?: boolean; resumes?: { data?: CV } | { data?: CV }[] } | null
  if (!row?.published) return null
  const resume = Array.isArray(row.resumes) ? row.resumes[0] : row.resumes
  const cv = resume?.data
  if (!cv || cv.settings?.contact?.enabled === false) return null
  const to = cv.settings?.contact?.recipient || cv.personal?.email
  return { to: isEmail(to) ? to : null, owner: cv.personal?.fullName ?? '' }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return Response.json({ error: 'Petición no válida' }, { status: 400 })

  // Bots: el campo trampa viene relleno. Respondemos "ok" sin enviar nada.
  if (typeof body.website === 'string' && body.website.trim() !== '') return Response.json({ ok: true })

  const parsed = contactMessageSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? 'Datos no válidos' }, { status: 400 })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (limited(ip)) return Response.json({ error: 'Demasiados mensajes. Inténtalo más tarde.' }, { status: 429 })

  let to: string | null = null
  let owner = ''
  if (typeof body.slug === 'string' && body.slug) {
    const r = await recipientFromSlug(body.slug)
    to = r?.to ?? null
    owner = r?.owner ?? ''
  } else if (process.env.CONTACT_ALLOW_CLIENT_RECIPIENT === 'true' && isEmail(body.to)) {
    to = body.to
  }
  if (!to) return Response.json({ error: 'Este portfolio no tiene un correo de contacto configurado.' }, { status: 400 })

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM
  if (!apiKey || !from) return Response.json({ error: 'El envío de correos no está configurado en el servidor.' }, { status: 503 })

  const { name, email, message } = parsed.data
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `Nuevo mensaje de ${name} desde tu portfolio`,
      text: `${owner ? `Hola, ${owner}:\n\n` : ''}${name} (${email}) te ha escrito desde tu portfolio de Relieve:\n\n${message}\n\nResponde a este correo para contestar directamente a ${name}.`,
      html: `<p>${owner ? `Hola, ${esc(owner)}:` : 'Hola:'}</p><p><strong>${esc(name)}</strong> (${esc(email)}) te ha escrito desde tu portfolio de Relieve:</p><blockquote style="border-left:3px solid #5d49ff;margin:0;padding:8px 14px;color:#2e3260">${esc(message).replace(/\n/g, '<br>')}</blockquote><p style="color:#6b6f96">Responde a este correo para contestar directamente a ${esc(name)}.</p>`,
    }),
  })
  if (!res.ok) return Response.json({ error: 'No se pudo enviar el mensaje.' }, { status: 502 })
  return Response.json({ ok: true })
}
