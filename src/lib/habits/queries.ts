import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Habit, DayOfWeek, HabitLog } from '@/types/domain'
import type { Database } from '@/types/database'
import { calculateMaxStreak } from '@/lib/habits/streak'

type HabitUpdate = Database['public']['Tables']['habits']['Update']

// ----- mappers -----

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

function mapHabitLog(row: Record<string, unknown>): HabitLog {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    habitId: row.habit_id as string,
    loggedDate: row.logged_date as string,
    createdAt: row.created_at as string,
  }
}

// ----- read -----

export async function fetchActiveHabits(userId: string): Promise<Habit[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapHabit)
}

// backward-compat alias
export const getActiveHabits = fetchActiveHabits

export async function fetchAllHabits(userId: string): Promise<Habit[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapHabit)
}

// backward-compat alias
export const getAllHabits = fetchAllHabits

export async function getHabitLogs(
  userId: string,
  startDate: string,
  endDate: string
): Promise<HabitLog[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_date', startDate)
    .lte('logged_date', endDate)
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapHabitLog)
}

export async function countHabitLogs(habitId: string): Promise<number> {
  const supabase = getSupabaseBrowserClient()
  const { count, error } = await supabase
    .from('habit_logs')
    .select('id', { count: 'exact', head: true })
    .eq('habit_id', habitId)
  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function fetchHabitLogDates(habitId: string, userId: string): Promise<Set<string>> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('habit_logs')
    .select('logged_date')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  return new Set((data ?? []).map((row) => row.logged_date as string))
}

export async function fetchHabitLogsByPeriod(
  habitId: string,
  userId: string,
  startDate: string,
  endDate: string
): Promise<HabitLog[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .gte('logged_date', startDate)
    .lte('logged_date', endDate)
    .order('logged_date', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapHabitLog)
}

export async function fetchHabitLogsByHabitsAndPeriod(
  habitIds: string[],
  userId: string,
  startDate: string,
  endDate: string
): Promise<Map<string, Set<string>>> {
  if (habitIds.length === 0) return new Map()
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('habit_logs')
    .select('habit_id, logged_date')
    .eq('user_id', userId)
    .in('habit_id', habitIds)
    .gte('logged_date', startDate)
    .lte('logged_date', endDate)
  if (error) throw new Error(error.message)
  const map = new Map<string, Set<string>>()
  for (const row of data ?? []) {
    const id = row.habit_id as string
    const date = row.logged_date as string
    if (!map.has(id)) map.set(id, new Set())
    map.get(id)!.add(date)
  }
  return map
}

// ----- write -----

