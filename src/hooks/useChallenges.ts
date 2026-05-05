'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { env } from '@/env'
import { fetchChallenges } from '@/lib/challenges/queries'
import type { Challenge } from '@/types/domain'

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const userId = env.NEXT_PUBLIC_HARDCODED_USER_ID

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchChallenges(userId)
      setChallenges(data)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const activeChallenges = useMemo(
    () => challenges.filter((c) => c.status === 'active'),
    [challenges]
  )

  return { challenges, activeChallenges, isLoading, error, refresh }
}
