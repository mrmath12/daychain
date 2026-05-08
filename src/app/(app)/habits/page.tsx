'use client'

import { useHabits } from '@/hooks/useHabits'
import { HabitList } from '@/components/habits/HabitList'
import { useAppTranslations } from '@/hooks/useAppTranslations'

export default function HabitsPage() {
  const { t } = useAppTranslations()
  const { habits, isLoading, createHabit, updateHabit, archiveHabit, deleteHabit, reorderHabits } =
    useHabits()

  return (
    <div className="mx-auto">
      <div className="flex items-center px-4 pt-4 pb-2">
        <h1 className="text-xl font-semibold">{t('habits.title')}</h1>
      </div>

      <HabitList
        habits={habits}
        isLoading={isLoading}
        onCreate={createHabit}
        onUpdate={updateHabit}
        onArchive={archiveHabit}
        onDelete={deleteHabit}
        onReorder={reorderHabits}
      />
    </div>
  )
}
