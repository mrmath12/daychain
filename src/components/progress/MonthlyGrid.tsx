'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { WeekGridCell } from '@/components/progress/WeekGridCell'
import { determineCellState, calculatePeriodStats } from '@/lib/habits/utils'
import { getTodayLocalDate } from '@/lib/utils/date'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import type { Habit } from '@/types/domain'

interface Props {
  habits: Habit[]
  logsByHabit: Map<string, Set<string>>
  monthDays: Date[]
  onToggleCheck: (habitId: string, date: string, currentValue: boolean) => void
  isLoadingCell?: Set<string>
}

const STICKY_RIGHT_W = 64

export function MonthlyGrid({
  habits,
  logsByHabit,
  monthDays,
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

  function getDayTotals(dayStr: string): number {
    let done = 0
    for (const habit of habits) {
      if (habit.archivedAt !== null) continue
      const logs = logsByHabit.get(habit.id) ?? new Set<string>()
      const state = determineCellState(habit, dayStr, logs, today)
      if (state === 'done') done++
    }
    return done
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
      {/* Right scroll shadow — ends before sticky total column */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 z-30 w-10 transition-opacity duration-200"
        style={{
          right: STICKY_RIGHT_W,
          background: 'linear-gradient(to left, hsl(var(--background)), transparent)',
          opacity: canScrollRight ? 1 : 0,
        }}
      />

      <div
        ref={scrollRef}
        className="overflow-x-auto [&::-webkit-scrollbar]:h-[5px] [&::-webkit-scrollbar-track]:ml-[88px] lg:[&::-webkit-scrollbar-track]:ml-[148px] [&::-webkit-scrollbar-track]:mr-[64px] [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/60"
        style={
          {
            overscrollBehaviorX: 'contain',
            WebkitOverflowScrolling: 'touch',
          } as React.CSSProperties
        }
      >
        <table className="border-collapse text-sm" style={{ minWidth: 'max-content' }}>
          <thead>
            <tr>
              <th
                className="sticky left-0 z-20 bg-background px-2 py-2 text-left min-w-[88px] lg:min-w-[148px]"
                style={{
                  borderBottom: '2px solid hsl(var(--border))',
                  borderRight: '1px solid hsl(var(--border))',
                }}
              />

              {monthDays.map((day) => {
                const dayStr = format(day, 'yyyy-MM-dd')
                const isCurrentDay = dayStr === today
                return (
                  <th
                    key={dayStr}
                    className={`px-0 py-2 text-center font-normal min-w-[36px] ${
                      isCurrentDay ? 'bg-amber-50 dark:bg-amber-950/30' : ''
                    }`}
                    style={{ borderBottom: '2px solid hsl(var(--border))' }}
                  >
                    <span
                      className={`text-xs font-mono font-bold ${
                        isCurrentDay ? 'text-amber-600 dark:text-amber-400' : ''
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                  </th>
                )
              })}

              <th
                className="sticky right-0 z-20 bg-background px-3 py-2 text-center text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground min-w-[64px]"
                style={{
                  borderBottom: '2px solid hsl(var(--border))',
                  borderLeft: '1px solid hsl(var(--border))',
                }}
              >
                {t('progress.total')}
              </th>
            </tr>
          </thead>

          <tbody>
            {habits.map((habit) => {
              const isArchived = habit.archivedAt !== null
              const logs = logsByHabit.get(habit.id) ?? new Set<string>()
              const { checksCount, expectedCount } = calculatePeriodStats(habit, logs, monthDays)

              return (
                <tr key={habit.id} className="group">
                  <td className="sticky left-0 z-10 bg-background border-b border-r border-border px-2 py-0 group-hover:bg-muted/40 transition-colors min-w-[88px] lg:min-w-[148px]">
                    <div className="flex items-center gap-1.5 min-h-[44px]">
                      <span className="shrink-0 text-sm leading-none">{habit.emoji}</span>
                      <span
                        className={`truncate text-xs leading-tight font-medium max-w-[56px] lg:max-w-[112px] ${
                          isArchived ? 'text-muted-foreground/50 line-through' : ''
                        }`}
                        title={habit.name}
                      >
                        {habit.name}
                      </span>
                    </div>
                  </td>

                  {monthDays.map((day) => {
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
                          onToggle={() => onToggleCheck(habit.id, dayStr, state === 'done')}
                        />
                      </td>
                    )
                  })}

                  <td className="sticky right-0 z-10 bg-background border-b border-l border-border px-3 py-0 text-center group-hover:bg-muted/40 transition-colors min-w-[64px]">
                    <span className="text-xs font-mono tabular-nums text-muted-foreground">
                      {checksCount}/{expectedCount}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>

          <tfoot>
            <tr>
              <td
                className="sticky left-0 z-10 bg-background border-r border-border px-2 py-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground min-w-[88px] lg:min-w-[148px]"
                style={{ borderTop: '2px solid hsl(var(--border))' }}
              >
                {t('progress.total')}
              </td>
              {monthDays.map((day) => {
                const dayStr = format(day, 'yyyy-MM-dd')
                const done = getDayTotals(dayStr)
                const isCurrentDay = dayStr === today
                return (
                  <td
                    key={dayStr}
                    className={`px-0 py-2 text-center min-w-[36px] ${
                      isCurrentDay ? 'bg-amber-50 dark:bg-amber-950/30' : ''
                    }`}
                    style={{ borderTop: '2px solid hsl(var(--border))' }}
                  >
                    <span
                      className={`text-xs font-mono tabular-nums ${
                        done > 0
                          ? 'text-amber-600 dark:text-amber-400 font-bold'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {done}
                    </span>
                  </td>
                )
              })}
              <td
                className="sticky right-0 z-10 bg-background border-l border-border px-3 py-2 min-w-[64px]"
                style={{ borderTop: '2px solid hsl(var(--border))' }}
              />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
