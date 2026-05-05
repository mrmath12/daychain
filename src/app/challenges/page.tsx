'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { env } from '@/env'
import { Sheet } from '@/components/ui/sheet'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ChallengeForm } from '@/components/challenges/ChallengeForm'
import { ChallengeCard } from '@/components/challenges/ChallengeCard'
import { useChallenges } from '@/hooks/useChallenges'
import { useHabits } from '@/hooks/useHabits'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { createChallenge, updateChallengeStatus } from '@/lib/challenges/queries'
import { fetchAllChallengesProgress, isChallengeExpired } from '@/lib/challenges/progress'
import { TIER_CONFIG } from '@/lib/challenges/tierConfig'
import { cn } from '@/lib/utils'
import type { ChallengeStatus, ChallengeTier } from '@/types/domain'

type TabKey = ChallengeStatus | 'all'
const TABS: TabKey[] = ['active', 'completed', 'abandoned', 'all']

export default function ChallengesPage() {
  const { t } = useAppTranslations()
  const userId = env.NEXT_PUBLIC_HARDCODED_USER_ID
  const { challenges, activeChallenges, isLoading, refresh } = useChallenges()
  const { habits } = useHabits()

  const [tab, setTab] = useState<TabKey>('active')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [progressMap, setProgressMap] = useState<Map<string, number>>(new Map())
  const [abandonTarget, setAbandonTarget] = useState<string | null>(null) // challengeId

  const activeHabits = habits.filter((h) => !h.archivedAt)

  // Load progress in batch + auto-complete finished challenges
  const loadProgress = useCallback(async () => {
    if (activeChallenges.length === 0) {
      setProgressMap(new Map())
      return
    }

    const map = await fetchAllChallengesProgress(activeChallenges, userId)
    setProgressMap(map)

    const today = new Date()
    const toComplete = activeChallenges.filter(
      (c) => !isChallengeExpired(c, today) && (map.get(c.id) ?? 0) >= c.goalDays
    )

    for (const c of toComplete) {
      await updateChallengeStatus(c.id, userId, 'completed')
      const cfg = TIER_CONFIG[c.tier]
      toast.success(`${cfg.emoji} '${c.name}' concluído! 🎉`)
    }

    if (toComplete.length > 0) {
      await refresh()
    }
  }, [activeChallenges, userId, refresh])

  useEffect(() => {
    loadProgress()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChallenges.length])

  // Filtered + sorted challenges for the active tab
  const displayedChallenges = (() => {
    const filtered =
      tab === 'all' ? challenges : challenges.filter((c) => c.status === (tab as ChallengeStatus))

    if (tab !== 'active') return filtered

    return [...filtered].sort((a, b) => {
      const pctA = (progressMap.get(a.id) ?? 0) / a.goalDays
      const pctB = (progressMap.get(b.id) ?? 0) / b.goalDays
      return pctB - pctA
    })
  })()

  async function handleCreate(data: {
    name: string
    tier: ChallengeTier
    habitId: string
    startDate: string
    reason?: string | ''
  }) {
    await createChallenge(userId, {
      habitId: data.habitId,
      name: data.name,
      tier: data.tier,
      startDate: data.startDate,
      reason: data.reason || undefined,
    })
    setSheetOpen(false)
    await refresh()
  }

  async function confirmAbandon() {
    if (!abandonTarget) return
    await updateChallengeStatus(abandonTarget, userId, 'abandoned')
    setAbandonTarget(null)
    await refresh()
  }

  const abandonChallenge = challenges.find((c) => c.id === abandonTarget)

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className="text-xl font-semibold">{t('challenges.title')}</h1>
        <button
          onClick={() => setSheetOpen(true)}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {t('challenges.new')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b px-4 gap-1">
        {TABS.map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={cn(
              'py-2 px-3 text-sm transition-colors whitespace-nowrap',
              tab === tabKey
                ? 'border-b-2 border-primary font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t(`challenges.tabs.${tabKey}`)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-8">{t('common.loading')}</p>
        )}

        {!isLoading && displayedChallenges.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {tab === 'active' ? t('home.noChallenges') || 'Nenhum desafio ativo' : '—'}
          </p>
        )}

        {displayedChallenges.map((challenge) => {
          const habit = habits.find((h) => h.id === challenge.habitId)
          if (!habit) return null
          return (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              habit={habit}
              progress={progressMap.get(challenge.id) ?? 0}
              onAbandon={() => setAbandonTarget(challenge.id)}
            />
          )
        })}
      </div>

      {/* New challenge sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen} title={t('challenges.new')}>
        <ChallengeForm
          activeHabits={activeHabits}
          activeChallenges={activeChallenges}
          onSubmit={handleCreate}
          onCancel={() => setSheetOpen(false)}
        />
      </Sheet>

      {/* Abandon confirm */}
      <ConfirmDialog
        open={abandonTarget !== null}
        title={t('challenges.abandonConfirm', { name: abandonChallenge?.name ?? '' })}
        description=""
        confirmLabel={t('common.abandon')}
        onConfirm={confirmAbandon}
        onCancel={() => setAbandonTarget(null)}
        isDestructive
      />
    </div>
  )
}
