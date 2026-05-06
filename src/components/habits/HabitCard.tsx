'use client'

import { useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { useDrag } from '@use-gesture/react'
import { RefreshCw } from 'lucide-react'
import { SWIPE_THRESHOLD_PERCENTAGE } from '@/lib/utils/constants'
import type { Habit } from '@/types/domain'

interface HabitCardProps {
  habit: Habit
  isDone: boolean
  currentStreak: number
  onMarkDone: () => void
  onMarkUndone: () => void
  hasPendingSync?: boolean
}

export function HabitCard({
  habit,
  isDone,
  currentStreak,
  onMarkDone,
  onMarkUndone,
  hasPendingSync = false,
}: HabitCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  // 'none' | 'right' | 'left' — only updates on threshold crossing, not every pixel
  const [swipeHint, setSwipeHint] = useState<'none' | 'right' | 'left'>('none')

  const bind = useDrag(
    ({ movement: [mx], last }) => {
      const cardWidth = cardRef.current?.offsetWidth ?? 300
      const threshold = cardWidth * SWIPE_THRESHOLD_PERCENTAGE

      if (last) {
        if (mx > threshold) onMarkDone()
        else if (mx < -threshold) onMarkUndone()
        setSwipeHint('none')
        animate(x, 0, { type: 'spring', damping: 25, stiffness: 300 })
        return
      }

      x.set(mx)
      if (mx > threshold) setSwipeHint('right')
      else if (mx < -threshold) setSwipeHint('left')
      else setSwipeHint('none')
    },
    { axis: 'x', filterTaps: true }
  )

  // Bind gesture to a plain div to avoid type conflict with framer-motion's onDrag
  const gestureProps = bind() as React.HTMLAttributes<HTMLDivElement>

  return (
    // layout prop enables automatic position animation when list order changes
    <motion.div layout transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
      <div ref={cardRef} className="relative overflow-hidden rounded-lg">
        {/* Swipe feedback background — transitions only on threshold cross, not per-pixel */}
        <div
          className={`absolute inset-0 rounded-lg transition-colors duration-75 ${
            swipeHint === 'right'
              ? 'bg-green-500/20'
              : swipeHint === 'left'
                ? 'bg-muted/40'
                : 'bg-transparent'
          }`}
        />

        {/* Gesture capture div wraps the animated surface — keeps motion.div free of onDrag conflict */}
        <div {...gestureProps} style={{ touchAction: 'pan-y' }} className="relative">
          {/* Animated x-position for swipe */}
          <motion.div
            style={{ x }}
            className={`flex items-center gap-3 rounded-lg border p-4 select-none cursor-grab active:cursor-grabbing ${
              isDone ? 'bg-card opacity-70' : 'bg-card'
            }`}
          >
            <span className="text-2xl shrink-0">{habit.emoji}</span>
            <span
              className={`flex-1 font-medium truncate ${isDone ? 'line-through text-muted-foreground' : ''}`}
            >
              {habit.name}
            </span>

            {currentStreak > 0 && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500 shrink-0">
                🔥 {currentStreak}
              </span>
            )}

            {hasPendingSync && (
              <span className="shrink-0 text-muted-foreground" title="Sync pendente">
                <RefreshCw size={13} className="animate-spin" style={{ animationDuration: '2s' }} />
              </span>
            )}

            {/* Tap-to-toggle fallback button (fulfills accessibility requirement) */}
            <button
              onClick={isDone ? onMarkUndone : onMarkDone}
              className={`h-7 w-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                isDone
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-muted-foreground hover:border-green-500'
              }`}
              aria-label={isDone ? `Desfazer ${habit.name}` : `Marcar ${habit.name} como feito`}
            >
              {isDone ? '✓' : ''}
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
