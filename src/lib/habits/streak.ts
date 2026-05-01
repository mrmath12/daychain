import { addDays, differenceInDays, format, isAfter, parseISO, subDays } from 'date-fns'
import { MAX_STREAK_LOOKBACK_DAYS } from '@/lib/utils/constants'
import { getISODayOfWeek } from '@/lib/utils/date'
import type { DayOfWeek } from '@/types/domain'

/**
 * Calcula o streak atual de um hábito.
 * Conta de ontem para trás, parando no primeiro dia esperado sem check.
 * "Hoje" não conta — ainda pode ser marcado.
 */
export function calculateCurrentStreak(
  frequency: DayOfWeek[],
  loggedDates: Set<string>,
  today: Date
): number {
  if (frequency.length === 0) return 0

  let cursor = subDays(today, 1)
  let streak = 0

  while (true) {
    const dow = getISODayOfWeek(cursor)
    if (frequency.includes(dow as DayOfWeek)) {
      if (loggedDates.has(format(cursor, 'yyyy-MM-dd'))) {
        streak++
      } else {
        break
      }
    }
    cursor = subDays(cursor, 1)
    if (differenceInDays(today, cursor) > MAX_STREAK_LOOKBACK_DAYS) break
  }
  return streak
}

/**
 * Calcula o streak máximo histórico de um hábito.
 * Varre todos os dias desde a criação do hábito até hoje.
 */
export function calculateMaxStreak(
  frequency: DayOfWeek[],
  loggedDates: Set<string>,
  habitCreatedAt: Date,
  today: Date
): number {
  if (frequency.length === 0) return 0

  let max = 0
  let corrente = 0
  let cursor = habitCreatedAt

  while (!isAfter(cursor, today)) {
    const dow = getISODayOfWeek(cursor)
    if (frequency.includes(dow as DayOfWeek)) {
      if (loggedDates.has(format(cursor, 'yyyy-MM-dd'))) {
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

/**
 * Calcula a consistência de um hábito em um período.
 * Retorna valor de 0 a 100 (inteiro, arredondado para baixo).
 */
export function calculateConsistencyPercentage(
  frequency: DayOfWeek[],
  loggedDates: Set<string>,
  periodStart: Date,
  periodEnd: Date
): number {
  if (frequency.length === 0) return 0

  let expected = 0
  let checked = 0
  let cursor = periodStart

  while (!isAfter(cursor, periodEnd)) {
    const dow = getISODayOfWeek(cursor)
    if (frequency.includes(dow as DayOfWeek)) {
      expected++
      if (loggedDates.has(format(cursor, 'yyyy-MM-dd'))) {
        checked++
      }
    }
    cursor = addDays(cursor, 1)
  }

  if (expected === 0) return 0
  return Math.floor((checked / expected) * 100)
}

// Calcula o progresso de um desafio (checks no período start→end, limitado a hoje)
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

// Backward-compat aliases (Portuguese names used in existing call sites)
export function calcularStreakAtual(frequency: number[], logs: Set<string>, hoje: Date): number {
  return calculateCurrentStreak(frequency as DayOfWeek[], logs, hoje)
}

export function calcularStreakMaximo(
  frequency: number[],
  logs: Set<string>,
  createdAt: Date,
  hoje: Date
): number {
  return calculateMaxStreak(frequency as DayOfWeek[], logs, createdAt, hoje)
}
