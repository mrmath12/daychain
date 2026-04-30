import { getRequestConfig } from 'next-intl/server'
import { DEFAULT_LANGUAGE } from '@/lib/utils/constants'

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locale ?? DEFAULT_LANGUAGE

  return {
    locale: resolvedLocale,
    messages: (await import(`./messages/${resolvedLocale}.json`)).default,
  }
})
