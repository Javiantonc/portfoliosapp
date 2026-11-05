import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { defaultContact, defaultEffects, defaultSkillsView, defaultStyle, emptyCV, type CV, type ListSection, type Personal, type SectorId, type Settings } from '@/lib/schema/cv'
import { sectorDemos } from '@/lib/demo-data'
import { getSector } from '@/lib/sectors'

type CVState = {
  cv: CV
  /** cambia cuando se reemplaza el CV completo (para remontar formularios) */
  rev: number
  setPersonal: (p: Partial<Personal>) => void
  setSection: <K extends ListSection>(key: K, items: CV[K]) => void
  setSettings: (s: Partial<Settings>) => void
  setEffects: (e: Partial<Settings['effects']>) => void
  setSkillsView: (v: Partial<Settings['skillsView']>) => void
  setContact: (c: Partial<Settings['contact']>) => void
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
      setPersonal: (p) => set((s) => ({ cv: { ...s.cv, personal: { ...s.cv.personal, ...p } } })),
      setSection: (key, items) => set((s) => ({ cv: { ...s.cv, [key]: items } })),
      setSettings: (p) => set((s) => ({ cv: { ...s.cv, settings: { ...s.cv.settings, ...p } } })),
      setEffects: (e) =>
        set((s) => ({ cv: { ...s.cv, settings: { ...s.cv.settings, effects: { ...s.cv.settings.effects, ...e } } } })),
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
      version: 6,
      partialize: (s) => ({ cv: s.cv }),
      migrate: (persisted) => {
        const p = persisted as { cv?: CV }
        if (p?.cv) {
          const prev = p.cv.settings ?? emptyCV.settings
          p.cv = { ...p.cv, settings: { ...emptyCV.settings, ...defaultStyle, ...prev, effects: { ...defaultEffects, ...(prev.effects ?? {}) }, skillsView: { ...defaultSkillsView, ...(prev.skillsView ?? {}) }, contact: { ...defaultContact, ...(prev.contact ?? {}) } } }
        }
        return p as CVState
      },
    }
  )
)

export const useSector = () => getSector(useCVStore((s) => s.cv.settings.sector))
