'use client'

import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, LayoutGroup } from 'framer-motion'
import { toast } from 'sonner'
import { HabitCard } from '@/components/habits/HabitCard'
import { DayProgressBar } from '@/components/layout/DayProgressBar'
import { toggleHabitCheck } from '@/lib/habits/queries'
import { abandonChallenge } from '@/lib/challenges/queries'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { getGreeting } from '@/lib/utils/date'
import { enqueue } from '@/lib/sync/queue'
import type { Habit, Challenge, ChallengeTier } from '@/types/domain'

// ----- tier icons -----

const TIER_ICONS: Record<ChallengeTier, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
  diamond: '💍',
  master: '👑',
  challenger: '🏆',
}

// ----- greeting header -----

function GreetingHeader({ todayDate }: { todayDate: string }) {
  const { t, language } = useAppTranslations()
  const [greeting, setGreeting] = useState<'morning' | 'afternoon' | 'evening'>('morning')

  useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()))
  }, [])

  const formattedDate = new Intl.DateTimeFormat(language, { dateStyle: 'long' }).format(
    new Date(todayDate + 'T12:00:00') // noon to avoid timezone drift
  )

  return (
    <div className="space-y-0.5">
      <h1 className="text-2xl font-bold tracking-tight">{t(`home.greeting.${greeting}`)}</h1>
      <p className="text-sm text-muted-foreground capitalize">{formattedDate}</p>
    </div>
  )
}

// ----- challenge card (dashboard mini) -----

interface ChallengeDashCardProps {
  challenge: Challenge
  progress: number
  onAbandon: (id: string) => void
}

function ChallengeDashCard({ challenge, progress, onAbandon }: ChallengeDashCardProps) {
  const { t } = useAppTranslations()
  const today = new Date().toISOString().split('T')[0]
  const isExpired = challenge.endDate < today && challenge.status === 'active'
  const progressPercent = Math.min(Math.round((progress / challenge.goalDays) * 100), 100)

  return (
    <div className="rounded-lg border bg-card p-4 min-w-[220px] max-w-[260px] flex-shrink-0 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-lg shrink-0">{TIER_ICONS[challenge.tier]}</span>
          <span className="text-sm font-medium truncate">{challenge.name}</span>
        </div>
        {isExpired && (
          <span className="rounded bg-red-500 px-1.5 py-0.5 text-xs text-white shrink-0">
            {t('challenges.expired')}
          </span>
        )}
      </div>

      <div
        className="h-1.5 rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemax={challenge.goalDays}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {t('challenges.progressLabel', { done: progress, total: challenge.goalDays })}
      </p>

      {isExpired && (
        <button
          onClick={() => onAbandon(challenge.id)}
          className="text-xs text-red-500 hover:underline"
          aria-label={`${t('common.abandon')} ${challenge.name}`}
        >
          {t('common.abandon')}
        </button>
      )}
    </div>
  )
}

// ----- main component -----

interface HabitDashboardProps {
  initialHabits: Habit[]
  initialChecks: string[] // array for JSON serialization across server→client boundary
  initialStreaks: Record<string, number>
  initialChallenges: Challenge[]
  challengeProgresses: Record<string, number>
  todayDate: string // "YYYY-MM-DD" local date
  userId: string
}

export function HabitDashboard({
  initialHabits,
  initialChecks,
  initialStreaks,
  initialChallenges,
  challengeProgresses,
  todayDate,
  userId,
}: HabitDashboardProps) {
  const { t } = useAppTranslations()
  const isOnline = useOnlineStatus()
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set(initialChecks))
  const [pendingSyncIds, setPendingSyncIds] = useState<Set<string>>(new Set())
  const [offlineToastShown, setOfflineToastShown] = useState(false)
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges)

  // Sort: pending on top → done at the bottom; within each group preserve sortOrder
  const sortedHabits = [...initialHabits].sort((a, b) => {
    const aDone = checkedIds.has(a.id)
    const bDone = checkedIds.has(b.id)
    if (aDone !== bDone) return aDone ? 1 : -1
    return a.sortOrder - b.sortOrder
  })

  const handleToggle = useCallback(
    async (habitId: string, value: boolean) => {
      // Optimistic update — UI updates immediately before server confirms
      setCheckedIds((prev) => {
        const next = new Set(prev)
        if (value) next.add(habitId)
        else next.delete(habitId)
        return next
      })

      if (!isOnline) {
        enqueue({
          id: `${habitId}-${Date.now()}`,
          type: 'toggle_check',
          habit_id: habitId,
          logged_date: todayDate,
          value,
          timestamp: Date.now(),
        })
        setPendingSyncIds((prev) => new Set(prev).add(habitId))
        if (!offlineToastShown) {
          toast.warning(t('common.noConnection'))
          setOfflineToastShown(true)
        }
        return
      }

      try {
        await toggleHabitCheck(habitId, userId, todayDate, value)
        // Remove from pending if it was there
        setPendingSyncIds((prev) => {
          const next = new Set(prev)
          next.delete(habitId)
          return next
        })
      } catch {
        // Revert optimistic update on server error
        setCheckedIds((prev) => {
          const next = new Set(prev)
          if (value) next.delete(habitId)
          else next.add(habitId)
          return next
        })
        toast.error(t('common.error'))
      }
    },
    [isOnline, offlineToastShown, todayDate, userId, t]
  )

  const handleAbandonChallenge = useCallback(
    async (challengeId: string) => {
      try {
        await abandonChallenge(challengeId)
        setChallenges((prev) => prev.filter((c) => c.id !== challengeId))
      } catch {
        toast.error(t('common.error'))
      }
    },
    [t]
  )

  const done = checkedIds.size
  const total = initialHabits.length

  return (
    <div className="space-y-6">
      <GreetingHeader todayDate={todayDate} />

      <DayProgressBar done={done} total={total} />

      {/* Habit list — layout animations handle reordering on check/uncheck */}
      <LayoutGroup>
        <div className="space-y-2">
          {sortedHabits.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum hábito para hoje.
            </p>
          )}
          <AnimatePresence initial={false}>
            {sortedHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                isDone={checkedIds.has(habit.id)}
                currentStreak={initialStreaks[habit.id] ?? 0}
                onMarkDone={() => handleToggle(habit.id, true)}
                onMarkUndone={() => handleToggle(habit.id, false)}
                hasPendingSync={pendingSyncIds.has(habit.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </LayoutGroup>

      {/* Active challenges section — hidden if no challenges */}
      {challenges.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t('home.activeChallenges')}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {challenges.map((challenge) => (
              <ChallengeDashCard
                key={challenge.id}
                challenge={challenge}
                progress={challengeProgresses[challenge.id] ?? 0}
                onAbandon={handleAbandonChallenge}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
