import { ContactError, type SendContactFn } from '@/lib/contact/types'

/** La vista previa estática no tiene servidor: no envía nada y lo dice. */
export const sendContactPreview: SendContactFn = async () => {
  await new Promise((r) => setTimeout(r, 500))
  throw new ContactError('preview')
}
