'use client'

import type { Challenge } from '@/types/domain'

interface ChallengeCardProps {
  challenge: Challenge
  progress: number
  onAbandon?: (challengeId: string) => void
}

export function ChallengeCard({ challenge, progress, onAbandon }: ChallengeCardProps) {
  const isExpired =
    challenge.endDate < new Date().toISOString().split('T')[0] && challenge.status === 'active'
  const progressPercent = Math.round((progress / challenge.goalDays) * 100)

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="font-medium">{challenge.name}</span>
        {isExpired && (
          <span className="rounded bg-red-500 px-2 py-0.5 text-xs text-white">Expirado</span>
        )}
      </div>
      <div className="mt-2 h-2 rounded bg-muted">
        <div
          className="h-2 rounded bg-primary transition-all"
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemax={challenge.goalDays}
        />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {progress} / {challenge.goalDays} dias
      </p>
      {isExpired && onAbandon && (
        <button
          onClick={() => onAbandon(challenge.id)}
          className="mt-2 text-sm text-red-500 underline"
          aria-label={`Abandon challenge ${challenge.name}`}
        >
          Abandonar
        </button>
      )}
    </div>
  )
}
