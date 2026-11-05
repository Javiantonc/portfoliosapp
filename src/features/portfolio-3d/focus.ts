import { create } from 'zustand'

/** Permite al editor pedir a la vista previa que se desplace a una sección. */
export const usePreviewFocus = create<{ section: 'about' | 'contact' | null; focus: (s: 'about' | 'contact' | null) => void }>((set) => ({
  section: null,
  focus: (section) => set({ section }),
}))
