'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Habit } from '@/types/domain'
import { calculateChainWithShields, calculateMaxChain } from '@/lib/habits/chain'
import { fetchHabitLogDates } from '@/lib/habits/queries'
import { env } from '@/env'

interface ChainData {
  currentChain: number
  maxChain: number
  shields: number
}

export function useChain(habit: Habit): ChainData {
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
    const { chain, shields } = calculateChainWithShields(habit.frequency, loggedDates, today)
    return {
      currentChain: chain,
      maxChain: calculateMaxChain(habit.frequency, loggedDates, createdAt, today),
      shields,
    }
  }, [habit, loggedDates])
}
