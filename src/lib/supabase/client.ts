import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/env'
import type { Database } from '@/types/database'

let browserClientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseBrowserClient() {
  if (!browserClientInstance) {
    browserClientInstance = createBrowserClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }
  return browserClientInstance
}
