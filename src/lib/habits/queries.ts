import { createClient } from '@/lib/supabase/client'
import type { Habit, HabitLog } from '@/types/domain'

export async function getActiveHabits(userId: string): Promise<Habit[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapHabit)
}

export async function getAllHabits(userId: string): Promise<Habit[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapHabit)
}

export async function getHabitLogs(
  userId: string,
  startDate: string,
  endDate: string
): Promise<HabitLog[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_date', startDate)
    .lte('logged_date', endDate)

  if (error) throw error
  return (data ?? []).map(mapHabitLog)
}

function mapHabit(row: Record<string, unknown>): Habit {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    emoji: row.emoji as string,
    frequency: row.frequency as import('@/types/domain').DayOfWeek[],
    sortOrder: row.sort_order as number,
    archivedAt: row.archived_at as string | null,
    createdAt: row.created_at as string,
  }
}

function mapHabitLog(row: Record<string, unknown>): HabitLog {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    habitId: row.habit_id as string,
    loggedDate: row.logged_date as string,
    createdAt: row.created_at as string,
  }
}
