'use client'

import { useState } from 'react'
import type { Habit } from '@/types/domain'

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(false)

  return { habits, setHabits, loading, setLoading }
}
