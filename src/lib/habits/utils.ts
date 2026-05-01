import { getISODay, format } from 'date-fns'
import { parseLocalDate, getTodayLocalDate } from '@/lib/utils/date'
import type { DayOfWeek, Habit } from '@/types/domain'

export type CellState =
  | 'done'
  | 'pending'
  | 'future'
  | 'not-expected'
  | 'archived-done'
  | 'archived-pending'

export function determineCellState(
  habit: Habit,
  dateStr: string, // "YYYY-MM-DD"
  logs: Set<string>,
  today: string // "YYYY-MM-DD"
): CellState {
  const isDone = logs.has(dateStr)
  const isArchived = habit.archivedAt !== null
  const dayOfWeek = getISODay(parseLocalDate(dateStr)) as DayOfWeek
  const isExpectedDay = habit.frequency.includes(dayOfWeek)
  const createdDate = habit.createdAt.slice(0, 10) // UTC date from ISO timestamp
  const isBeforeCreation = dateStr < createdDate
  const isFuture = dateStr > today

  if (!isExpectedDay || isBeforeCreation) {
    return 'not-expected'
  }

  if (isArchived) {
    return isDone ? 'archived-done' : 'archived-pending'
  }

  if (isFuture) {
    return 'future'
  }

  return isDone ? 'done' : 'pending'
}

// Calculates check count and expected day count for a habit over a set of period days.
// Expected days = days where habit is due (frequency match, after creation, not future).
export function calculatePeriodStats(
  habit: Habit,
  loggedDates: Set<string>,
  periodDays: Date[]
): { checksCount: number; expectedCount: number } {
  const today = getTodayLocalDate()
  let checksCount = 0
  let expectedCount = 0

  for (const day of periodDays) {
    const dateStr = format(day, 'yyyy-MM-dd')
    const state = determineCellState(habit, dateStr, loggedDates, today)
    if (state === 'done' || state === 'archived-done') {
      checksCount++
      expectedCount++
    } else if (state === 'pending' || state === 'archived-pending') {
      expectedCount++
    }
  }

  return { checksCount, expectedCount }
}

export function getArchivedHabitsWithLogsInPeriod(
  archivedHabits: Habit[],
  logsByHabit: Map<string, Set<string>>
): Habit[] {
  return archivedHabits.filter((h) => (logsByHabit.get(h.id)?.size ?? 0) > 0)
}
