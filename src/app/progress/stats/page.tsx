'use client'

import { useState, useEffect } from 'react'
import { parseISO, startOfMonth, startOfYear } from 'date-fns'
import { StatsCard } from '@/components/progress/StatsCard'
import { fetchActiveHabits, fetchAllHabitLogDates } from '@/lib/habits/queries'
import {
  calculateCurrentStreak,
  calculateMaxStreak,
  calculateConsistencyPercentage,
} from '@/lib/habits/streak'
import { env } from '@/env'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import type { Habit } from '@/types/domain'

interface HabitStats {
  habit: Habit
  currentStreak: number
  maxStreak: number
  totalChecks: number
  monthConsistency: number
  yearConsistency: number
}

export default function StatsPage() {
  const { t } = useAppTranslations()
  const userId = env.NEXT_PUBLIC_HARDCODED_USER_ID

  const [stats, setStats] = useState<HabitStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const activeHabits = await fetchActiveHabits(userId)
        if (activeHabits.length === 0) {
          setStats([])
          return
        }

        const allLogs = await fetchAllHabitLogDates(
          activeHabits.map((h) => h.id),
          userId
        )

        const today = new Date()
        const monthStart = startOfMonth(today)
        const yearStart = startOfYear(today)

        const computed: HabitStats[] = activeHabits.map((habit) => {
          const logs = allLogs.get(habit.id) ?? new Set<string>()
          const createdAt = parseISO(habit.createdAt)

          return {
            habit,
            currentStreak: calculateCurrentStreak(habit.frequency, logs, today),
            maxStreak: calculateMaxStreak(habit.frequency, logs, createdAt, today),
            totalChecks: logs.size,
            monthConsistency: calculateConsistencyPercentage(
              habit.frequency,
              logs,
              monthStart,
              today
            ),
            yearConsistency: calculateConsistencyPercentage(
              habit.frequency,
              logs,
              yearStart,
              today
            ),
          }
        })

        computed.sort((a, b) => b.currentStreak - a.currentStreak)
        setStats(computed)
      } catch {
        // leave empty state visible
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [userId])

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {t('common.loading')}
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {t('progress.noChecks')}
      </div>
    )
  }

  return (
    <div className="overflow-hidden border border-border rounded-xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border">
        {stats.map(
          ({ habit, currentStreak, maxStreak, totalChecks, monthConsistency, yearConsistency }) => (
            <StatsCard
              key={habit.id}
              habit={habit}
              currentStreak={currentStreak}
              maxStreak={maxStreak}
              totalChecks={totalChecks}
              monthConsistency={monthConsistency}
              yearConsistency={yearConsistency}
            />
          )
        )}
      </div>
    </div>
  )
}
