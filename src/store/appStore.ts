import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from '@/lib/utils/constants'

interface AppState {
  language: 'pt-BR' | 'en'
  setLanguage: (lang: 'pt-BR' | 'en') => void
  // sync queue state — ver Prompt 14
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE as 'pt-BR' | 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: LANGUAGE_STORAGE_KEY,
    }
  )
)
