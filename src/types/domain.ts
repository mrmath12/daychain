export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7 // 1=Seg…7=Dom

export interface Habit {
  id: string
  userId: string
  name: string
  emoji: string
  frequency: DayOfWeek[]
  sortOrder: number
  archivedAt: string | null
  createdAt: string
}

export interface HabitLog {
  id: string
  userId: string
  habitId: string
  loggedDate: string // "YYYY-MM-DD"
  createdAt: string
}

export type ChallengeStatus = 'active' | 'completed' | 'abandoned'
export type ChallengeTier =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'challenger'

export interface Challenge {
  id: string
  userId: string
  habitId: string
  name: string
  tier: ChallengeTier
  goalDays: number
  startDate: string
  endDate: string
  reason: string | null
  status: ChallengeStatus
  createdAt: string
}
