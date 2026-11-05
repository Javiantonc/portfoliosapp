import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

/**
 * Webhook de Stripe: registra cada compra en la tabla `purchases` de Supabase
 * (migración supabase/migrations/0002_purchases.sql).
 * Variables: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 */
export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!key || !secret) return new Response('Webhook no configurado', { status: 503 })

  const stripe = new Stripe(key)
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(await req.text(), req.headers.get('stripe-signature') ?? '', secret)
  } catch {
    return new Response('Firma no válida', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object as Stripe.Checkout.Session
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (url && service && s.payment_status === 'paid') {
      const sb = createClient(url, service, { auth: { persistSession: false } })
      await sb.from('purchases').upsert(
        {
          session_id: s.id,
          email: s.customer_details?.email ?? null,
          product: s.metadata?.product ?? null,
          amount: s.amount_total,
          currency: s.currency,
        },
        { onConflict: 'session_id' }
      )
    }
  }
  return new Response('ok')
}
