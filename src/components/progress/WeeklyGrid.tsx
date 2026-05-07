'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { format, getISODay } from 'date-fns'
import { WeekGridCell } from '@/components/progress/WeekGridCell'
import { determineCellState } from '@/lib/habits/utils'
import { getTodayLocalDate } from '@/lib/utils/date'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import type { Habit, DayOfWeek } from '@/types/domain'

interface Props {
  habits: Habit[]
  logsByHabit: Map<string, Set<string>>
  weekDays: Date[]
  onToggleCheck: (habitId: string, date: string, currentValue: boolean) => void
  isLoadingCell?: Set<string>
}

export function WeeklyGrid({
  habits,
  logsByHabit,
  weekDays,
  onToggleCheck,
  isLoadingCell = new Set(),
}: Props) {
  const { t } = useAppTranslations()
  const today = getTodayLocalDate()

  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [updateScrollState, habits])

  function getDayTotals(dayStr: string): { done: number; expected: number } {
    let done = 0
    let expected = 0
    for (const habit of habits) {
      if (habit.archivedAt !== null) continue
      const logs = logsByHabit.get(habit.id) ?? new Set<string>()
      const state = determineCellState(habit, dayStr, logs, today)
      if (state === 'done') {
        done++
        expected++
      } else if (state === 'pending' || state === 'future') {
        expected++
      }
    }
    return { done, expected }
  }

  if (habits.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {t('progress.noChecks')}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Left scroll shadow — starts after sticky name column */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 z-30 w-10 transition-opacity duration-200 left-[88px] lg:left-[148px]"
        style={{
          background: 'linear-gradient(to right, hsl(var(--background)), transparent)',
          opacity: canScrollLeft ? 1 : 0,
        }}
      />
      {/* Right scroll shadow */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 z-30 w-10 transition-opacity duration-200 right-0"
        style={{
          background: 'linear-gradient(to left, hsl(var(--background)), transparent)',
          opacity: canScrollRight ? 1 : 0,
        }}
      />

      <div
        ref={scrollRef}
        className="overflow-x-auto [&::-webkit-scrollbar]:h-[5px] [&::-webkit-scrollbar-track]:ml-[88px] lg:[&::-webkit-scrollbar-track]:ml-[148px] [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/60"
        style={
          {
            overscrollBehaviorX: 'contain',
            WebkitOverflowScrolling: 'touch',
          } as React.CSSProperties
        }
      >
        <table className="border-collapse text-sm w-full" style={{ minWidth: 'max-content' }}>
          <thead>
            <tr>
              <th
                className="sticky left-0 z-10 bg-background px-2 py-2 text-left min-w-[88px] w-[88px] lg:min-w-[148px] lg:w-[148px]"
                style={{
                  borderBottom: '2px solid hsl(var(--border))',
                  borderRight: '1px solid hsl(var(--border))',
                }}
              />
              {weekDays.map((day) => {
                const dayStr = format(day, 'yyyy-MM-dd')
                const isCurrentDay = dayStr === today
                const dowKey = String(getISODay(day) as DayOfWeek)
                return (
                  <th
                    key={dayStr}
                    className={`px-1 py-2 text-center font-normal min-w-[36px] ${
                      isCurrentDay ? 'bg-amber-50 dark:bg-amber-950/30' : ''
                    }`}
                    style={{ borderBottom: '2px solid hsl(var(--border))' }}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        {t(`habits.days.${dowKey}`)}
                      </span>
                      <span
                        className={`text-sm font-bold font-mono ${
                          isCurrentDay ? 'text-amber-600 dark:text-amber-400' : ''
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => {
              const isArchived = habit.archivedAt !== null
              const logs = logsByHabit.get(habit.id) ?? new Set<string>()
              return (
                <tr key={habit.id} className="group">
                  <td className="sticky left-0 z-10 bg-background border-b border-r border-border px-2 py-0 group-hover:bg-muted/40 transition-colors min-w-[88px] w-[88px] lg:min-w-[148px] lg:w-[148px]">
                    <div className="flex items-center gap-1.5 min-h-[54px]">
                      <span className="shrink-0 text-base leading-none">{habit.emoji}</span>
                      <span
                        className={`truncate text-xs leading-tight font-medium max-w-[56px] lg:max-w-[120px] ${
                          isArchived ? 'text-muted-foreground/50 line-through' : ''
                        }`}
                        title={habit.name}
                      >
                        {habit.name}
                      </span>
                    </div>
                  </td>
                  {weekDays.map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd')
                    const state = determineCellState(habit, dayStr, logs, today)
                    const cellKey = `${habit.id}:${dayStr}`
                    const isCurrentDay = dayStr === today
                    return (
                      <td
                        key={dayStr}
                        className={`border-b border-border p-0 min-w-[36px] ${
                          isCurrentDay ? 'bg-amber-50 dark:bg-amber-950/30' : ''
                        }`}
                      >
                        <WeekGridCell
                          state={state}
                          isLoading={isLoadingCell.has(cellKey)}
                          onToggle={() =>
                            onToggleCheck(
                              habit.id,
                              dayStr,
                              state === 'done' || state === 'off-done'
                            )
                          }
                        />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td
                className="sticky left-0 z-10 bg-background border-r border-border px-2 py-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground min-w-[88px] w-[88px] lg:min-w-[148px] lg:w-[148px]"
                style={{ borderTop: '2px solid hsl(var(--border))' }}
              >
                {t('progress.total')}
              </td>
              {weekDays.map((day) => {
                const dayStr = format(day, 'yyyy-MM-dd')
                const { done, expected } = getDayTotals(dayStr)
                const isCurrentDay = dayStr === today
                const allDone = expected > 0 && done === expected
                return (
                  <td
                    key={dayStr}
                    className={`px-1 py-2 text-center min-w-[36px] ${
                      isCurrentDay ? 'bg-amber-50 dark:bg-amber-950/30' : ''
                    }`}
                    style={{ borderTop: '2px solid hsl(var(--border))' }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`text-xs font-mono font-bold tabular-nums ${
                          allDone
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {done}/{expected}
                      </span>
                      {expected > 0 && (
                        <div className="w-6 h-[3px] bg-muted overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300"
                            style={{ width: `${(done / expected) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                )
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
