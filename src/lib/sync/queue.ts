import {
  SYNC_QUEUE_STORAGE_KEY,
  SYNC_RETRY_ATTEMPTS,
  SYNC_RETRY_DELAY_MS,
} from '@/lib/utils/constants'

export { SYNC_RETRY_ATTEMPTS, SYNC_RETRY_DELAY_MS }

export interface SyncOperation {
  id: string
  type: 'toggle_check'
  habitId: string
  loggedDate: string // "YYYY-MM-DD"
  value: boolean // true = marcar, false = desmarcar
  timestamp: number // Date.now()
  retryCount: number // começa em 0
}

export function readQueue(): SyncOperation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SyncOperation[]) : []
  } catch {
    return []
  }
}

function writeQueue(ops: SyncOperation[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SYNC_QUEUE_STORAGE_KEY, JSON.stringify(ops))
}

export function enqueueOperation(op: Omit<SyncOperation, 'id' | 'retryCount'>): void {
  const queue = readQueue()
  queue.push({ ...op, id: crypto.randomUUID(), retryCount: 0 })
  writeQueue(queue)
}

export function dequeueOperation(operationId: string): void {
  writeQueue(readQueue().filter((op) => op.id !== operationId))
}

export function incrementRetryCount(operationId: string): void {
  writeQueue(
    readQueue().map((op) => (op.id === operationId ? { ...op, retryCount: op.retryCount + 1 } : op))
  )
}

export function clearQueue(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SYNC_QUEUE_STORAGE_KEY)
}
