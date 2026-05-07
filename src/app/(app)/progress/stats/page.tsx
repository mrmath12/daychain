'use client'

import { format } from 'date-fns'
import { HabitStatsSection } from '@/components/progress/HabitStatsSection'

export default function StatsPage() {
  return <HabitStatsSection referenceDate={format(new Date(), 'yyyy-MM-dd')} />
}
