'use client'

import { useAppStore } from '@/store/appStore'
import { useAppTranslations } from '@/hooks/useAppTranslations'

export function LanguageToggle() {
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const { t } = useAppTranslations()

  const isPtBR = language === 'pt-BR'

  return (
    <div
      role="group"
      aria-label={t('settings.language')}
      className="relative flex items-center rounded-xl bg-muted p-1"
      style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.10)' }}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-1 w-[calc(50%-4px)] rounded-lg bg-background transition-all duration-300 ease-out ${
          isPtBR ? 'left-1' : 'left-[50%]'
        }`}
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
      />

      <button
        type="button"
        aria-pressed={isPtBR}
        onClick={() => setLanguage('pt-BR')}
        className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
          isPtBR ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        🇧🇷 PT
      </button>

      <button
        type="button"
        aria-pressed={!isPtBR}
        onClick={() => setLanguage('en')}
        className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
          !isPtBR ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        🇺🇸 EN
      </button>
    </div>
  )
}
