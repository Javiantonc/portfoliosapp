export type ImportErrorCode = 'unsupported' | 'empty' | 'unavailable' | 'rate_limited' | 'failed'

export class ImportError extends Error {
  constructor(
    public code: ImportErrorCode,
    message: string = code
  ) {
    super(message)
  }
}

/** Envía el contenido del CV a la IA y devuelve los datos sin normalizar. */
export type ImportCvFn = (input: { text: string; images: Blob[] }) => Promise<unknown>
