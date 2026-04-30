'use client'

import { useMemo } from 'react'
import type { Habit, HabitLog } from '@/types/domain'
import { calcularStreakAtual } from '@/lib/habits/streak'

export function useStreak(habit: Habit, logs: HabitLog[]): number {
  return useMemo(() => {
    const logSet = new Set(logs.filter((l) => l.habitId === habit.id).map((l) => l.loggedDate))
    return calcularStreakAtual(habit.frequency, logSet, new Date())
  }, [habit, logs])
}
