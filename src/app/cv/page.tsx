'use client'
import dynamic from 'next/dynamic'

const View = dynamic(() => import('@/features/cv-document/CVView').then((m) => m.CVView), { ssr: false })

export default function Page() {
  return <View />
}
