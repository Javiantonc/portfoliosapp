'use client'
import dynamic from 'next/dynamic'

const View = dynamic(() => import('@/features/portfolio-3d/PortfolioView').then((m) => m.PortfolioView), { ssr: false })

export default function Page() {
  return <View />
}
