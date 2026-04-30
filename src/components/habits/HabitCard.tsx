'use client'

import type { Habit } from '@/types/domain'

interface HabitCardProps {
  habit: Habit
  isChecked: boolean
  streak: number
  onToggle: (habitId: string) => void
}

export function HabitCard({ habit, isChecked, streak, onToggle }: HabitCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
      <span className="text-2xl">{habit.emoji}</span>
      <span className="flex-1 font-medium">{habit.name}</span>
      {streak > 0 && (
        <span className="text-sm text-orange-500" aria-label={`Streak: ${streak} days`}>
          🔥 {streak}
        </span>
      )}
      <button
        onClick={() => onToggle(habit.id)}
        aria-label={isChecked ? `Unmark ${habit.name}` : `Mark ${habit.name} as done`}
        className="h-8 w-8 rounded border"
      >
        {isChecked ? '✓' : ''}
      </button>
    </div>
  )
}
