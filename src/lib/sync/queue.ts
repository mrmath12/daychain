import { SYNC_QUEUE_STORAGE_KEY } from '@/lib/utils/constants'

export interface SyncOperation {
  id: string
  type: 'toggle_check'
  habit_id: string
  logged_date: string // "YYYY-MM-DD"
  value: boolean // true = done, false = undone
  timestamp: number // Date.now()
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

export function writeQueue(ops: SyncOperation[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SYNC_QUEUE_STORAGE_KEY, JSON.stringify(ops))
}

export function enqueue(op: SyncOperation): void {
  const queue = readQueue()
  queue.push(op)
  writeQueue(queue)
}

export function clearQueue(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SYNC_QUEUE_STORAGE_KEY)
}
