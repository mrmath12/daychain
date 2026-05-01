import { getISODay } from 'date-fns'
import { parseLocalDate } from '@/lib/utils/date'
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

export function getArchivedHabitsWithLogsInPeriod(
  archivedHabits: Habit[],
  logsByHabit: Map<string, Set<string>>
): Habit[] {
  return archivedHabits.filter((h) => (logsByHabit.get(h.id)?.size ?? 0) > 0)
}
