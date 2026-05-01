'use client'

import { useState } from 'react'
import { useHabits } from '@/hooks/useHabits'
import { HabitList } from '@/components/habits/HabitList'
import { ThemeLanguageToggle } from '@/components/shared/ThemeLanguageToggle'
import { Sheet } from '@/components/ui/sheet'
import { useAppTranslations } from '@/hooks/useAppTranslations'

export default function SettingsPage() {
  const { t } = useAppTranslations()
  const { habits, isLoading, createHabit, updateHabit, archiveHabit, deleteHabit, reorderHabits } =
    useHabits()
  const [manageOpen, setManageOpen] = useState(false)

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold">{t('settings.title')}</h1>

      {/* Manage habits */}
      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {t('settings.manageHabits')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('settings.manageHabitsDesc')}</p>
        <button
          onClick={() => setManageOpen(true)}
          className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent transition-colors"
        >
          {t('settings.manageHabits')}
        </button>
      </section>

      {/* Theme */}
      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {t('settings.theme')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('settings.themeDesc')}</p>
        <ThemeLanguageToggle mode="theme" />
      </section>

      {/* Language */}
      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {t('settings.language')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('settings.languageDesc')}</p>
        <ThemeLanguageToggle mode="language" />
      </section>

      {/* Manage habits sheet */}
      <Sheet open={manageOpen} onOpenChange={setManageOpen} title={t('settings.manageHabits')}>
        <HabitList
          habits={habits}
          isLoading={isLoading}
          onCreate={createHabit}
          onUpdate={updateHabit}
          onArchive={archiveHabit}
          onDelete={deleteHabit}
          onReorder={reorderHabits}
        />
      </Sheet>
    </div>
  )
}
