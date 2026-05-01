import { subDays, format } from 'date-fns'
import { MAX_STREAK_LOOKBACK_DAYS } from '@/lib/utils/constants'
import {
  calculateCurrentStreak,
  calculateMaxStreak,
  calculateConsistencyPercentage,
} from '../streak'
import type { DayOfWeek } from '@/types/domain'

// All days of the week
const ALL_DAYS: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 7]
// Mon / Wed / Fri
const MWF: DayOfWeek[] = [1, 3, 5]

function dateSet(...dates: string[]): Set<string> {
  return new Set(dates)
}

// ---------------------------------------------------------------------------
// calculateCurrentStreak
// ---------------------------------------------------------------------------

describe('calculateCurrentStreak', () => {
  // PRD table case 1 — daily, 5 consecutive days, today = Saturday
  // Today = Saturday Apr 5 2025 (ISO day 6)
  // Logs: Mon Mar 31 … Fri Apr 4 (5 days)
  test('hábito diário com 5 checks consecutivos retorna streak 5', () => {
    const today = new Date(2025, 3, 5) // Apr 5, 2025 (Sat)
    const logs = dateSet(
      '2025-04-04', // Fri
      '2025-04-03', // Thu
      '2025-04-02', // Wed
      '2025-04-01', // Tue
      '2025-03-31' // Mon
    )
    expect(calculateCurrentStreak(ALL_DAYS, logs, today)).toBe(5)
  })

  // PRD table case 2 — daily, today not marked, yesterday and day before done
  // Today = Apr 5 2025 (Sat); logs: Apr 4 and Apr 3 only
  test('hoje não marcado, ontem e anteontem feitos retorna 2', () => {
    const today = new Date(2025, 3, 5) // Apr 5, 2025 (Sat)
    const logs = dateSet('2025-04-04', '2025-04-03')
    expect(calculateCurrentStreak(ALL_DAYS, logs, today)).toBe(2)
  })

  // PRD table case 3 — Mon/Wed/Fri, 2 complete weeks (6 occurrences), streak = 6
  // Today = Apr 28 2025 (Mon)
  // Last 2 weeks: Apr 14 (Mon), Apr 16 (Wed), Apr 18 (Fri) + Apr 21 (Mon), Apr 23 (Wed), Apr 25 (Fri)
  test('academia seg/qua/sex — 2 semanas completas retorna 6', () => {
    const today = new Date(2025, 3, 28) // Apr 28, 2025 (Mon)
    const logs = dateSet(
      '2025-04-25', // Fri
      '2025-04-23', // Wed
      '2025-04-21', // Mon
      '2025-04-18', // Fri
      '2025-04-16', // Wed
      '2025-04-14' // Mon
    )
    expect(calculateCurrentStreak(MWF, logs, today)).toBe(6)
  })

  // PRD table case 4 — Mon/Wed/Fri, did Mon and Wed but NOT Fri → streak = 0
  // Today = Apr 28 (Mon); last Fri (Apr 25) not done
  test('academia seg/qua/sex — fez seg e qua mas não sex retorna 0', () => {
    const today = new Date(2025, 3, 28) // Apr 28, 2025 (Mon)
    const logs = dateSet(
      '2025-04-23', // Wed
      '2025-04-21' // Mon — Fri Apr 25 intentionally missing
    )
    expect(calculateCurrentStreak(MWF, logs, today)).toBe(0)
  })

  // PRD table case 5 — Mon/Wed/Fri, today = Tue, did Mon yesterday → streak = 1
  // Today = Apr 29 2025 (Tue); Mon Apr 28 logged
  test('academia seg/qua/sex — hoje=ter, fez seg ontem retorna 1', () => {
    const today = new Date(2025, 3, 29) // Apr 29, 2025 (Tue)
    const logs = dateSet('2025-04-28') // Mon
    expect(calculateCurrentStreak(MWF, logs, today)).toBe(1)
  })

  // PRD table case 6 — habit created today, no checks → 0
  test('hábito criado hoje sem checks retorna 0', () => {
    const today = new Date(2025, 3, 28) // Apr 28, 2025 (Mon)
    expect(calculateCurrentStreak(ALL_DAYS, dateSet(), today)).toBe(0)
  })

  // Edge: empty frequency always returns 0
  test('frequency vazia retorna 0', () => {
    const today = new Date(2025, 3, 28)
    const logs = dateSet('2025-04-27', '2025-04-26', '2025-04-25')
    expect(calculateCurrentStreak([], logs, today)).toBe(0)
  })

  // Edge: empty log set returns 0
  test('loggedDates vazio retorna 0', () => {
    const today = new Date(2025, 3, 28)
    expect(calculateCurrentStreak(MWF, dateSet(), today)).toBe(0)
  })

  // Edge: non-expected days between expected days do NOT break the streak
  // Today = Tue Apr 29; freq = Mon/Wed/Fri; logs include Mon Apr 28 + Fri Apr 25 + Wed Apr 23
  // The Sat/Sun/Tue between them must be silently skipped
  test('streak não quebra por dia não esperado entre dias esperados', () => {
    const today = new Date(2025, 3, 29) // Tue Apr 29
    const logs = dateSet(
      '2025-04-28', // Mon
      '2025-04-25', // Fri
      '2025-04-23', // Wed
      '2025-04-21' // Mon
    )
    expect(calculateCurrentStreak(MWF, logs, today)).toBe(4)
  })

  // Edge: weekly habit (Sunday only) — 3 consecutive Sundays
  // Today = Mon Apr 28 2025; Sundays: Apr 27, Apr 20, Apr 13
  test('hábito semanal (só domingo) — fez últimos 3 domingos retorna 3', () => {
    const today = new Date(2025, 3, 28) // Mon Apr 28
    const logs = dateSet('2025-04-27', '2025-04-20', '2025-04-13')
    expect(calculateCurrentStreak([7], logs, today)).toBe(3)
  })

  // Edge: today's log is in loggedDates but today is not an expected day
  // Today = Tue Apr 29; freq = MWF; today logged (Tue, not expected) — must not affect streak
  test('check hoje mas hoje não é dia esperado retorna streak correto sem contar hoje', () => {
    const today = new Date(2025, 3, 29) // Tue Apr 29
    const logs = dateSet(
      '2025-04-29', // Tue — today, NOT expected, should be ignored
      '2025-04-28', // Mon ✓
      '2025-04-25', // Fri ✓
      '2025-04-23' // Wed ✓
    )
    // Starts from Apr 28 (Mon) backwards: Mon✓, (Sun/Sat skip), Fri✓, (Thu skip), Wed✓, (Tue skip), Mon Apr 21 missing → break
    expect(calculateCurrentStreak(MWF, logs, today)).toBe(3)
  })

  // Edge: lookback hard-cap at MAX_STREAK_LOOKBACK_DAYS
  // Create logs for 731 consecutive days before today — result must be exactly MAX_STREAK_LOOKBACK_DAYS
  test('streak máximo de lookback não ultrapassa MAX_STREAK_LOOKBACK_DAYS', () => {
    const today = new Date(2025, 3, 28) // Apr 28, 2025
    const logs = new Set<string>()
    for (let i = 1; i <= MAX_STREAK_LOOKBACK_DAYS + 1; i++) {
      logs.add(format(subDays(today, i), 'yyyy-MM-dd'))
    }
    expect(calculateCurrentStreak(ALL_DAYS, logs, today)).toBe(MAX_STREAK_LOOKBACK_DAYS)
  })
})

