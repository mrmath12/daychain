'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { WeeklyGrid } from '@/components/progress/WeeklyGrid'
import {
  fetchAllHabits,
  fetchHabitLogsByHabitsAndPeriod,
  toggleHabitCheck,
} from '@/lib/habits/queries'
import {
  getWeekEnd,
  getWeekDays,
  getWeekIdentifier,
  parseWeekIdentifier,
  addDays,
} from '@/lib/utils/date'
import { getArchivedHabitsWithLogsInPeriod } from '@/lib/habits/utils'
import { env } from '@/env'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import type { Habit } from '@/types/domain'

function WeekPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t, language } = useAppTranslations()

  const userId = env.NEXT_PUBLIC_HARDCODED_USER_ID
  const currentWeekId = getWeekIdentifier(new Date())

  const weekParam = searchParams.get('w')
  const weekId = weekParam && /^\d{4}-W\d{2}$/.test(weekParam) ? weekParam : currentWeekId

  const weekStart = parseWeekIdentifier(weekId)
  const weekEnd = getWeekEnd(weekStart)
  const weekDays = getWeekDays(weekStart)

  const startDate = format(weekStart, 'yyyy-MM-dd')
  const endDate = format(weekEnd, 'yyyy-MM-dd')

  const [habits, setHabits] = useState<Habit[]>([])
  const [logsByHabit, setLogsByHabit] = useState<Map<string, Set<string>>>(new Map())
  const [isLoadingCell, setIsLoadingCell] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const allHabits = await fetchAllHabits(userId)
      const logs = await fetchHabitLogsByHabitsAndPeriod(
        allHabits.map((h) => h.id),
        userId,
        startDate,
        endDate
      )
      const activeHabits = allHabits.filter((h) => !h.archivedAt)
      const archivedWithLogs = getArchivedHabitsWithLogsInPeriod(
        allHabits.filter((h) => h.archivedAt !== null),
        logs
      )
      setHabits([...activeHabits, ...archivedWithLogs])
      setLogsByHabit(logs)
    } catch {
      // leave empty state visible
    } finally {
      setIsLoading(false)
    }
  }, [userId, startDate, endDate])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleToggleCheck(habitId: string, date: string, currentValue: boolean) {
    const cellKey = `${habitId}:${date}`
    setIsLoadingCell((prev) => new Set(prev).add(cellKey))

    // Optimistic update
    setLogsByHabit((prev) => {
      const next = new Map(prev)
      const set = new Set(next.get(habitId) ?? [])
      if (currentValue) set.delete(date)
      else set.add(date)
      next.set(habitId, set)
      return next
    })

    try {
      await toggleHabitCheck(habitId, userId, date, !currentValue)
    } catch {
      // Revert on failure
      setLogsByHabit((prev) => {
        const next = new Map(prev)
        const set = new Set(next.get(habitId) ?? [])
        if (currentValue) set.add(date)
        else set.delete(date)
        next.set(habitId, set)
        return next
      })
    } finally {
      setIsLoadingCell((prev) => {
        const next = new Set(prev)
        next.delete(cellKey)
        return next
      })
    }
  }

  function navigateWeek(delta: number) {
    const newStart = addDays(weekStart, delta * 7)
    const newId = getWeekIdentifier(newStart)
    router.push(`/progress/week?w=${newId}`)
  }

  const isCurrentWeek = weekId === currentWeekId

  const startLabel = new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'short',
  }).format(weekStart)
  const endLabel = new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(weekEnd)
  const dateRange = `${startLabel} – ${endLabel}`

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          aria-label={t('progress.prevWeek')}
          onClick={() => navigateWeek(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <span className="text-sm font-medium">{dateRange}</span>

        <button
          type="button"
          aria-label={t('progress.nextWeek')}
          onClick={() => navigateWeek(1)}
          disabled={isCurrentWeek}
          className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          {t('common.loading')}
        </div>
      ) : (
        <WeeklyGrid
          habits={habits}
          logsByHabit={logsByHabit}
          weekDays={weekDays}
          onToggleCheck={handleToggleCheck}
          isLoadingCell={isLoadingCell}
        />
      )}
    </div>
  )
}

export default function WeekPage() {
  return (
    <Suspense>
      <WeekPageContent />
    </Suspense>
  )
}
