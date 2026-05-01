'use client'

import { motion } from 'framer-motion'
import { useAppTranslations } from '@/hooks/useAppTranslations'

interface DayProgressBarProps {
  done: number
  total: number
}

export function DayProgressBar({ done, total }: DayProgressBarProps) {
  const { t } = useAppTranslations()
  const percentage = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t('home.progress', { done, total })}</span>
        <span className="font-medium tabular-nums">{percentage}%</span>
      </div>
      <div
        className="h-2 rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemax={total}
      >
        <motion.div
          className="h-full rounded-full bg-green-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        />
      </div>
    </div>
  )
}
