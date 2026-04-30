import {
  format,
  parseISO,
  getISODay,
  subDays,
  addDays,
  isAfter,
  isBefore,
  differenceInDays,
} from 'date-fns'

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

export { format, parseISO, subDays, addDays, isAfter, isBefore, differenceInDays }
