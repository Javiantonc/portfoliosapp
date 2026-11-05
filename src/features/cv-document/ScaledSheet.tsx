'use client'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

const SHEET_W = 793.7 // 210mm a 96dpi

export function ScaledSheet({ children, max = 1, padding = 32 }: { children: ReactNode; max?: number; padding?: number }) {
  const box = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.6)
  const [h, setH] = useState(1123)

  useLayoutEffect(() => {
    const el = box.current
    const content = inner.current
    if (!el || !content) return
    const ro = new ResizeObserver(() => {
      setScale(Math.min(max, (el.clientWidth - padding * 2) / SHEET_W))
      setH(content.offsetHeight)
    })
    ro.observe(el)
    ro.observe(content)
    return () => ro.disconnect()
  }, [max, padding])

  return (
    <div ref={box} className="print-reset w-full" style={{ padding }}>
      <div className="print-reset mx-auto" style={{ width: SHEET_W * scale, height: h * scale }}>
        <div ref={inner} className="print-reset" style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: SHEET_W }}>
          {children}
        </div>
      </div>
    </div>
  )
}
