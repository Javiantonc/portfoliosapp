'use client'
import { useSyncExternalStore } from 'react'

const query = '(hover: none), (pointer: coarse)'
const subscribe = (cb: () => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const mq = window.matchMedia(query)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

/** true en pantallas táctiles sin ratón (móviles y tabletas). */
export const useIsTouch = () =>
  useSyncExternalStore(
    subscribe,
    () => (typeof window !== 'undefined' && !!window.matchMedia?.(query).matches),
    () => false
  )
