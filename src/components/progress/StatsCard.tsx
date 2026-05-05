'use client'

import { useAppTranslations } from '@/hooks/useAppTranslations'
import type { Habit } from '@/types/domain'

export interface StatsCardProps {
  habit: Habit
  currentStreak: number
  maxStreak: number
  totalChecks: number
  monthConsistency: number // 0–100
  yearConsistency: number // 0–100
}

export function StatsCard({
  habit,
  currentStreak,
  maxStreak,
  totalChecks,
  monthConsistency,
  yearConsistency,
}: StatsCardProps) {
  const { t } = useAppTranslations()

  return (
    <div className="bg-background">
      {/* Habit identity */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <span className="text-xl leading-none">{habit.emoji}</span>
        <span className="text-sm font-semibold flex-1 truncate tracking-tight">{habit.name}</span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Primary: current streak — prominent when active, absent when zero */}
        {currentStreak > 0 && (
          <div className="pb-4 border-b border-border/60 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold tabular-nums leading-none text-amber-500 dark:text-amber-400">
              {currentStreak}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {t('stats.currentStreak').toLowerCase()}
            </span>
          </div>
        )}

        {/* Consistency metrics with progress bars */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs text-muted-foreground">{t('stats.monthConsistency')}</span>
              <span className="text-sm font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {monthConsistency}%
              </span>
            </div>
            <div className="h-[2px] bg-border overflow-hidden">
              <div
                className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500"
                style={{ width: `${monthConsistency}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs text-muted-foreground">{t('stats.yearConsistency')}</span>
              <span className="text-sm font-mono font-semibold tabular-nums">
                {yearConsistency}%
              </span>
            </div>
            <div className="h-[2px] bg-border overflow-hidden">
              <div
                className="h-full bg-foreground/20 transition-all duration-500"
                style={{ width: `${yearConsistency}%` }}
              />
            </div>
          </div>
        </div>

        {/* Secondary: historical metrics */}
        <div className="flex gap-6 pt-1">
          <div>
            <p className="text-sm font-mono font-bold tabular-nums">{maxStreak}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t('stats.maxStreak')}</p>
          </div>
          <div>
            <p className="text-sm font-mono font-bold tabular-nums">{totalChecks}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t('stats.totalChecks')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
