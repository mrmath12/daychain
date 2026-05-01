'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { MonthlyGrid } from '@/components/progress/MonthlyGrid'
import {
  fetchAllHabits,
  fetchHabitLogsByHabitsAndPeriod,
  toggleHabitCheck,
} from '@/lib/habits/queries'
import {
  getMonthDays,
  getMonthIdentifier,
  parseMonthIdentifier,
  navigateMonth,
} from '@/lib/utils/date'
import { getArchivedHabitsWithLogsInPeriod } from '@/lib/habits/utils'
import { env } from '@/env'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import type { Habit } from '@/types/domain'

function MonthPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t, language } = useAppTranslations()

  const userId = env.NEXT_PUBLIC_HARDCODED_USER_ID
  const currentMonthId = getMonthIdentifier(new Date())

  const monthParam = searchParams.get('m')
  const monthId = monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : currentMonthId

  const { year, month } = parseMonthIdentifier(monthId)
  const monthDays = getMonthDays(year, month)

  const firstDay = new Date(year, month - 1, 1, 12, 0, 0)
  const startDate = format(firstDay, 'yyyy-MM-01')
  const endDate = format(new Date(year, month - 1, monthDays.length, 12, 0, 0), 'yyyy-MM-dd')

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

  function navigateToMonth(delta: number) {
    const { year: y, month: m } = navigateMonth(year, month, delta)
    const newId = `${y}-${String(m).padStart(2, '0')}`
    router.push(`/progress/month?m=${newId}`)
  }

  const isCurrentMonth = monthId === currentMonthId

  // "Abril 2025" / "April 2025"
  const monthName = new Intl.DateTimeFormat(language, { month: 'long' }).format(firstDay)
  const monthLabel = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          aria-label={t('progress.prevMonth')}
          onClick={() => navigateToMonth(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <span className="text-sm font-medium">{monthLabel}</span>

        <button
          type="button"
          aria-label={t('progress.nextMonth')}
          onClick={() => navigateToMonth(1)}
          disabled={isCurrentMonth}
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
        <MonthlyGrid
          habits={habits}
          logsByHabit={logsByHabit}
          monthDays={monthDays}
          onToggleCheck={handleToggleCheck}
          isLoadingCell={isLoadingCell}
        />
      )}
    </div>
  )
}

export default function MonthPage() {
  return (
    <Suspense>
      <MonthPageContent />
    </Suspense>
  )
}
