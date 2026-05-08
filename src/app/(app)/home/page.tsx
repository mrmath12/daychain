import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getServerUserId } from '@/lib/supabase/getServerUserId'
import { getTodayLocalDate, getHabitsForToday } from '@/lib/utils/date'
import { calcularProgressoDesafio } from '@/lib/habits/chain'
import { format, subDays } from 'date-fns'
import { HabitDashboard } from '@/components/home/HabitDashboard'
import type { Habit, Challenge, DayOfWeek, ChallengeStatus, ChallengeTier } from '@/types/domain'

function mapHabit(row: Record<string, unknown>): Habit {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    emoji: row.emoji as string,
    frequency: row.frequency as DayOfWeek[],
    sortOrder: row.sort_order as number,
    archivedAt: row.archived_at as string | null,
    createdAt: row.created_at as string,
  }
}

function mapChallenge(row: Record<string, unknown>): Challenge {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    habitId: row.habit_id as string,
    name: row.name as string,
    tier: row.tier as ChallengeTier,
    goalDays: row.goal_days as number,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    reason: row.reason as string | null,
    status: row.status as ChallengeStatus,
    createdAt: row.created_at as string,
  }
}

export default async function HomePage() {
  const userId = await getServerUserId()
  const supabase = getSupabaseServerClient()
  const today = new Date()
  const todayDate = getTodayLocalDate()
  const lookbackDate = format(subDays(today, 730), 'yyyy-MM-dd')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .maybeSingle()

  const displayName = (profileData?.display_name as string | null) ?? null

  const { data: habitsData } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('sort_order', { ascending: true })

  const allHabits: Habit[] = (habitsData ?? []).map(mapHabit)
  const habitsForToday = getHabitsForToday(allHabits)
  const habitIdsForTodaySet = new Set(habitsForToday.map((h) => h.id))
  const habitsOther = allHabits.filter((h) => !habitIdsForTodaySet.has(h.id))
  const allHabitIds = allHabits.map((h) => h.id)

  const { data: challengesData } = await supabase
    .from('challenges')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(3)

  const challenges: Challenge[] = (challengesData ?? []).map(mapChallenge)
  const challengeHabitIds = challenges.map((c) => c.habitId)

  const allRelevantIds = Array.from(new Set([...allHabitIds, ...challengeHabitIds]))

  let rawLogs: Array<{ habit_id: string; logged_date: string }> = []
  if (allRelevantIds.length > 0) {
    const { data } = await supabase
      .from('habit_logs')
      .select('habit_id, logged_date')
      .eq('user_id', userId)
      .gte('logged_date', lookbackDate)
      .in('habit_id', allRelevantIds)
    rawLogs = (data ?? []) as Array<{ habit_id: string; logged_date: string }>
  }

  const logsByHabit = new Map<string, Set<string>>()
  for (const row of rawLogs) {
    const set = logsByHabit.get(row.habit_id) ?? new Set<string>()
    set.add(row.logged_date)
    logsByHabit.set(row.habit_id, set)
  }

  // Build checks indexed by date for the last 2 UTC days so the client can
  // resolve the correct set using its own local date (avoids UTC/local mismatch)
  const yesterdayDate = format(subDays(today, 1), 'yyyy-MM-dd')
  const checksByDate: Record<string, string[]> = {}
  for (const date of [todayDate, yesterdayDate]) {
    checksByDate[date] = allHabitIds.filter((id) => (logsByHabit.get(id) ?? new Set()).has(date))
  }

  // Serialize logs for client-side chain computation (client uses its own local today)
  const logDatesByHabit: Record<string, string[]> = {}
  for (const habit of allHabits) {
    const logs = logsByHabit.get(habit.id)
    if (logs && logs.size > 0) logDatesByHabit[habit.id] = Array.from(logs)
  }

  const challengeProgresses: Record<string, number> = {}
  for (const challenge of challenges) {
    const logs = logsByHabit.get(challenge.habitId) ?? new Set<string>()
    challengeProgresses[challenge.id] = calcularProgressoDesafio(
      logs,
      challenge.startDate,
      challenge.endDate,
      today
    )
  }

  return (
    <HabitDashboard
      initialHabits={habitsForToday}
      initialOtherHabits={habitsOther}
      checksByDate={checksByDate}
      logDatesByHabit={logDatesByHabit}
      initialChallenges={challenges}
      challengeProgresses={challengeProgresses}
      todayDate={todayDate}
      displayName={displayName}
    />
  )
}
