'use client'

import { useAppTranslations } from '@/hooks/useAppTranslations'
import type { Habit } from '@/types/domain'

interface Props {
  habits: Habit[]
  countsByHabitYear: Map<string, number> // key: `${habitId}:${year}`
  years: number[]
}

function truncateName(name: string, max = 9): string {
  return name.length > max ? name.slice(0, max) + '…' : name
}

export function AnnualConsistencyTable({ habits, countsByHabitYear, years }: Props) {
  const { t } = useAppTranslations()
  const currentYear = new Date().getFullYear()

  if (habits.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {t('progress.noChecks')}
      </div>
    )
  }

  function getCount(habitId: string, year: number): number {
    return countsByHabitYear.get(`${habitId}:${year}`) ?? 0
  }

  function getYearTotal(year: number): number {
    return habits.reduce((sum, h) => sum + getCount(h.id, year), 0)
  }

  function getHabitTotal(habitId: string): number {
    return years.reduce((sum, year) => sum + getCount(habitId, year), 0)
  }

  return (
    <div
      className="overflow-x-auto w-full"
      style={{ overscrollBehaviorX: 'contain' } as React.CSSProperties}
    >
      <table
        className="border-collapse text-sm w-full"
        style={{ tableLayout: 'auto', minWidth: `${64 + habits.length * 80 + 64}px` }}
      >
        <thead>
          <tr>
            <th
              className="sticky left-0 z-10 bg-background px-3 py-2 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
              style={{
                borderBottom: '2px solid hsl(var(--border))',
                borderRight: '1px solid hsl(var(--border))',
                minWidth: '64px',
              }}
            >
              {t('progress.yearColumn')}
            </th>
            {habits.map((habit) => {
              const isArchived = habit.archivedAt !== null
              return (
                <th
                  key={habit.id}
                  className="px-2 py-2 text-center font-normal"
                  style={{
                    borderBottom: '2px solid hsl(var(--border))',
                    minWidth: '72px',
                    maxWidth: '96px',
                  }}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-base leading-none">{habit.emoji}</span>
                    <span
                      className={`text-[10px] font-mono uppercase tracking-tight leading-tight max-w-[80px] truncate ${
                        isArchived ? 'text-muted-foreground/40' : 'text-muted-foreground'
                      }`}
                      title={isArchived ? `${habit.name} (arquivado)` : habit.name}
                    >
                      {truncateName(habit.name)}
                      {isArchived ? ' 🗄️' : ''}
                    </span>
                  </div>
                </th>
              )
            })}
            <th
              className="sticky right-0 z-10 bg-background px-3 py-2 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
              style={{
                borderBottom: '2px solid hsl(var(--border))',
                borderLeft: '1px solid hsl(var(--border))',
                minWidth: '64px',
              }}
            >
              {t('progress.total')}
            </th>
          </tr>
        </thead>
        <tbody>
          {years.map((year) => {
            const yearTotal = getYearTotal(year)
            const isCurrentYear = year === currentYear
            return (
              <tr key={year}>
                <td
                  className="sticky left-0 z-10 bg-background border-b border-r border-border px-3 py-2.5"
                  style={isCurrentYear ? { background: 'hsl(var(--background))' } : undefined}
                >
                  <span
                    className={`text-sm font-mono font-semibold tabular-nums ${
                      isCurrentYear ? 'text-amber-600 dark:text-amber-400' : ''
                    }`}
                  >
                    {year}
                  </span>
                </td>
                {habits.map((habit) => {
                  const count = getCount(habit.id, year)
                  const isArchived = habit.archivedAt !== null
                  return (
                    <td key={habit.id} className="border-b border-border px-2 py-2.5 text-center">
                      <span
                        className={`text-sm font-mono tabular-nums ${
                          count > 0
                            ? isArchived
                              ? 'font-semibold text-muted-foreground/50'
                              : 'font-semibold text-foreground'
                            : 'text-muted-foreground/25'
                        }`}
                      >
                        {count}
                      </span>
                    </td>
                  )
                })}
                <td className="sticky right-0 z-10 bg-background border-b border-l border-border px-3 py-2.5 text-center">
                  <span
                    className={`text-sm font-mono font-bold tabular-nums ${
                      isCurrentYear ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                    }`}
                  >
                    {yearTotal}
                  </span>
                </td>
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
            {habits.map((habit) => {
              const habitTotal = getHabitTotal(habit.id)
              return (
                <td
                  key={habit.id}
                  className="px-2 py-2 text-center"
                  style={{ borderTop: '2px solid hsl(var(--border))' }}
                >
                  <span className="text-sm font-mono font-bold tabular-nums text-muted-foreground">
                    {habitTotal}
                  </span>
                </td>
              )
            })}
            <td
              className="sticky right-0 z-10 bg-background border-l border-border px-3 py-2"
              style={{ borderTop: '2px solid hsl(var(--border))' }}
            />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
