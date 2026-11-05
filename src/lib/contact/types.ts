import type { ContactMessage } from '@/lib/schema/cv'

export type ContactErrorCode = 'preview' | 'unavailable' | 'rate_limited' | 'invalid' | 'error'

export class ContactError extends Error {
  constructor(
    public code: ContactErrorCode,
    message: string = code
  ) {
    super(message)
  }
}

export type ContactPayload = ContactMessage & {
  /** campo trampa para bots: siempre vacío en personas reales */
  website: string
  /** destinatario configurado en el editor (solo se usa en desarrollo) */
  to: string
  /** slug del portfolio publicado: el servidor busca ahí el destinatario */
  slug?: string
}

export type SendContactFn = (p: ContactPayload) => Promise<void>
