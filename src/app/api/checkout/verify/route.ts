import Stripe from 'stripe'
import { isProductId } from '@/lib/pricing'

/** Comprueba en Stripe que la sesión está pagada y devuelve el producto. */
export async function GET(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return Response.json({ error: 'Pagos no configurados.' }, { status: 503 })
  const id = new URL(req.url).searchParams.get('session_id')
  if (!id || !id.startsWith('cs_')) return Response.json({ error: 'Sesión no válida.' }, { status: 400 })
  try {
    const session = await new Stripe(key).checkout.sessions.retrieve(id)
    const product = session.metadata?.product
    if (session.payment_status !== 'paid' || !isProductId(product)) return Response.json({ error: 'Pago no completado.' }, { status: 402 })
    return Response.json({ product })
  } catch {
    return Response.json({ error: 'No se pudo comprobar el pago.' }, { status: 502 })
  }
}
