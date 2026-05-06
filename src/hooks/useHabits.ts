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

type CreateInput = Pick<Habit, 'name' | 'emoji' | 'frequency'>
type UpdateInput = Partial<Pick<Habit, 'name' | 'emoji' | 'frequency'>>
type ReorderUpdate = Array<{ id: string; sortOrder: number }>

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchAllHabits()
      setHabits(data)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createHabit = useCallback(
    async (input: CreateInput): Promise<Habit> => {
      const habit = await createHabitQuery(input)
      await refresh()
      return habit
    },
    [refresh]
  )

  const updateHabit = useCallback(
    async (habitId: string, updates: UpdateInput): Promise<Habit> => {
      const habit = await updateHabitQuery(habitId, updates)
      await refresh()
      return habit
    },
    [refresh]
  )

  const archiveHabit = useCallback(
    async (habitId: string): Promise<void> => {
      await archiveHabitQuery(habitId)
      await refresh()
    },
    [refresh]
  )

  const deleteHabit = useCallback(
    async (habitId: string): Promise<void> => {
      await deleteHabitQuery(habitId)
      await refresh()
    },
    [refresh]
  )

  const reorderHabits = useCallback(async (updates: ReorderUpdate): Promise<void> => {
    await reorderHabitsQuery(updates)
  }, [])

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
