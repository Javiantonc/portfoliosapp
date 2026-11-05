'use client'
import NextLink from 'next/link'
import type { ReactNode } from 'react'
import { AppEnvProvider, type AppLinkProps, type View } from '@/lib/nav'
import { askViaApi } from '@/lib/assistant/http'
import { sendContactViaApi } from '@/lib/contact/http'
import { AssistantWidget } from '@/features/assistant/AssistantWidget'

const routes: Record<View, string> = { home: '/', editor: '/editor', cv: '/cv', portfolio: '/portfolio' }

function Link({ to, ...rest }: AppLinkProps) {
  return <NextLink href={routes[to]} {...rest} />
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppEnvProvider value={{ Link, isPreview: false, ask: askViaApi, sendContact: sendContactViaApi }}>
      {children}
      <AssistantWidget />
    </AppEnvProvider>
  )
}
