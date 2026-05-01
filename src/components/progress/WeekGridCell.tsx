'use client'

import { Check } from 'lucide-react'
import type { CellState } from '@/lib/habits/utils'

interface Props {
  state: CellState
  isLoading?: boolean
  onToggle?: () => void
}

export function WeekGridCell({ state, isLoading = false, onToggle }: Props) {
  const base = 'flex items-center justify-center min-h-[44px] min-w-[44px] select-none'

  if (state === 'not-expected') {
    return <div className={`${base} bg-muted`} aria-hidden="true" />
  }

  if (state === 'future') {
    return (
      <div className={`${base} cursor-default opacity-40`} aria-hidden="true">
        <div className="h-5 w-5 rounded border border-muted-foreground/40" />
      </div>
    )
  }

  if (state === 'done') {
    return (
      <button
        type="button"
        aria-label="Desmarcar"
        onClick={onToggle}
        disabled={isLoading}
        className={`${base} rounded bg-primary/10 transition-opacity ${isLoading ? 'opacity-50' : 'hover:bg-primary/20'}`}
      >
        <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
      </button>
    )
  }

  if (state === 'pending') {
    return (
      <button
        type="button"
        aria-label="Marcar"
        onClick={onToggle}
        disabled={isLoading}
        className={`${base} rounded transition-opacity ${isLoading ? 'opacity-50' : 'hover:bg-muted'}`}
      >
        <div className="h-5 w-5 rounded border-2 border-muted-foreground/60" />
      </button>
    )
  }

  if (state === 'archived-done') {
    return (
      <div className={`${base} cursor-default`} aria-hidden="true">
        <Check className="h-4 w-4 text-muted-foreground/50" strokeWidth={2.5} />
      </div>
    )
  }

  // archived-pending
  return (
    <div className={`${base} cursor-default`} aria-hidden="true">
      <span className="text-sm text-muted-foreground/50">–</span>
    </div>
  )
}
