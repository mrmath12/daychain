'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  readQueue,
  enqueueOperation,
  dequeueOperation,
  incrementRetryCount,
  SYNC_RETRY_ATTEMPTS,
  SYNC_RETRY_DELAY_MS,
} from '@/lib/sync/queue'
import { toggleHabitCheck } from '@/lib/habits/queries'
import { useAppTranslations } from '@/hooks/useAppTranslations'

export function useSyncQueue(userId: string) {
  const { t } = useAppTranslations()
  const [pendingHabitIds, setPendingHabitIds] = useState<Set<string>>(new Set())
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const isSyncingRef = useRef(false)
  // Referência estável para processQueue (evita stale closures no setTimeout e no listener)
  const processQueueRef = useRef<() => Promise<void>>()

  // Sincroniza estado React com o que está no localStorage
  const refreshState = useCallback(() => {
    const queue = readQueue()
    const ids = new Set(queue.map((op) => op.habitId))
    setPendingCount(queue.length)
    setPendingHabitIds(ids)
  }, [])

  const enqueueCheck = useCallback((habitId: string, loggedDate: string, value: boolean) => {
    enqueueOperation({ type: 'toggle_check', habitId, loggedDate, value, timestamp: Date.now() })
    // Atualiza estado diretamente (sem esperar leitura de localStorage)
    setPendingHabitIds((prev) => {
      const next = new Set(prev)
      next.add(habitId)
      return next
    })
    setPendingCount((c) => c + 1)
  }, [])

  const processQueue = useCallback(async () => {
    if (isSyncingRef.current) return
    const queue = readQueue()
    if (queue.length === 0) return

    isSyncingRef.current = true
    setIsSyncing(true)

    const sorted = [...queue].sort((a, b) => a.timestamp - b.timestamp)

    let syncedCount = 0
    let failedCount = 0
    let scheduleRetry = false

    for (const op of sorted) {
      if (op.retryCount >= SYNC_RETRY_ATTEMPTS) {
        failedCount++
        continue
      }

      try {
        await toggleHabitCheck(op.habitId, userId, op.loggedDate, op.value)
        dequeueOperation(op.id)
        setPendingHabitIds((prev) => {
          const next = new Set(prev)
          next.delete(op.habitId)
          return next
        })
        setPendingCount((c) => Math.max(0, c - 1))
        syncedCount++
      } catch {
        incrementRetryCount(op.id)
        const updatedOp = readQueue().find((q) => q.id === op.id)
        if (updatedOp && updatedOp.retryCount >= SYNC_RETRY_ATTEMPTS) {
          failedCount++
        } else {
          scheduleRetry = true
        }
      }
    }

    isSyncingRef.current = false
    setIsSyncing(false)

    if (syncedCount > 0) toast.success(t('common.syncSuccess', { count: syncedCount }))
    if (failedCount > 0) toast.error(t('common.syncError'))

    if (scheduleRetry) {
      setTimeout(() => {
        void processQueueRef.current?.()
      }, SYNC_RETRY_DELAY_MS)
    }
  }, [userId, t])

  // Mantém a ref sempre atualizada com a versão mais recente do callback
  useEffect(() => {
    processQueueRef.current = processQueue
  }, [processQueue])

  // Inicializa estado a partir do localStorage (operações de sessões anteriores)
  useEffect(() => {
    refreshState()
  }, [refreshState])

  // Listener direto no evento 'online' do window — mais confiável que chain de effects
  useEffect(() => {
    function handleOnline() {
      void processQueueRef.current?.()
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  return { enqueueCheck, processQueue, pendingCount, pendingHabitIds, isSyncing }
}
