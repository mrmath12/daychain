'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, Globe } from 'lucide-react'
import { useAppStore } from '@/store/appStore'

export function ThemeLanguageToggle() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useAppStore()

  return (
    <div className="flex items-center gap-2">
      <button
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="rounded-md p-2 hover:bg-accent transition-colors"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <button
        aria-label={language === 'pt-BR' ? 'Switch to English' : 'Mudar para Português'}
        onClick={() => setLanguage(language === 'pt-BR' ? 'en' : 'pt-BR')}
        className="rounded-md p-2 hover:bg-accent transition-colors text-xs font-semibold"
      >
        <Globe size={18} aria-hidden="true" />
      </button>
    </div>
  )
}