// ---------------------------------------------------------------------------
// calculateMaxStreak
// ---------------------------------------------------------------------------

describe('calculateMaxStreak', () => {
  // No checks → max = 0
  test('retorna 0 para hábito sem checks', () => {
    const createdAt = new Date(2025, 0, 1) // Jan 1, 2025
    const today = new Date(2025, 3, 28) // Apr 28, 2025
    expect(calculateMaxStreak(ALL_DAYS, dateSet(), createdAt, today)).toBe(0)
  })

  // Sequence of 10 broken, then sequence of 5 → max = 10
  // createdAt = Jan 6, 2025 (Mon); today = Jan 31, 2025 (Fri)
  // Logs: Jan 6-15 (10 consecutive) + Jan 21-25 (5 consecutive)
  test('sequência de 10 quebrada em 5 — retorna 10 como máximo', () => {
    const createdAt = new Date(2025, 0, 6) // Jan 6, 2025
    const today = new Date(2025, 0, 31) // Jan 31, 2025
    const logs = dateSet(
      '2025-01-06',
      '2025-01-07',
      '2025-01-08',
      '2025-01-09',
      '2025-01-10',
      '2025-01-11',
      '2025-01-12',
      '2025-01-13',
      '2025-01-14',
      '2025-01-15',
      // gap Jan 16-20
      '2025-01-21',
      '2025-01-22',
      '2025-01-23',
      '2025-01-24',
      '2025-01-25'
    )
    expect(calculateMaxStreak(ALL_DAYS, logs, createdAt, today)).toBe(10)
  })

  // Multiple sequences — return the largest one
  // Sequences: 3, 7, 2 → max = 7
  test('múltiplas sequências — retorna a maior', () => {
    const createdAt = new Date(2025, 0, 1) // Jan 1, 2025
    const today = new Date(2025, 0, 31) // Jan 31, 2025
    const logs = dateSet(
      // Seq 1: 3 days (Jan 1-3)
      '2025-01-01',
      '2025-01-02',
      '2025-01-03',
      // gap Jan 4-5
      // Seq 2: 7 days (Jan 6-12)
      '2025-01-06',
      '2025-01-07',
      '2025-01-08',
      '2025-01-09',
      '2025-01-10',
      '2025-01-11',
      '2025-01-12',
      // gap Jan 13-20
      // Seq 3: 2 days (Jan 21-22)
      '2025-01-21',
      '2025-01-22'
    )
    expect(calculateMaxStreak(ALL_DAYS, logs, createdAt, today)).toBe(7)
  })

  // Daily habit never broken — max equals total days since creation (inclusive)
  // createdAt = Apr 23 (Wed), today = Apr 27 (Sun) = 5 days, all logged
  test('hábito diário nunca quebrado — retorna total de dias desde criação', () => {
    const createdAt = new Date(2025, 3, 23) // Apr 23, 2025 (Wed)
    const today = new Date(2025, 3, 27) // Apr 27, 2025 (Sun)
    const logs = dateSet('2025-04-23', '2025-04-24', '2025-04-25', '2025-04-26', '2025-04-27')
    expect(calculateMaxStreak(ALL_DAYS, logs, createdAt, today)).toBe(5)
  })

  // Mon/Wed/Fri — all 10 expected days done across 4 weeks; non-expected days must be skipped
  // createdAt = Apr 7 (Mon), today = Apr 28 (Mon) — 10 expected MWF days
  test('academia seg/qua/sex — calcular corretamente ignorando dias não esperados', () => {
    const createdAt = new Date(2025, 3, 7) // Apr 7, 2025 (Mon)
    const today = new Date(2025, 3, 28) // Apr 28, 2025 (Mon)
    const logs = dateSet(
      '2025-04-07', // Mon
      '2025-04-09', // Wed
      '2025-04-11', // Fri
      '2025-04-14', // Mon
      '2025-04-16', // Wed
      '2025-04-18', // Fri
      '2025-04-21', // Mon
      '2025-04-23', // Wed
      '2025-04-25', // Fri
      '2025-04-28' // Mon
    )
    expect(calculateMaxStreak(MWF, logs, createdAt, today)).toBe(10)
  })

  // frequency vazia retorna 0
  test('frequency vazia retorna 0', () => {
    const createdAt = new Date(2025, 0, 1)
    const today = new Date(2025, 3, 28)
    const logs = dateSet('2025-01-01', '2025-01-02')
    expect(calculateMaxStreak([], logs, createdAt, today)).toBe(0)
  })

  // Streak máximo = 10; streak atual = 3 → max still 10 (current break doesn't erase history)
  test('quebra no streak atual não altera streak máximo histórico', () => {
    const createdAt = new Date(2025, 0, 1) // Jan 1
    const today = new Date(2025, 3, 28) // Apr 28
    // 10 days in Jan, then a gap, then only 3 recent days
    const logs = dateSet(
      '2025-01-01',
      '2025-01-02',
      '2025-01-03',
      '2025-01-04',
      '2025-01-05',
      '2025-01-06',
      '2025-01-07',
      '2025-01-08',
      '2025-01-09',
      '2025-01-10',
      // gap
      '2025-04-26',
      '2025-04-27' // only 2 recent (current streak = 2 as of Apr 28)
    )
    expect(calculateMaxStreak(ALL_DAYS, logs, createdAt, today)).toBe(10)
  })
})

