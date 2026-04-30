'use client'

import { useCallback, useState } from 'react'
import { enqueue, readQueue, type SyncOperation } from '@/lib/sync/queue'

export function useSyncQueue() {
  const [pendingCount, setPendingCount] = useState(0)

  const addOperation = useCallback((op: Omit<SyncOperation, 'id' | 'timestamp'>) => {
    const fullOp: SyncOperation = {
      ...op,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }
    enqueue(fullOp)
    setPendingCount((c) => c + 1)
  }, [])

  const getQueue = useCallback(() => readQueue(), [])

  return { pendingCount, addOperation, getQueue }
}
