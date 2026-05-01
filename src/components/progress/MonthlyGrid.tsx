'use client'

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

function truncateName(name: string, max = 7): string {
  return name.length > max ? name.slice(0, max) + '…' : name
}

export function MonthlyGrid({
  habits,
  logsByHabit,
  monthDays,
  onToggleCheck,
  isLoadingCell = new Set(),
}: Props) {
  const { t } = useAppTranslations()
  const today = getTodayLocalDate()

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
            {/* Habit name column — sticky left */}
            <th className="sticky left-0 z-20 bg-background border-b border-r border-border px-2 py-2 text-left min-w-[88px]" />

            {/* Day columns */}
            {monthDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd')
              const isCurrentDay = dayStr === today
              return (
                <th
                  key={dayStr}
                  className={`border-b border-border px-1 py-2 text-center min-w-[36px] font-normal ${
                    isCurrentDay ? 'bg-primary/10' : ''
                  }`}
                >
                  <span className="text-xs font-semibold">{format(day, 'd')}</span>
                </th>
              )
            })}

            {/* Total column — sticky right */}
            <th className="sticky right-0 z-20 bg-background border-b border-l border-border px-3 py-2 text-center min-w-[64px] text-xs font-medium text-muted-foreground">
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
              <tr key={habit.id}>
                {/* Habit name — sticky left */}
                <td className="sticky left-0 z-10 bg-background border-b border-r border-border px-2 py-0">
                  <div className="flex items-center gap-1 min-h-[44px] max-w-[84px]">
                    <span className="shrink-0 text-sm leading-none">{habit.emoji}</span>
                    <span
                      className={`truncate text-xs leading-tight ${isArchived ? 'text-muted-foreground' : ''}`}
                      title={habit.name}
                    >
                      {isArchived ? '🗄️' : ''}
                      {truncateName(habit.name)}
                    </span>
                  </div>
                </td>

                {/* Day cells */}
                {monthDays.map((day) => {
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

                {/* Total — sticky right */}
                <td className="sticky right-0 z-10 bg-background border-b border-l border-border px-3 py-0 text-center">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {checksCount}/{expectedCount}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>

        <tfoot>
          <tr>
            <td className="sticky left-0 z-10 bg-background border-t border-r border-border px-2 py-2 text-xs font-medium text-muted-foreground">
              {t('progress.total')}
            </td>
            {monthDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd')
              const done = getDayTotals(dayStr)
              const isCurrentDay = dayStr === today
              return (
                <td
                  key={dayStr}
                  className={`border-t border-border px-1 py-2 text-center text-xs text-muted-foreground tabular-nums ${
                    isCurrentDay ? 'bg-primary/10' : ''
                  }`}
                >
                  {done}
                </td>
              )
            })}
            {/* Empty corner cell for Total column */}
            <td className="sticky right-0 z-10 bg-background border-t border-l border-border px-3 py-2" />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
