import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_LANGUAGE, DEFAULT_THEME } from '@/lib/utils/constants'

interface AppState {
  theme: string
  language: string
  hasPendingSync: boolean
  setTheme: (theme: string) => void
  setLanguage: (language: string) => void
  setHasPendingSync: (pending: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: DEFAULT_THEME,
      language: DEFAULT_LANGUAGE,
      hasPendingSync: false,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setHasPendingSync: (hasPendingSync) => set({ hasPendingSync }),
    }),
    {
      name: 'daychain:app',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),
    }
  )
)
