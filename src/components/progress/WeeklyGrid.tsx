'use client'

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

function truncateName(name: string, max = 12): string {
  return name.length > max ? name.slice(0, max) + '…' : name
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
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        {t('progress.noChecks')}
      </div>
    )
  }

  return (
    <div
      className="overflow-x-auto"
      style={{ overscrollBehaviorX: 'contain' } as React.CSSProperties}
    >
      <table className="border-collapse text-sm" style={{ minWidth: 'max-content' }}>
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-background border-b border-r border-border px-3 py-2 text-left min-w-[148px]" />
            {weekDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd')
              const isCurrentDay = dayStr === today
              const dowKey = String(getISODay(day) as DayOfWeek)
              return (
                <th
                  key={dayStr}
                  className={`border-b border-border px-1 py-2 text-center min-w-[44px] font-normal ${
                    isCurrentDay ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs text-muted-foreground">
                      {t(`habits.days.${dowKey}`)}
                    </span>
                    <span className="text-sm font-semibold">{format(day, 'd')}</span>
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
              <tr key={habit.id}>
                <td className="sticky left-0 z-10 bg-background border-b border-r border-border px-3 py-0">
                  <div className="flex items-center gap-1.5 min-h-[44px] max-w-[140px]">
                    <span className="shrink-0 text-base leading-none">{habit.emoji}</span>
                    <span
                      className={`truncate text-sm leading-tight ${isArchived ? 'text-muted-foreground' : ''}`}
                      title={habit.name}
                    >
                      {isArchived ? '🗄️ ' : ''}
                      {truncateName(habit.name)}
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
                      className={`border-b border-border p-0 ${isCurrentDay ? 'bg-primary/10' : ''}`}
                    >
                      <WeekGridCell
                        state={state}
                        isLoading={isLoadingCell.has(cellKey)}
                        onToggle={() => onToggleCheck(habit.id, dayStr, state === 'done')}
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
            <td className="sticky left-0 z-10 bg-background border-t border-r border-border px-3 py-2 text-xs font-medium text-muted-foreground">
              {t('progress.total')}
            </td>
            {weekDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd')
              const { done, expected } = getDayTotals(dayStr)
              const isCurrentDay = dayStr === today
              return (
                <td
                  key={dayStr}
                  className={`border-t border-border px-1 py-2 text-center text-xs text-muted-foreground ${
                    isCurrentDay ? 'bg-primary/10' : ''
                  }`}
                >
                  {done}/{expected}
                </td>
              )
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
