'use client'

import { useEffect, useState } from 'react'
import { endOfMonth, endOfYear, min, parseISO, startOfMonth, startOfYear } from 'date-fns'
import { StatsCard } from '@/components/progress/StatsCard'
import { fetchActiveHabits, fetchAllHabitLogDates } from '@/lib/habits/queries'
import {
  calculateConsistencyPercentage,
  calculateCurrentChain,
  calculateMaxChain,
} from '@/lib/habits/chain'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import type { Habit } from '@/types/domain'

interface HabitStats {
  habit: Habit
  currentChain: number
  maxChain: number
  totalChecks: number
  monthConsistency: number
  yearConsistency: number
}

interface HabitStatsSectionProps {
  userId: string
  // ISO date string (YYYY-MM-DD) that anchors the month and year used for consistency metrics
  referenceDate: string
}

export function HabitStatsSection({ userId, referenceDate }: HabitStatsSectionProps) {
  const { t } = useAppTranslations()
  const [stats, setStats] = useState<HabitStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const activeHabits = await fetchActiveHabits(userId)
        if (activeHabits.length === 0) {
          if (!cancelled) setStats([])
          return
        }

        const allLogs = await fetchAllHabitLogDates(
          activeHabits.map((h) => h.id),
          userId
        )

        const ref = parseISO(referenceDate)
        const today = new Date()
        // Cap period ends to today so future days don't drag down current-period consistency
        const monthStart = startOfMonth(ref)
        const monthEnd = min([endOfMonth(ref), today])
        const yearStart = startOfYear(ref)
        const yearEnd = min([endOfYear(ref), today])

        const computed: HabitStats[] = activeHabits.map((habit) => {
          const logs = allLogs.get(habit.id) ?? new Set<string>()
          return {
            habit,
            currentChain: calculateCurrentChain(habit.frequency, logs, today),
            maxChain: calculateMaxChain(habit.frequency, logs, parseISO(habit.createdAt), today),
            totalChecks: logs.size,
            monthConsistency: calculateConsistencyPercentage(
              habit.frequency,
              logs,
              monthStart,
              monthEnd
            ),
            yearConsistency: calculateConsistencyPercentage(
              habit.frequency,
              logs,
              yearStart,
              yearEnd
            ),
          }
        })

        computed.sort((a, b) => b.currentChain - a.currentChain)
        if (!cancelled) setStats(computed)
      } catch {
        // leave empty on error
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId, referenceDate])

  if (isLoading) {
    return (
      <div className="flex h-20 items-center justify-center text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {t('common.loading')}
      </div>
    )
  }

  if (stats.length === 0) return null

  return (
    <div className="mb-4">
      <h2 className="mt-6 text-3xl font-mono font-bold tabular-nums leading-none">
        {t('progress.statsTitle')}
      </h2>
      <div className="mt-2 overflow-hidden border border-border rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
          {stats.map(
            ({ habit, currentChain, maxChain, totalChecks, monthConsistency, yearConsistency }) => (
              <StatsCard
                key={habit.id}
                habit={habit}
                currentChain={currentChain}
                maxChain={maxChain}
                totalChecks={totalChecks}
                monthConsistency={monthConsistency}
                yearConsistency={yearConsistency}
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}
