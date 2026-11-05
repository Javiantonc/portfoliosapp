'use client'
import { useEffect } from 'react'
import { verifyCheckout } from '@/lib/checkout/http'
import { useCVStore } from '@/lib/store/cv-store'

/** Al volver de Stripe (?checkout=success&session_id=…) verifica el pago y activa la compra. */
export function CheckoutReturn() {
  useEffect(() => {
    const url = new URL(window.location.href)
    const status = url.searchParams.get('checkout')
    if (!status) return
    const sessionId = url.searchParams.get('session_id')
    url.searchParams.delete('checkout')
    url.searchParams.delete('session_id')
    window.history.replaceState(null, '', url.pathname + url.search + url.hash)
    const { grant, setJustBought, setUpgradeOpen } = useCVStore.getState()
    if (status !== 'success' || !sessionId) {
      setUpgradeOpen(true)
      return
    }
    verifyCheckout(sessionId).then((product) => {
      if (!product) return
      grant(product)
      setJustBought(product)
      setUpgradeOpen(true)
    })
  }, [])
  return null
}
