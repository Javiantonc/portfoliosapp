'use client'
import { createContext, useContext, type ComponentType, type ReactNode } from 'react'
import type { AskFn } from './assistant/types'
import type { SendContactFn } from './contact/types'
import type { ImportCvFn } from './import/types'
import type { CheckoutFn } from './checkout/types'

export type View = 'home' | 'editor' | 'cv' | 'portfolio'

export type AppLinkProps = { to: View; className?: string; children: ReactNode; 'aria-label'?: string }

type AppEnv = {
  Link: ComponentType<AppLinkProps>
  /** true en la vista previa estática (sin impresión ni backend) */
  isPreview: boolean
  /** conexión con el asistente virtual (opcional) */
  ask?: AskFn
  /** envío del formulario de contacto del portfolio (opcional) */
  sendContact?: SendContactFn
  /** lectura de un CV existente con IA (opcional) */
  importCv?: ImportCvFn
  /** pago de productos Premium (si falta, la compra se simula) */
  checkout?: CheckoutFn
  /** navegación por código */
  navigate?: (to: View) => void
  /** ruta base de los archivos públicos (worker de PDF) */
  assetBase?: string
}

const fallbackLink = ({ to, ...rest }: AppLinkProps) => <a href={`#${to}`} {...rest} />

const AppEnvContext = createContext<AppEnv>({ Link: fallbackLink, isPreview: false })

export function AppEnvProvider({ value, children }: { value: AppEnv; children: ReactNode }) {
  return <AppEnvContext.Provider value={value}>{children}</AppEnvContext.Provider>
}

export const useAppEnv = () => useContext(AppEnvContext)

export function AppLink(props: AppLinkProps) {
  const { Link } = useAppEnv()
  return <Link {...props} />
}
