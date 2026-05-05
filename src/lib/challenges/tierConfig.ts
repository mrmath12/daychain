import { CHALLENGE_TIER_DAYS } from '@/lib/utils/constants'
import type { ChallengeTier } from '@/types/domain'

export const TIER_CONFIG: Record<
  ChallengeTier,
  { emoji: string; durationDays: number; label: Record<'pt-BR' | 'en', string> }
> = {
  bronze: {
    emoji: '🥉',
    durationDays: CHALLENGE_TIER_DAYS.bronze,
    label: { 'pt-BR': 'Bronze', en: 'Bronze' },
  },
  silver: {
    emoji: '🥈',
    durationDays: CHALLENGE_TIER_DAYS.silver,
    label: { 'pt-BR': 'Prata', en: 'Silver' },
  },
  gold: {
    emoji: '🥇',
    durationDays: CHALLENGE_TIER_DAYS.gold,
    label: { 'pt-BR': 'Ouro', en: 'Gold' },
  },
  platinum: {
    emoji: '💎',
    durationDays: CHALLENGE_TIER_DAYS.platinum,
    label: { 'pt-BR': 'Platina', en: 'Platinum' },
  },
  diamond: {
    emoji: '💠',
    durationDays: CHALLENGE_TIER_DAYS.diamond,
    label: { 'pt-BR': 'Diamante', en: 'Diamond' },
  },
  master: {
    emoji: '🏆',
    durationDays: CHALLENGE_TIER_DAYS.master,
    label: { 'pt-BR': 'Mestre', en: 'Master' },
  },
  challenger: {
    emoji: '👑',
    durationDays: CHALLENGE_TIER_DAYS.challenger,
    label: { 'pt-BR': 'Desafiante', en: 'Challenger' },
  },
}
