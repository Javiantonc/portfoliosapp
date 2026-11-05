import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { defaultContact, defaultLabelOverrides, defaultPhoto, defaultEffects, defaultSkillsView, defaultStyle, emptyCV, type CV, type ListSection, type Personal, type SectorId, type Settings } from '@/lib/schema/cv'
import { sectorDemos } from '@/lib/demo-data'
import { getSector, mergeLabels } from '@/lib/sectors'
import type { ProductId, Purchases } from '@/lib/pricing'
import { useMemo } from 'react'

type CVState = {
  cv: CV
  /** cambia cuando se reemplaza el CV completo (para remontar formularios) */
  rev: number
  /** diálogo de importar CV abierto (no se guarda) */
  importOpen: boolean
  /** compras Premium de este navegador (con Supabase, guárdalas en el servidor) */
  purchases: Purchases
  grant: (product: ProductId) => void
  resetPurchases: () => void
  /** producto recién comprado, para mostrar la confirmación */
  justBought: ProductId | null
  setJustBought: (p: ProductId | null) => void
  /** diálogo de Premium abierto (no se guarda) */
  upgradeOpen: boolean
  setUpgradeOpen: (open: boolean) => void
  setImportOpen: (open: boolean) => void
  setPersonal: (p: Partial<Personal>) => void
  setSection: <K extends ListSection>(key: K, items: CV[K]) => void
  setSettings: (s: Partial<Settings>) => void
  setEffects: (e: Partial<Settings['effects']>) => void
  setSkillsView: (v: Partial<Settings['skillsView']>) => void
  setContact: (c: Partial<Settings['contact']>) => void
  setPhoto: (p: Partial<Settings['photo']>) => void
  load: (cv: CV) => void
  loadDemo: (sector?: SectorId) => void
  clear: () => void
}

const safeStorage = createJSONStorage(() => {
  try {
    const k = '__cv_probe'
    localStorage.setItem(k, '1')
    localStorage.removeItem(k)
    return localStorage
  } catch {
    const mem = new Map<string, string>()
    return {
      getItem: (n) => mem.get(n) ?? null,
      setItem: (n, v) => void mem.set(n, v),
      removeItem: (n) => void mem.delete(n),
    }
  }
})

export const useCVStore = create<CVState>()(
  persist(
    (set) => ({
      cv: sectorDemos.tech,
      rev: 0,
      importOpen: false,
      purchases: { bundle: false, portfolio: false },
      grant: (product) => set((s) => ({ purchases: { ...s.purchases, [product]: true } })),
      resetPurchases: () => set({ purchases: { bundle: false, portfolio: false } }),
      justBought: null,
      setJustBought: (justBought) => set({ justBought }),
      upgradeOpen: false,
      setUpgradeOpen: (upgradeOpen) => set({ upgradeOpen }),
      setImportOpen: (importOpen) => set({ importOpen }),
      setPersonal: (p) => set((s) => ({ cv: { ...s.cv, personal: { ...s.cv.personal, ...p } } })),
      setSection: (key, items) => set((s) => ({ cv: { ...s.cv, [key]: items } })),
      setSettings: (p) => set((s) => ({ cv: { ...s.cv, settings: { ...s.cv.settings, ...p } } })),
      setEffects: (e) =>
        set((s) => ({ cv: { ...s.cv, settings: { ...s.cv.settings, effects: { ...s.cv.settings.effects, ...e } } } })),
      setPhoto: (p) =>
        set((s) => ({ cv: { ...s.cv, settings: { ...s.cv.settings, photo: { ...s.cv.settings.photo, ...p } } } })),
      setContact: (c) =>
        set((s) => ({ cv: { ...s.cv, settings: { ...s.cv.settings, contact: { ...s.cv.settings.contact, ...c } } } })),
      setSkillsView: (v) =>
        set((s) => ({ cv: { ...s.cv, settings: { ...s.cv.settings, skillsView: { ...s.cv.settings.skillsView, ...v } } } })),
      load: (cv) => set((s) => ({ cv, rev: s.rev + 1 })),
      loadDemo: (sector) =>
        set((s) => {
          const id = sector ?? s.cv.settings.sector
          const cv = structuredClone(sectorDemos[id])
          cv.settings = { ...s.cv.settings, sector: id }
          return { cv, rev: s.rev + 1 }
        }),
      clear: () =>
        set((s) => ({ cv: { ...structuredClone(emptyCV), settings: s.cv.settings }, rev: s.rev + 1 })),
    }),
    {
      name: 'proyectoport-cv',
      storage: safeStorage,
      version: 10,
      partialize: (s) => ({ cv: s.cv, purchases: s.purchases }),
      migrate: (persisted) => {
        const p = persisted as { cv?: CV; plan?: string; purchases?: Purchases }
        if (p && !p.purchases) p.purchases = { bundle: p.plan === 'premium', portfolio: false }
        if (p?.cv) {
          const prev = p.cv.settings ?? emptyCV.settings
          p.cv = { ...p.cv, settings: { ...emptyCV.settings, ...defaultStyle, ...prev, effects: { ...defaultEffects, ...(prev.effects ?? {}) }, skillsView: { ...defaultSkillsView, ...(prev.skillsView ?? {}) }, contact: { ...defaultContact, ...(prev.contact ?? {}) }, photo: { ...defaultPhoto, ...(prev.photo ?? {}) }, labels: { ...defaultLabelOverrides, ...(prev.labels ?? {}) } } }
        }
        return p as CVState
      },
    }
  )
)

/** Sector actual, con los nombres de apartados personalizados ya aplicados. */
export const useSector = () => {
  const sector = useCVStore((s) => s.cv.settings.sector)
  const overrides = useCVStore((s) => s.cv.settings.labels)
  return useMemo(() => ({ ...getSector(sector), labels: mergeLabels(getSector(sector).labels, overrides) }), [sector, overrides])
}
