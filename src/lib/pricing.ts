/** Productos de pago (pago único). Los importes están en céntimos de euro. */
export const PRODUCTS = {
  bundle: {
    id: 'bundle',
    name: 'CV + Portfolio Premium',
    amount: 199,
    price: '1,99 €',
    includes: ['CV Editorial e Impacto, con descarga en PDF', 'Portfolios Cine y Cosmos', 'Todas las mejoras Premium futuras de estas plantillas'],
  },
  portfolio: {
    id: 'portfolio',
    name: 'Portfolio Premium',
    amount: 100,
    price: '1 €',
    includes: ['Portfolios Cine y Cosmos', 'Tu CV sigue con los diseños gratuitos'],
  },
} as const

export type ProductId = keyof typeof PRODUCTS
export const isProductId = (v: unknown): v is ProductId => v === 'bundle' || v === 'portfolio'

export type Purchases = { bundle: boolean; portfolio: boolean }
