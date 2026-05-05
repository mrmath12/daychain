'use client'

import { TIER_CONFIG } from '@/lib/challenges/tierConfig'
import { isChallengeExpired, calculateDaysRemaining } from '@/lib/challenges/progress'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { cn } from '@/lib/utils'
import type { Challenge, Habit } from '@/types/domain'

interface ChallengeCardProps {
  challenge: Challenge
  habit: Habit
  progress: number
  onAbandon: () => void
}

export function ChallengeCard({ challenge, habit, progress, onAbandon }: ChallengeCardProps) {
  const { t } = useAppTranslations()
  const today = new Date()
  const expired = isChallengeExpired(challenge, today)
  const daysRemaining = calculateDaysRemaining(challenge, today)
  const progressPercent = Math.min(Math.round((progress / challenge.goalDays) * 100), 100)
  const tierCfg = TIER_CONFIG[challenge.tier]
  const isCompleted = challenge.status === 'completed'

  return (
    <div
      className={cn('rounded-lg border bg-card p-4 space-y-3', expired && 'border-destructive/50')}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0" aria-label={tierCfg.label['pt-BR']}>
            {tierCfg.emoji}
          </span>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{challenge.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {habit.emoji} {habit.name}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          {isCompleted && (
            <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-xs font-medium">
              {t('challenges.completedBadge')}
            </span>
          )}
          {expired && (
            <span className="rounded-full bg-destructive/15 text-destructive px-2 py-0.5 text-xs font-medium">
              {t('challenges.expired')}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-1.5 rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemax={challenge.goalDays}
        aria-label={`${progress} / ${challenge.goalDays}`}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isCompleted ? 'bg-emerald-500' : expired ? 'bg-destructive' : 'bg-primary'
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {t('challenges.progressLabel', {
            done: String(progress),
            total: String(challenge.goalDays),
          })}
        </p>
        {!isCompleted && (
          <p
            className={cn(
              'text-xs',
              expired ? 'text-destructive font-medium' : 'text-muted-foreground'
            )}
          >
            {expired
              ? t('challenges.expired')
              : t('challenges.daysRemaining', { n: String(daysRemaining) })}
          </p>
        )}
      </div>

      {/* Abandon button — always visible on expired; subtle on non-expired active */}
      {challenge.status === 'active' && (
        <button
          onClick={onAbandon}
          className={cn(
            'w-full rounded-md py-1.5 text-xs transition-colors',
            expired
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium'
              : 'text-muted-foreground hover:text-destructive hover:bg-accent'
          )}
          aria-label={`${t('common.abandon')} ${challenge.name}`}
        >
          {t('common.abandon')}
        </button>
      )}
    </div>
  )
}
