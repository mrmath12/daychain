import { addDays, format, parseISO } from 'date-fns'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { CHALLENGE_TIER_DAYS } from '@/lib/utils/constants'
import type { Challenge, ChallengeStatus, ChallengeTier } from '@/types/domain'

// ----- mapper -----

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

// ----- read -----

export async function fetchChallenges(
  userId: string,
  status?: ChallengeStatus | 'all'
): Promise<Challenge[]> {
  const supabase = getSupabaseBrowserClient()
  let query = supabase.from('challenges').select('*').eq('user_id', userId)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapChallenge)
}

export async function fetchActiveChallenges(userId: string): Promise<Challenge[]> {
  return fetchChallenges(userId, 'active')
}

// ----- write -----

export async function createChallenge(
  userId: string,
  input: {
    habitId: string
    name: string
    tier: ChallengeTier
    startDate: string
    reason?: string
  }
): Promise<Challenge> {
  const supabase = getSupabaseBrowserClient()
  const goalDays = CHALLENGE_TIER_DAYS[input.tier]
  const endDate = format(addDays(parseISO(input.startDate), goalDays - 1), 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('challenges')
    .insert({
      user_id: userId,
      habit_id: input.habitId,
      name: input.name.trim(),
      tier: input.tier,
      goal_days: goalDays,
      start_date: input.startDate,
      end_date: endDate,
      reason: input.reason?.trim() || null,
      status: 'active',
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return mapChallenge(data as Record<string, unknown>)
}

export async function updateChallengeStatus(
  challengeId: string,
  userId: string,
  status: 'completed' | 'abandoned'
): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase
    .from('challenges')
    .update({ status })
    .eq('id', challengeId)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

export async function abandonChallengesByHabit(habitId: string, userId: string): Promise<number> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('challenges')
    .update({ status: 'abandoned' })
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .select('id')
  if (error) throw new Error(error.message)
  return data?.length ?? 0
}

// ----- backward-compat aliases -----

export const getChallenges = fetchChallenges

/** @deprecated use updateChallengeStatus */
export async function abandonChallenge(challengeId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase
    .from('challenges')
    .update({ status: 'abandoned' })
    .eq('id', challengeId)
  if (error) throw new Error(error.message)
}

/** @deprecated use abandonChallengesByHabit — RLS ensures only current user's data is affected */
export async function abandonActiveChallengesByHabit(habitId: string): Promise<number> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('challenges')
    .update({ status: 'abandoned' })
    .eq('habit_id', habitId)
    .eq('status', 'active')
    .select('id')
  if (error) throw new Error(error.message)
  return data?.length ?? 0
}
