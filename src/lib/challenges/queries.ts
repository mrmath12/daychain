import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Challenge, ChallengeStatus } from '@/types/domain'

export async function getChallenges(
  userId: string,
  status?: ChallengeStatus
): Promise<Challenge[]> {
  const supabase = getSupabaseBrowserClient()
  let query = supabase.from('challenges').select('*').eq('user_id', userId)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapChallenge)
}

export async function abandonChallenge(challengeId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase
    .from('challenges')
    .update({ status: 'abandoned' })
    .eq('id', challengeId)
  if (error) throw new Error(error.message)
}

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

function mapChallenge(row: Record<string, unknown>): Challenge {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    habitId: row.habit_id as string,
    name: row.name as string,
    tier: row.tier as Challenge['tier'],
    goalDays: row.goal_days as number,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    reason: row.reason as string | null,
    status: row.status as ChallengeStatus,
    createdAt: row.created_at as string,
  }
}
