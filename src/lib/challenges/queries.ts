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
