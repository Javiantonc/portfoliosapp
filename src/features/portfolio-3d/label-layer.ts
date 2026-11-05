'use client'
import { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'

/** Capa propia para etiquetas HTML encima del contenedor de scroll (evita conflictos al desmontar). */
export function useLabelLayer() {
  const gl = useThree((s) => s.gl)
  const [layer, setLayer] = useState<HTMLDivElement>()
  useEffect(() => {
    const host = gl.domElement.parentElement
    if (!host) return
    const div = document.createElement('div')
    div.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:1'
    const t = setTimeout(() => {
      host.appendChild(div)
      setLayer(div)
    })
    return () => {
      clearTimeout(t)
      setTimeout(() => div.remove())
    }
  }, [gl])
  return layer
}