// ---------------------------------------------------------------------------
// calculateConsistencyPercentage
// ---------------------------------------------------------------------------
// February 2025 starts on Saturday → weekdays = Feb 3-7, 10-14, 17-21, 24-28 = 20 days
// Using freq=[1,2,3,4,5] (Mon-Fri) in Feb 2025 gives exactly 20 expected days.

const FEB_2025_START = new Date(2025, 1, 1) // Feb 1, 2025
const FEB_2025_END = new Date(2025, 1, 28) // Feb 28, 2025
const WEEKDAYS: DayOfWeek[] = [1, 2, 3, 4, 5]

const ALL_FEB_WEEKDAYS = [
  '2025-02-03',
  '2025-02-04',
  '2025-02-05',
  '2025-02-06',
  '2025-02-07',
  '2025-02-10',
  '2025-02-11',
  '2025-02-12',
  '2025-02-13',
  '2025-02-14',
  '2025-02-17',
  '2025-02-18',
  '2025-02-19',
  '2025-02-20',
  '2025-02-21',
  '2025-02-24',
  '2025-02-25',
  '2025-02-26',
  '2025-02-27',
  '2025-02-28',
] // 20 weekdays

describe('calculateConsistencyPercentage', () => {
  test('0 checks em mês com 20 dias esperados retorna 0', () => {
    expect(calculateConsistencyPercentage(WEEKDAYS, dateSet(), FEB_2025_START, FEB_2025_END)).toBe(
      0
    )
  })

  test('20 checks em mês com 20 dias esperados retorna 100', () => {
    expect(
      calculateConsistencyPercentage(
        WEEKDAYS,
        dateSet(...ALL_FEB_WEEKDAYS),
        FEB_2025_START,
        FEB_2025_END
      )
    ).toBe(100)
  })

  test('15 checks em mês com 20 dias esperados retorna 75', () => {
    const logs = dateSet(...ALL_FEB_WEEKDAYS.slice(0, 15))
    expect(calculateConsistencyPercentage(WEEKDAYS, logs, FEB_2025_START, FEB_2025_END)).toBe(75)
  })

  test('arredondamento para baixo: 14/20 = floor(70) = 70', () => {
    const logs = dateSet(...ALL_FEB_WEEKDAYS.slice(0, 14))
    expect(calculateConsistencyPercentage(WEEKDAYS, logs, FEB_2025_START, FEB_2025_END)).toBe(70)
  })

  test('período sem dias esperados retorna 0', () => {
    // freq = Sunday only, period = Mon-Fri only (no Sunday in range)
    const start = new Date(2025, 1, 3) // Mon Feb 3
    const end = new Date(2025, 1, 7) // Fri Feb 7
    const logs = dateSet('2025-02-03', '2025-02-04') // weekdays but not in freq
    expect(calculateConsistencyPercentage([7], logs, start, end)).toBe(0)
  })

  test('frequency vazia retorna 0', () => {
    const logs = dateSet(...ALL_FEB_WEEKDAYS)
    expect(calculateConsistencyPercentage([], logs, FEB_2025_START, FEB_2025_END)).toBe(0)
  })

  // Partial checks: 3 out of 5 expected in a week → floor(60) = 60
  test('3 de 5 dias esperados em uma semana retorna 60', () => {
    // Mon Feb 3 – Fri Feb 7 (5 weekdays); 3 logged
    const start = new Date(2025, 1, 3)
    const end = new Date(2025, 1, 7)
    const logs = dateSet('2025-02-03', '2025-02-04', '2025-02-05')
    expect(calculateConsistencyPercentage(WEEKDAYS, logs, start, end)).toBe(60)
  })

  // Non-expected logs within period must not inflate the count
  test('logs em dias não esperados não contam para a consistência', () => {
    // freq = Sun only, period = full Feb; only 4 Sundays (Feb 2, 9, 16, 23)
    const start = new Date(2025, 1, 1)
    const end = new Date(2025, 1, 28)
    // Log all weekdays (should be ignored) + only 2 Sundays
    const logs = dateSet(
      ...ALL_FEB_WEEKDAYS, // these are NOT in freq [7]
      '2025-02-02', // Sun ✓
      '2025-02-09' // Sun ✓
    )
    // 4 Sundays expected, 2 logged → floor(50) = 50
    expect(calculateConsistencyPercentage([7], logs, start, end)).toBe(50)
  })
})
