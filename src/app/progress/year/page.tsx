'use client'

import { useState, useEffect } from 'react'
import { AnnualConsistencyTable } from '@/components/progress/AnnualConsistencyTable'
import { fetchAllHabits, fetchAnnualConsistency } from '@/lib/habits/queries'
import { env } from '@/env'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import type { Habit } from '@/types/domain'

export default function YearPage() {
  const { t } = useAppTranslations()
  const userId = env.NEXT_PUBLIC_HARDCODED_USER_ID

  const [habits, setHabits] = useState<Habit[]>([])
  const [countsByHabitYear, setCountsByHabitYear] = useState<Map<string, number>>(new Map())
  const [years, setYears] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const [allHabits, annualData] = await Promise.all([
          fetchAllHabits(userId),
          fetchAnnualConsistency(userId),
        ])

        const map = new Map<string, number>()
        const yearSet = new Set<number>()
        for (const { habitId, year, totalChecks } of annualData) {
          map.set(`${habitId}:${year}`, totalChecks)
          yearSet.add(year)
        }

        // Current year always present even with 0 checks
        yearSet.add(new Date().getFullYear())

        const sortedYears = Array.from(yearSet).sort((a, b) => b - a)

        const activeHabits = allHabits.filter((h) => !h.archivedAt)
        const habitIdsWithChecks = new Set(annualData.map((d) => d.habitId))
        const archivedWithChecks = allHabits.filter(
          (h) => h.archivedAt !== null && habitIdsWithChecks.has(h.id)
        )

        setHabits([...activeHabits, ...archivedWithChecks])
        setCountsByHabitYear(map)
        setYears(sortedYears)
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

  return (
    <AnnualConsistencyTable habits={habits} countsByHabitYear={countsByHabitYear} years={years} />
  )
}
