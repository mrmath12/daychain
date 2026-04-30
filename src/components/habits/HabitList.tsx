'use client'

import type { Habit } from '@/types/domain'
import { HabitCard } from './HabitCard'

interface HabitListProps {
  habits: Habit[]
  checkedIds: Set<string>
  streaks: Record<string, number>
  onToggle: (habitId: string) => void
}

export function HabitList({ habits, checkedIds, streaks, onToggle }: HabitListProps) {
  return (
    <ul className="space-y-2" aria-label="Habits list">
      {habits.map((habit) => (
        <li key={habit.id}>
          <HabitCard
            habit={habit}
            isChecked={checkedIds.has(habit.id)}
            streak={streaks[habit.id] ?? 0}
            onToggle={onToggle}
          />
        </li>
      ))}
    </ul>
  )
}
