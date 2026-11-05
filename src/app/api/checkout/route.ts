import Stripe from 'stripe'
import { isProductId, PRODUCTS } from '@/lib/pricing'

/**
 * Crea una sesión de Stripe Checkout (pago único en euros).
 * Variables: STRIPE_SECRET_KEY y, opcionalmente, NEXT_PUBLIC_SITE_URL (si no, se usa el origen de la petición).
 */
export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return Response.json({ error: 'Los pagos todavía no están configurados (falta STRIPE_SECRET_KEY).' }, { status: 503 })

  const body = (await req.json().catch(() => null)) as { product?: unknown } | null
  if (!isProductId(body?.product)) return Response.json({ error: 'Producto no válido.' }, { status: 400 })
  const product = PRODUCTS[body.product]

  const origin = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get('origin') || new URL(req.url).origin
  const stripe = new Stripe(key)
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: product.amount,
            product_data: { name: `Relieve · ${product.name}`, description: product.includes.join(' · ') },
          },
        },
      ],
      metadata: { product: product.id },
      success_url: `${origin}/editor?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/editor?checkout=cancel`,
    })
    return Response.json({ url: session.url })
  } catch {
    return Response.json({ error: 'No se pudo iniciar el pago. Inténtalo de nuevo.' }, { status: 502 })
  }
}
