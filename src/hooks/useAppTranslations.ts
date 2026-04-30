'use client'

import ptBR from '@/i18n/messages/pt-BR.json'
import en from '@/i18n/messages/en.json'
import { useAppStore } from '@/store/appStore'

type Messages = typeof ptBR
const messagesMap: Record<'pt-BR' | 'en', Messages> = { 'pt-BR': ptBR, en }

function getNestedValue(obj: unknown, parts: string[]): unknown {
  let current = obj
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

export function useAppTranslations() {
  const language = useAppStore((s) => s.language)
  const messages = messagesMap[language]

  function t(key: string, params?: Record<string, string | number>): string {
    const value = getNestedValue(messages, key.split('.'))
    if (typeof value !== 'string') return key
    if (!params) return value
    return value.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`))
  }

  return { t, language }
}
