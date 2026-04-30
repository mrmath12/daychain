'use client'

import { useState } from 'react'
import type { Challenge } from '@/types/domain'

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(false)

  return { challenges, setChallenges, loading, setLoading }
}
