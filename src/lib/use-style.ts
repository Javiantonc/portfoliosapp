'use client'
import { useEffect, useMemo } from 'react'
import type { CV } from './schema/cv'
import { ensureStyleFonts, resolveStyle } from './design'

export function useResolvedStyle(cv: CV) {
  const style = useMemo(() => resolveStyle(cv), [cv])
  useEffect(() => ensureStyleFonts(style, cv), [style, cv])
  return style
}
