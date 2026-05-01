'use client'

import { Check } from 'lucide-react'
import type { CellState } from '@/lib/habits/utils'

interface Props {
  state: CellState
  isLoading?: boolean
  onToggle?: () => void
}

export function WeekGridCell({ state, isLoading = false, onToggle }: Props) {
  const base = 'flex items-center justify-center w-full min-h-[54px] select-none'

  if (state === 'not-expected') {
    return (
      <div
        className={`${base}`}
        aria-hidden="true"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, transparent, transparent 3px, hsl(var(--muted)) 3px, hsl(var(--muted)) 4px)',
        }}
      />
    )
  }

  if (state === 'future') {
    return (
      <div className={`${base} cursor-default opacity-20`} aria-hidden="true">
        <div className="h-5 w-5 border border-current" />
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
        className={`${base} bg-amber-400 dark:bg-amber-500 transition-all ${
          isLoading ? 'opacity-50' : 'hover:bg-amber-300 dark:hover:bg-amber-400 active:scale-95'
        }`}
      >
        <Check className="h-[18px] w-[18px] text-white" strokeWidth={3} />
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
        className={`${base} transition-all ${
          isLoading ? 'opacity-50' : 'hover:bg-amber-50 dark:hover:bg-amber-950/20 active:scale-95'
        }`}
      >
        <div className="h-5 w-5 border-2 border-zinc-300 dark:border-zinc-600 transition-colors group-hover:border-amber-400" />
      </button>
    )
  }

  if (state === 'archived-done') {
    return (
      <div className={`${base} cursor-default opacity-25`} aria-hidden="true">
        <div className="h-5 w-5 bg-amber-400 dark:bg-amber-500 flex items-center justify-center">
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        </div>
      </div>
    )
  }

  // archived-pending
  return (
    <div className={`${base} cursor-default opacity-25`} aria-hidden="true">
      <div className="h-5 w-5 border border-zinc-400 dark:border-zinc-600" />
    </div>
  )
}
