import { format } from 'date-fns'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { parseLocalDate } from '@/lib/utils/date'
import { updateChallengeStatus } from '@/lib/challenges/queries'
import type { Challenge } from '@/types/domain'

// Returns COUNT of habit_logs within challenge period, capped at today.
export async function calculateChallengeProgress(
  challenge: Challenge,
  userId: string
): Promise<number> {
  const supabase = getSupabaseBrowserClient()
  const today = format(new Date(), 'yyyy-MM-dd')
  const effectiveEnd = challenge.endDate < today ? challenge.endDate : today

  const { count, error } = await supabase
    .from('habit_logs')
    .select('id', { count: 'exact', head: true })
    .eq('habit_id', challenge.habitId)
    .eq('user_id', userId)
    .gte('logged_date', challenge.startDate)
    .lte('logged_date', effectiveEnd)

  if (error) throw new Error(error.message)
  return count ?? 0
}

// Returns true if the challenge was just completed (progress >= goal_days).
export async function checkAndCompleteChallengeIfDone(
  challenge: Challenge,
  userId: string
): Promise<boolean> {
  const progress = await calculateChallengeProgress(challenge, userId)
  if (progress >= challenge.goalDays) {
    await updateChallengeStatus(challenge.id, userId, 'completed')
    return true
  }
  return false
}

// Pure function — end_date is before today and challenge is still active.
export function isChallengeExpired(challenge: Challenge, today: Date): boolean {
  const todayStr = format(today, 'yyyy-MM-dd')
  return challenge.endDate < todayStr && challenge.status === 'active'
}

// Pure function — days between today and end_date (negative = already expired).
export function calculateDaysRemaining(challenge: Challenge, today: Date): number {
  const endNoon = parseLocalDate(challenge.endDate)
  const todayNoon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0)
  const ms = endNoon.getTime() - todayNoon.getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

// Batch progress query — one Supabase call for all active challenges.
export async function fetchAllChallengesProgress(
  challenges: Challenge[],
  userId: string
): Promise<Map<string, number>> {
  if (challenges.length === 0) return new Map()

  const supabase = getSupabaseBrowserClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  const habitIds = Array.from(new Set(challenges.map((c) => c.habitId)))
  const minStart = challenges.reduce(
    (min, c) => (c.startDate < min ? c.startDate : min),
    challenges[0].startDate
  )
  const maxEnd = challenges.reduce((max, c) => {
    const eff = c.endDate < today ? c.endDate : today
    return eff > max ? eff : max
  }, '')

  const { data, error } = await supabase
    .from('habit_logs')
    .select('habit_id, logged_date')
    .eq('user_id', userId)
    .in('habit_id', habitIds)
    .gte('logged_date', minStart)
    .lte('logged_date', maxEnd)

  if (error) throw new Error(error.message)

  // Group logs by habit_id
  const logsByHabit = new Map<string, Set<string>>()
  for (const row of data ?? []) {
    const hid = row.habit_id as string
    const date = row.logged_date as string
    if (!logsByHabit.has(hid)) logsByHabit.set(hid, new Set())
    logsByHabit.get(hid)!.add(date)
  }

  // Count per challenge using date-string comparison (no day iteration needed)
  const result = new Map<string, number>()
  for (const challenge of challenges) {
    const logDates = Array.from(logsByHabit.get(challenge.habitId) ?? new Set<string>())
    const effectiveEnd = challenge.endDate < today ? challenge.endDate : today
    let count = 0
    for (const date of logDates) {
      if (date >= challenge.startDate && date <= effectiveEnd) count++
    }
    result.set(challenge.id, count)
  }

  return result
}
