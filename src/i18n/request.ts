import { getRequestConfig } from 'next-intl/server'
import { DEFAULT_LANGUAGE } from '@/lib/utils/constants'

export default getRequestConfig(async () => ({
  locale: DEFAULT_LANGUAGE,
  messages: (await import(`./messages/${DEFAULT_LANGUAGE}.json`)).default,
}))
