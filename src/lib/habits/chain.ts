import { addDays, differenceInDays, format, isAfter, isBefore, parseISO, subDays } from 'date-fns'
import { MAX_CHAIN_LOOKBACK_DAYS, MAX_SHIELDS } from '@/lib/utils/constants'
import { getISODayOfWeek } from '@/lib/utils/date'
import type { DayOfWeek } from '@/types/domain'

/**
 * Calcula a chain atual de um hábito.
 * Conta de ontem para trás, parando no primeiro dia esperado sem check.
 * "Hoje" não conta — ainda pode ser marcado.
 */
export function calculateCurrentChain(
  frequency: DayOfWeek[],
  loggedDates: Set<string>,
  today: Date
): number {
  if (frequency.length === 0) return 0

  let cursor = subDays(today, 1)
  let chain = 0

  while (true) {
    const dow = getISODayOfWeek(cursor)
    if (frequency.includes(dow as DayOfWeek)) {
      if (loggedDates.has(format(cursor, 'yyyy-MM-dd'))) {
        chain++
      } else {
        break
      }
    }
    cursor = subDays(cursor, 1)
    if (differenceInDays(today, cursor) > MAX_CHAIN_LOOKBACK_DAYS) break
  }
  return chain
}

/**
 * Calcula a chain máxima histórica de um hábito.
 * Varre todos os dias desde a criação do hábito até hoje.
 */
export function calculateMaxChain(
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

/**
 * Calcula chain atual e escudos disponíveis com scan para frente no tempo.
 * Escudos (máx MAX_SHIELDS) são ganhos em dias fora da frequency e consumidos
 * ao proteger dias esperados perdidos. "Hoje" não é avaliado.
 */
export function calculateChainWithShields(
  frequency: DayOfWeek[],
  loggedDates: Set<string>,
  today: Date
): { chain: number; shields: number } {
  if (frequency.length === 0) return { chain: 0, shields: 0 }

  let chain = 0
  let shields = 0
  let chainRunning = false

  let cursor = subDays(today, MAX_CHAIN_LOOKBACK_DAYS)

  while (isBefore(cursor, today)) {
    const dow = getISODayOfWeek(cursor)
    const dateStr = format(cursor, 'yyyy-MM-dd')

    if (frequency.includes(dow as DayOfWeek)) {
      if (loggedDates.has(dateStr)) {
        // Shields accumulated during a broken chain don't carry into a new one
        if (!chainRunning) shields = 0
        chain++
        chainRunning = true
      } else if (shields > 0) {
        shields--
        chain++
        chainRunning = true
      } else {
        if (chainRunning) chain = 0
        chainRunning = false
      }
    } else {
      if (loggedDates.has(dateStr)) {
        shields = Math.min(shields + 1, MAX_SHIELDS)
      }
    }

    cursor = addDays(cursor, 1)
  }

  return { chain, shields }
}

// Backward-compat aliases (Portuguese names used in existing call sites)
export function calcularChainAtual(frequency: number[], logs: Set<string>, hoje: Date): number {
  return calculateCurrentChain(frequency as DayOfWeek[], logs, hoje)
}

export function calcularChainMaximo(
  frequency: number[],
  logs: Set<string>,
  createdAt: Date,
  hoje: Date
): number {
  return calculateMaxChain(frequency as DayOfWeek[], logs, createdAt, hoje)
}
