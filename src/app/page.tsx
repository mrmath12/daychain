import { getSupabaseServerClient } from '@/lib/supabase/server'
import { env } from '@/env'
import { getTodayLocalDate, getHabitsForToday } from '@/lib/utils/date'
import { calculateChainWithShields, calcularProgressoDesafio } from '@/lib/habits/chain'
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
  const userId = env.NEXT_PUBLIC_HARDCODED_USER_ID
  const supabase = getSupabaseServerClient()
  const today = new Date()
  const todayDate = getTodayLocalDate()
  const lookbackDate = format(subDays(today, 730), 'yyyy-MM-dd')

  // 1. Active habits
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

  // 2. Active challenges (max 3 for dashboard)
  const { data: challengesData } = await supabase
    .from('challenges')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(3)

  const challenges: Challenge[] = (challengesData ?? []).map(mapChallenge)
  const challengeHabitIds = challenges.map((c) => c.habitId)

  // 3. Logs for all habits + challenges (single query)
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

  // Group logs by habit_id
  const logsByHabit = new Map<string, Set<string>>()
  for (const row of rawLogs) {
    const set = logsByHabit.get(row.habit_id) ?? new Set<string>()
    set.add(row.logged_date)
    logsByHabit.set(row.habit_id, set)
  }

  // 4. Today's checks — all habits (off-day habits may also be checked today)
  const todayChecks: string[] = allHabitIds.filter((id) =>
    (logsByHabit.get(id) ?? new Set()).has(todayDate)
  )

  // 5. Chain and shields for all habits
  const chains: Record<string, number> = {}
  const shieldsMap: Record<string, number> = {}
  for (const habit of allHabits) {
    const logs = logsByHabit.get(habit.id) ?? new Set<string>()
    const { chain, shields } = calculateChainWithShields(habit.frequency, logs, today)
    chains[habit.id] = chain
    shieldsMap[habit.id] = shields
  }

  // 6. Challenge progress from the same log set
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
      initialChecks={todayChecks}
      initialChains={chains}
      initialShields={shieldsMap}
      initialChallenges={challenges}
      challengeProgresses={challengeProgresses}
      todayDate={todayDate}
      userId={userId}
    />
  )
}
