'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchChallenges } from '@/lib/challenges/queries'
import type { Challenge } from '@/types/domain'

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchChallenges()
      setChallenges(data)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const activeChallenges = useMemo(
    () => challenges.filter((c) => c.status === 'active'),
    [challenges]
  )

  return { challenges, activeChallenges, isLoading, error, refresh }
}
