import { format, getISODay, parseISO } from 'date-fns'

export function toLocalDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function fromLocalDateString(dateStr: string): Date {
  return parseISO(dateStr)
}

// Returns ISO day of week: 1=Monday … 7=Sunday
export function getDayOfWeek(date: Date): number {
  return getISODay(date)
}

export function todayString(): string {
  return toLocalDateString(new Date())
}
