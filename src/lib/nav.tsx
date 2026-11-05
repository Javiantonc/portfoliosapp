'use client'
import { createContext, useContext, type ComponentType, type ReactNode } from 'react'
import type { AskFn } from './assistant/types'
import type { SendContactFn } from './contact/types'

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
