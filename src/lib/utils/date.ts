import {
  format,
  parseISO,
  getISODay,
  subDays,
  addDays,
  isAfter,
  isBefore,
  differenceInDays,
  startOfISOWeek,
  getISOWeek,
  getISOWeekYear,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from 'date-fns'
import type { DayOfWeek, Habit } from '@/types/domain'

export function getTodayLocalDate(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getISODayOfWeek(date: Date): number {
  return getISODay(date)
}

// Parses "YYYY-MM-DD" to local Date at noon to avoid timezone drift
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0)
}

// Returns greeting key based on local hour: 05–11 = morning, 12–17 = afternoon, 18–04 = evening
export function getGreeting(hour: number): 'morning' | 'afternoon' | 'evening' {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'evening'
}

// Returns the ISO day of week for today (1=Mon…7=Sun)
export function getTodayDayOfWeek(): DayOfWeek {
  return getISODay(new Date()) as DayOfWeek
}

// Filters habits expected for today: not archived and frequency includes today's day
export function getHabitsForToday(habits: Habit[]): Habit[] {
  const today = getTodayDayOfWeek()
  return habits.filter((h) => !h.archivedAt && h.frequency.includes(today))
}

export function getWeekStart(date: Date): Date {
  const start = startOfISOWeek(date)
  return new Date(start.getFullYear(), start.getMonth(), start.getDate(), 12, 0, 0)
}

export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date)
  return addDays(start, 6)
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

export function getWeekIdentifier(date: Date): string {
  const week = getISOWeek(date)
  const year = getISOWeekYear(date)
  return `${year}-W${String(week).padStart(2, '0')}`
}

export function parseWeekIdentifier(weekId: string): Date {
  const [yearStr, weekStr] = weekId.split('-W')
  const year = parseInt(yearStr, 10)
  const week = parseInt(weekStr, 10)
  const jan4 = new Date(year, 0, 4, 12, 0, 0)
  const week1Monday = startOfISOWeek(jan4)
  const result = addDays(week1Monday, (week - 1) * 7)
  return new Date(result.getFullYear(), result.getMonth(), result.getDate(), 12, 0, 0)
}

export function isToday(date: Date): boolean {
  return format(date, 'yyyy-MM-dd') === getTodayLocalDate()
}

export function isFutureDate(date: Date): boolean {
  return format(date, 'yyyy-MM-dd') > getTodayLocalDate()
}

export {
  startOfMonth as getMonthStart,
  endOfMonth as getMonthEnd,
  getDaysInMonth,
  isLeapYear,
} from 'date-fns'

// Returns all days of the given month as Date[] at noon (avoids timezone drift)
export function getMonthDays(year: number, month: number): Date[] {
  const ref = new Date(year, month - 1, 1, 12, 0, 0)
  return eachDayOfInterval({ start: startOfMonth(ref), end: endOfMonth(ref) }).map(
    (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0)
  )
}

export function getMonthIdentifier(date: Date): string {
  return format(date, 'yyyy-MM')
}

export function parseMonthIdentifier(monthId: string): { year: number; month: number } {
  const [yearStr, monthStr] = monthId.split('-')
  return { year: parseInt(yearStr, 10), month: parseInt(monthStr, 10) }
}

export function navigateMonth(
  year: number,
  month: number,
  delta: number
): { year: number; month: number } {
  const d = new Date(year, month - 1 + delta, 1, 12, 0, 0)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

export { format, parseISO, subDays, addDays, isAfter, isBefore, differenceInDays }
