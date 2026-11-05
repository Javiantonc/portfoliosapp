'use client'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { AppEnvProvider, type AppLinkProps, type View } from '@/lib/nav'
import { askViaApi } from '@/lib/assistant/http'
import { sendContactViaApi } from '@/lib/contact/http'
import { importCvViaApi } from '@/lib/import/http'
import { checkoutViaStripe } from '@/lib/checkout/http'
import { CheckoutReturn } from '@/features/premium/CheckoutReturn'
import { ImportCvDialog } from '@/features/cv-import/ImportCvDialog'
import { UpgradeDialog } from '@/features/premium/premium'
import { AssistantWidget } from '@/features/assistant/AssistantWidget'

const routes: Record<View, string> = { home: '/', editor: '/editor', cv: '/cv', portfolio: '/portfolio' }

function Link({ to, ...rest }: AppLinkProps) {
  return <NextLink href={routes[to]} {...rest} />
}

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter()
  return (
    <AppEnvProvider value={{ Link, isPreview: false, ask: askViaApi, sendContact: sendContactViaApi, importCv: importCvViaApi, checkout: checkoutViaStripe, navigate: (v) => router.push(routes[v]), assetBase: '/' }}>
      {children}
      <AssistantWidget />
      <ImportCvDialog />
      <UpgradeDialog />
      <CheckoutReturn />
    </AppEnvProvider>
  )
}
