'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { toast } from 'sonner'
import { HabitCard } from '@/components/habits/HabitCard'
import { DayProgressBar } from '@/components/layout/DayProgressBar'
import { toggleHabitCheck } from '@/lib/habits/queries'
import { abandonChallenge } from '@/lib/challenges/queries'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useSyncQueue } from '@/hooks/useSyncQueue'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { getGreeting } from '@/lib/utils/date'
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

const TIME_CONFIG = {
  morning: { accent: '#f59e0b', symbol: '○' },
  afternoon: { accent: '#38bdf8', symbol: '◑' },
  evening: { accent: '#818cf8', symbol: '●' },
} as const

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }
const rise = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

function GreetingHeader({ todayDate }: { todayDate: string }) {
  const { t, language } = useAppTranslations()
  const [greeting, setGreeting] = useState<'morning' | 'afternoon' | 'evening'>('morning')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()))
    setMounted(true)
  }, [])

  const formattedDate = new Intl.DateTimeFormat(language, { dateStyle: 'long' }).format(
    new Date(todayDate + 'T12:00:00') // noon to avoid timezone drift
  )

  const cfg = TIME_CONFIG[greeting]

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>
      <motion.div variants={stagger} initial="hidden" animate="show" className="relative">
        {/* Ambient accent row */}
        <motion.div variants={rise} className="mb-3 flex items-center gap-2.5">
          <div
            className="h-px w-20 rounded-full"
            style={{ background: `linear-gradient(to right, ${cfg.accent}cc, transparent)` }}
          />
          {mounted && (
            <span
              className="text-[10px] tracking-[0.3em] uppercase select-none"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: cfg.accent }}
            >
              {cfg.symbol}
            </span>
          )}
        </motion.div>

        {/* Greeting */}
        <motion.h1
          variants={rise}
          className="text-[2rem] leading-[1.1] font-medium text-foreground"
          style={{ fontFamily: "'Lora', Georgia, serif" }}
        >
          {t(`home.greeting.${greeting}`)}
        </motion.h1>

        {/* Date */}
        <motion.p
          variants={rise}
          className="mt-1.5 text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60 capitalize"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {formattedDate}
        </motion.p>
      </motion.div>
    </>
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
  const { isOnline } = useOnlineStatus()
  const { enqueueCheck, pendingHabitIds } = useSyncQueue(userId)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set(initialChecks))
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges)
  // Rastreia se o toast "offline" já foi exibido nesta sessão
  const offlineToastShownRef = useRef(false)

  // Sort: pending on top → done at the bottom; within each group preserve sortOrder
  const sortedHabits = [...initialHabits].sort((a, b) => {
    const aDone = checkedIds.has(a.id)
    const bDone = checkedIds.has(b.id)
    if (aDone !== bDone) return aDone ? 1 : -1
    return a.sortOrder - b.sortOrder
  })

  const handleToggle = useCallback(
    async (habitId: string, value: boolean) => {
      // Optimistic update — UI atualiza imediatamente
      setCheckedIds((prev) => {
        const next = new Set(prev)
        if (value) next.add(habitId)
        else next.delete(habitId)
        return next
      })

      if (!isOnline) {
        enqueueCheck(habitId, todayDate, value)
        if (!offlineToastShownRef.current) {
          toast.warning(t('common.noConnection'))
          offlineToastShownRef.current = true
        }
        return
      }

      try {
        await toggleHabitCheck(habitId, userId, todayDate, value)
      } catch {
        // Reverter optimistic update em caso de erro no servidor
        setCheckedIds((prev) => {
          const next = new Set(prev)
          if (value) next.delete(habitId)
          else next.add(habitId)
          return next
        })
        toast.error(t('common.error'))
      }
    },
    [isOnline, enqueueCheck, todayDate, userId, t]
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
                hasPendingSync={pendingHabitIds.has(habit.id)}
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
