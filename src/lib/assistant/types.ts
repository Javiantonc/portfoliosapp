import type { ChatTurn } from './prompt'

export type AskErrorCode = 'unavailable' | 'cancelled' | 'rate_limited' | 'refused' | 'error'

export class AskError extends Error {
  constructor(
    public code: AskErrorCode,
    message: string = code,
    public partial?: string
  ) {
    super(message)
  }
}

/** Envía la conversación al asistente. `onText` recibe la respuesta completa hasta el momento. */
export type AskFn = (turns: ChatTurn[], opts: { onText: (text: string) => void; signal: AbortSignal }) => Promise<string>