export async function createHabit(
  userId: string,
  input: Pick<Habit, 'name' | 'emoji' | 'frequency'>
): Promise<Habit> {
  const supabase = getSupabaseBrowserClient()

  const { data: maxRow } = await supabase
    .from('habits')
    .select('sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextSortOrder = ((maxRow?.sort_order as number | null) ?? 0) + 1

  const { data, error } = await supabase
    .from('habits')
    .insert({
      user_id: userId,
      name: input.name.trim(),
      emoji: input.emoji,
      frequency: input.frequency,
      sort_order: nextSortOrder,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return mapHabit(data as Record<string, unknown>)
}

export async function updateHabit(
  habitId: string,
  userId: string,
  updates: Partial<Pick<Habit, 'name' | 'emoji' | 'frequency'>>
): Promise<Habit> {
  const supabase = getSupabaseBrowserClient()

  const dbUpdates: HabitUpdate = {}
  if (updates.name !== undefined) dbUpdates.name = updates.name.trim()
  if (updates.emoji !== undefined) dbUpdates.emoji = updates.emoji
  if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency

  const { data, error } = await supabase
    .from('habits')
    .update(dbUpdates)
    .eq('id', habitId)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return mapHabit(data as Record<string, unknown>)
}

export async function archiveHabit(habitId: string, userId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase
    .from('habits')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', habitId)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

export async function deleteHabit(habitId: string, userId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId)
    .eq('user_id', userId)
    .not('archived_at', 'is', null)
  if (error) throw new Error(error.message)
}

export async function reorderHabits(
  updates: Array<{ id: string; sortOrder: number }>,
  userId: string
): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  await Promise.all(
    updates.map(({ id, sortOrder }) =>
      supabase
        .from('habits')
        .update({ sort_order: sortOrder })
        .eq('id', id)
        .eq('user_id', userId)
        .then(({ error }) => {
          if (error) throw new Error(error.message)
        })
    )
  )
}

// Marks or unmarks a habit for a given local date.
// Uses UPSERT to mark and DELETE to unmark. logged_date must always be the device's LOCAL date.
export async function toggleHabitCheck(
  habitId: string,
  userId: string,
  loggedDate: string, // "YYYY-MM-DD" — local date
  value: boolean // true = mark done, false = unmark
): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  if (value) {
    const { error } = await supabase
      .from('habit_logs')
      .upsert(
        { habit_id: habitId, user_id: userId, logged_date: loggedDate },
        { onConflict: 'habit_id,logged_date' }
      )
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('habit_logs')
      .delete()
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .eq('logged_date', loggedDate)
    if (error) throw new Error(error.message)
  }
}

// Fetches all logs for multiple habits (no date filter). Returns Map<habitId, Set<loggedDate>>.
export async function fetchAllHabitLogDates(
  habitIds: string[],
  userId: string
): Promise<Map<string, Set<string>>> {
  if (habitIds.length === 0) return new Map()
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('habit_logs')
    .select('habit_id, logged_date')
    .eq('user_id', userId)
    .in('habit_id', habitIds)
  if (error) throw new Error(error.message)
  const map = new Map<string, Set<string>>()
  for (const row of data ?? []) {
    const id = row.habit_id as string
    const date = row.logged_date as string
    if (!map.has(id)) map.set(id, new Set())
    map.get(id)!.add(date)
  }
  return map
}

// Fetches check counts grouped by habit and year for the annual view.
export async function fetchAnnualConsistency(
  userId: string
): Promise<Array<{ habitId: string; year: number; totalChecks: number }>> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('habit_logs')
    .select('habit_id, logged_date')
    .eq('user_id', userId)
  if (error) throw new Error(error.message)

  const map = new Map<string, number>()
  for (const row of data ?? []) {
    const year = parseInt((row.logged_date as string).slice(0, 4), 10)
    const key = `${row.habit_id as string}:${year}`
    map.set(key, (map.get(key) ?? 0) + 1)
  }

  return Array.from(map.entries()).map(([key, totalChecks]) => {
    const colonIdx = key.indexOf(':')
    return {
      habitId: key.slice(0, colonIdx),
      year: parseInt(key.slice(colonIdx + 1), 10),
      totalChecks,
    }
  })
}

// Calculates the maximum streak for a habit within a specific calendar year.
export async function fetchMaxStreakForYear(
  habitId: string,
  userId: string,
  year: number,
  frequency: DayOfWeek[]
): Promise<number> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('habit_logs')
    .select('logged_date')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .gte('logged_date', `${year}-01-01`)
    .lte('logged_date', `${year}-12-31`)
  if (error) throw new Error(error.message)

  const logs = new Set((data ?? []).map((row) => row.logged_date as string))
  const yearStart = new Date(year, 0, 1, 12, 0, 0)
  const yearEnd = new Date(year, 11, 31, 12, 0, 0)
  return calculateMaxStreak(frequency, logs, yearStart, yearEnd)
}

// Fetches today's checks for a list of habit_ids. Returns a Set of habit_ids done today.
export async function fetchTodayChecks(
  habitIds: string[],
  userId: string,
  todayDate: string
): Promise<Set<string>> {
  if (habitIds.length === 0) return new Set()
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('habit_logs')
    .select('habit_id')
    .eq('user_id', userId)
    .eq('logged_date', todayDate)
    .in('habit_id', habitIds)
  if (error) throw new Error(error.message)
  return new Set((data ?? []).map((row) => row.habit_id as string))
}
