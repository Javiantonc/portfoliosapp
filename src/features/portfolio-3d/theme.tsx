'use client'
import { createContext, useContext } from 'react'
import { sectors, type StageTheme } from '@/lib/sectors'
import { defaultEffects, type Effects } from '@/lib/schema/cv'

export type StageContext = StageTheme & { light: boolean; titleScale: number; fx: Effects }

const StageThemeContext = createContext<StageContext>({ ...sectors.tech.theme, light: false, titleScale: 1, fx: defaultEffects })
export const StageThemeProvider = StageThemeContext.Provider
export const useStageTheme = () => useContext(StageThemeContext)
export const useFx = () => useContext(StageThemeContext).fx
