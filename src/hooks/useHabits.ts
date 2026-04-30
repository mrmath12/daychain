'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Habit } from '@/types/domain'
import {
  fetchAllHabits,
  createHabit as createHabitQuery,
  updateHabit as updateHabitQuery,
  archiveHabit as archiveHabitQuery,
  deleteHabit as deleteHabitQuery,
  reorderHabits as reorderHabitsQuery,
} from '@/lib/habits/queries'
import { env } from '@/env'

type CreateInput = Pick<Habit, 'name' | 'emoji' | 'frequency'>
type UpdateInput = Partial<Pick<Habit, 'name' | 'emoji' | 'frequency'>>
type ReorderUpdate = Array<{ id: string; sortOrder: number }>

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const userId = env.NEXT_PUBLIC_HARDCODED_USER_ID

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchAllHabits(userId)
      setHabits(data)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createHabit = useCallback(
    async (input: CreateInput): Promise<Habit> => {
      const habit = await createHabitQuery(userId, input)
      await refresh()
      return habit
    },
    [userId, refresh]
  )

  const updateHabit = useCallback(
    async (habitId: string, updates: UpdateInput): Promise<Habit> => {
      const habit = await updateHabitQuery(habitId, userId, updates)
      await refresh()
      return habit
    },
    [userId, refresh]
  )

  const archiveHabit = useCallback(
    async (habitId: string): Promise<void> => {
      await archiveHabitQuery(habitId, userId)
      await refresh()
    },
    [userId, refresh]
  )

  const deleteHabit = useCallback(
    async (habitId: string): Promise<void> => {
      await deleteHabitQuery(habitId, userId)
      await refresh()
    },
    [userId, refresh]
  )

  const reorderHabits = useCallback(
    async (updates: ReorderUpdate): Promise<void> => {
      await reorderHabitsQuery(updates, userId)
    },
    [userId]
  )

  return {
    habits,
    isLoading,
    error,
    createHabit,
    updateHabit,
    archiveHabit,
    deleteHabit,
    reorderHabits,
    refresh,
  }
}
