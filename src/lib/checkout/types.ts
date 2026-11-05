import type { ProductId } from '@/lib/pricing'

export class CheckoutError extends Error {
  constructor(
    public code: 'unavailable' | 'failed',
    message: string = code
  ) {
    super(message)
  }
}

/** Inicia el pago de un producto (redirige a la pasarela). */
export type CheckoutFn = (product: ProductId) => Promise<void>
