'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useAppTranslations } from '@/hooks/useAppTranslations'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useAppTranslations()

  const isDark = theme === 'dark'

  return (
    <div
      role="group"
      aria-label={t('settings.theme')}
      className="relative flex items-center rounded-xl bg-muted p-1"
      style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.10)' }}
    >
      {/* Sliding pill */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-1 w-[calc(50%-4px)] rounded-lg bg-background transition-all duration-300 ease-out ${
          isDark ? 'left-1' : 'left-[50%]'
        }`}
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
      />

      <button
        type="button"
        aria-pressed={isDark}
        onClick={() => setTheme('dark')}
        className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
          isDark ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        <Moon
          size={13}
          aria-hidden="true"
          className={`transition-all duration-300 ${isDark ? 'text-amber-500 scale-110' : 'scale-100'}`}
        />
        {t('settings.themeDark')}
      </button>

      <button
        type="button"
        aria-pressed={!isDark}
        onClick={() => setTheme('light')}
        className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
          !isDark ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        <Sun
          size={13}
          aria-hidden="true"
          className={`transition-all duration-300 ${!isDark ? 'text-amber-500 scale-110' : 'scale-100'}`}
        />
        {t('settings.themeLight')}
      </button>
    </div>
  )
}
