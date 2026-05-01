'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useAppTranslations } from '@/hooks/useAppTranslations'

interface Props {
  mode?: 'theme' | 'language' | 'both'
}

export function ThemeLanguageToggle({ mode = 'both' }: Props) {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useAppStore()
  const { t } = useAppTranslations()

  const isDark = theme === 'dark'

  return (
    <div className="flex items-center gap-2">
      {(mode === 'theme' || mode === 'both') && (
        <div className="flex rounded-md border border-input overflow-hidden">
          <button
            type="button"
            aria-label={t('settings.themeDark')}
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
              isDark ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            <Moon size={14} />
            {t('settings.themeDark')}
          </button>
          <button
            type="button"
            aria-label={t('settings.themeLight')}
            onClick={() => setTheme('light')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors border-l border-input ${
              !isDark ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            <Sun size={14} />
            {t('settings.themeLight')}
          </button>
        </div>
      )}

      {(mode === 'language' || mode === 'both') && (
        <div className="flex rounded-md border border-input overflow-hidden">
          <button
            type="button"
            aria-label="Português"
            onClick={() => setLanguage('pt-BR')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              language === 'pt-BR'
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            PT
          </button>
          <button
            type="button"
            aria-label="English"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-input ${
              language === 'en'
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            EN
          </button>
        </div>
      )}
    </div>
  )
}
