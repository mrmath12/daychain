'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Habit } from '@/types/domain'
import { calculateCurrentStreak, calculateMaxStreak } from '@/lib/habits/streak'
import { fetchHabitLogDates } from '@/lib/habits/queries'
import { env } from '@/env'

interface StreakData {
  currentStreak: number
  maxStreak: number
}

export function useStreak(habit: Habit): StreakData {
  const [loggedDates, setLoggedDates] = useState<Set<string>>(new Set())
  const userId = env.NEXT_PUBLIC_HARDCODED_USER_ID

  useEffect(() => {
    fetchHabitLogDates(habit.id, userId)
      .then(setLoggedDates)
      .catch(() => setLoggedDates(new Set()))
  }, [habit.id, userId])

  return useMemo(() => {
    const today = new Date()
    const createdAt = new Date(habit.createdAt)
    return {
      currentStreak: calculateCurrentStreak(habit.frequency, loggedDates, today),
      maxStreak: calculateMaxStreak(habit.frequency, loggedDates, createdAt, today),
    }
  }, [habit, loggedDates])
}
