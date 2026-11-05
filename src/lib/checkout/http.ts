import { isProductId, type ProductId } from '@/lib/pricing'
import { CheckoutError, type CheckoutFn } from './types'

/** Crea la sesión de Stripe Checkout en el servidor y redirige a la página de pago. */
export const checkoutViaStripe: CheckoutFn = async (product) => {
  let res: Response
  try {
    res = await fetch('/api/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ product }) })
  } catch {
    throw new CheckoutError('failed', 'No hay conexión. Inténtalo de nuevo.')
  }
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
  if (res.status === 503) throw new CheckoutError('unavailable', data.error)
  if (!res.ok || !data.url) throw new CheckoutError('failed', data.error)
  window.location.assign(data.url)
}

/** Al volver de Stripe: comprueba el pago y devuelve el producto comprado. */
export async function verifyCheckout(sessionId: string): Promise<ProductId | null> {
  const res = await fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
  if (!res.ok) return null
  const data = (await res.json().catch(() => ({}))) as { product?: unknown }
  return isProductId(data.product) ? data.product : null
}
