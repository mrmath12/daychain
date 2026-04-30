import { addDays, differenceInDays, format, getISODay, isAfter, parseISO, subDays } from 'date-fns'
import { MAX_STREAK_LOOKBACK_DAYS } from '@/lib/utils/constants'

export function calcularStreakAtual(frequency: number[], logs: Set<string>, hoje: Date): number {
  let cursor = subDays(hoje, 1)
  let streak = 0

  while (true) {
    const dow = getISODay(cursor)
    if (frequency.includes(dow)) {
      if (logs.has(format(cursor, 'yyyy-MM-dd'))) {
        streak++
      } else {
        break
      }
    }
    cursor = subDays(cursor, 1)
    if (differenceInDays(hoje, cursor) > MAX_STREAK_LOOKBACK_DAYS) break
  }
  return streak
}

export function calcularStreakMaximo(
  frequency: number[],
  logs: Set<string>,
  createdAt: Date,
  hoje: Date
): number {
  let max = 0
  let corrente = 0
  let cursor = createdAt

  while (!isAfter(cursor, hoje)) {
    const dow = getISODay(cursor)
    if (frequency.includes(dow)) {
      if (logs.has(format(cursor, 'yyyy-MM-dd'))) {
        corrente++
        max = Math.max(max, corrente)
      } else {
        corrente = 0
      }
    }
    cursor = addDays(cursor, 1)
  }
  return max
}

export function calcularProgressoDesafio(
  logs: Set<string>,
  startDate: string,
  endDate: string,
  today: Date
): number {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  const effectiveEnd = isAfter(end, today) ? today : end

  let count = 0
  let cursor = start
  while (!isAfter(cursor, effectiveEnd)) {
    if (logs.has(format(cursor, 'yyyy-MM-dd'))) count++
    cursor = addDays(cursor, 1)
  }
  return count
}
