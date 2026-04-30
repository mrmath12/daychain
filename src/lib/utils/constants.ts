import type { ChallengeTier } from '@/types/domain'

export const SWIPE_THRESHOLD_PERCENTAGE = 0.3
export const MAX_HABIT_NAME_LENGTH = 40
export const MAX_CHALLENGE_NAME_LENGTH = 60
export const MAX_CHALLENGE_REASON_LENGTH = 200
export const SYNC_RETRY_ATTEMPTS = 3
export const SYNC_RETRY_DELAY_MS = 30_000
export const MAX_STREAK_LOOKBACK_DAYS = 730
export const SYNC_QUEUE_STORAGE_KEY = 'daychain:sync_queue'
export const THEME_STORAGE_KEY = 'daychain:theme'
export const LANGUAGE_STORAGE_KEY = 'daychain:lang'

export const CHALLENGE_TIER_DAYS: Record<ChallengeTier, number> = {
  bronze: 7,
  silver: 15,
  gold: 30,
  platinum: 75,
  diamond: 183,
  master: 365,
  challenger: 730,
}

export const DEFAULT_THEME = 'dark'
export const DEFAULT_LANGUAGE = 'pt-BR'
