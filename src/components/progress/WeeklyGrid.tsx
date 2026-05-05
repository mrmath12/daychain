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
      <div className="flex items-center justify-center h-32 text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {t('progress.noChecks')}
      </div>
    )
  }

  return (
    <div
      className="overflow-x-auto w-full"
      style={{ overscrollBehaviorX: 'contain' } as React.CSSProperties}
    >
      <table
        className="border-collapse text-sm w-full"
        style={{ tableLayout: 'fixed', minWidth: '420px' }}
      >
        <colgroup>
          <col style={{ width: '148px' }} />
          {weekDays.map((day) => (
            <col key={format(day, 'yyyy-MM-dd')} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th
              className="sticky left-0 z-10 bg-background px-3 py-2 text-left"
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
                  className={`px-1 py-2 text-center font-normal ${
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
                <td className="sticky left-0 z-10 bg-background border-b border-r border-border px-3 py-0 group-hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-2 min-h-[54px] max-w-[140px]">
                    <span className="shrink-0 text-base leading-none">{habit.emoji}</span>
                    <span
                      className={`truncate text-sm leading-tight font-medium ${
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
                      className={`border-b border-border p-0 ${
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
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td
              className="sticky left-0 z-10 bg-background border-r border-border px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground"
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
                  className={`px-1 py-2 text-center ${
                    isCurrentDay ? 'bg-amber-50 dark:bg-amber-950/30' : ''
                  }`}
                  style={{ borderTop: '2px solid hsl(var(--border))' }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`text-xs font-mono font-bold tabular-nums ${
                        allDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
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
  )
}
