import type { Challenge } from '@/types/domain'
import { calcularProgressoDesafio } from '@/lib/habits/streak'

export function getChallengeProgress(challenge: Challenge, logs: Set<string>): number {
  return calcularProgressoDesafio(logs, challenge.startDate, challenge.endDate, new Date())
}

export function isChallengeExpired(challenge: Challenge): boolean {
  const today = new Date().toISOString().split('T')[0]
  return challenge.endDate < today && challenge.status === 'active'
}
