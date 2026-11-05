'use client'
import dynamic from 'next/dynamic'

const View = dynamic(() => import('@/features/cv-editor/EditorShell').then((m) => m.EditorShell), { ssr: false })

export default function Page() {
  return <View />
}
