import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Relieve · Tu CV, en relieve',
  description: 'Crea tu CV para cualquier profesión y conviértelo en un portfolio web interactivo en 3D.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Fraunces:opsz,wght@9..144,400..800&family=Geist:wght@400..700&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
