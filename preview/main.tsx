import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import { AppEnvProvider, type AppLinkProps, type View } from '@/lib/nav'
import { Landing } from '@/features/landing/Landing'
import { EditorShell } from '@/features/cv-editor/EditorShell'
import { CVView } from '@/features/cv-document/CVView'
import { PortfolioView } from '@/features/portfolio-3d/PortfolioView'
import { AssistantWidget } from '@/features/assistant/AssistantWidget'
import { askViaSample } from './sample-transport'
import { sendContactPreview } from './contact-transport'
import { importCvViaSample } from './import-transport'
import { ImportCvDialog } from '@/features/cv-import/ImportCvDialog'
import { UpgradeDialog } from '@/features/premium/premium'

const views: View[] = ['home', 'editor', 'cv', 'portfolio']
const read = (): View => {
  const h = location.hash.slice(1) as View
  return views.includes(h) ? h : 'home'
}

function Link({ to, ...rest }: AppLinkProps) {
  return <a href={to === 'home' ? '#home' : `#${to}`} {...rest} />
}

function App() {
  const [view, setView] = useState<View>(read)
  useEffect(() => {
    const on = () => (setView(read()), window.scrollTo(0, 0))
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return (
    <AppEnvProvider value={{ Link, isPreview: true, ask: askViaSample, sendContact: sendContactPreview, importCv: importCvViaSample, navigate: (v) => (location.hash = v), assetBase: './' }}>
      {view === 'home' && <Landing />}
      {view === 'editor' && <EditorShell />}
      {view === 'cv' && <CVView />}
      {view === 'portfolio' && <PortfolioView />}
      <AssistantWidget />
      <ImportCvDialog />
      <UpgradeDialog />
    </AppEnvProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
