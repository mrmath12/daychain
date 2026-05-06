import { getSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getServerUserId(): Promise<string> {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  return user.id
}
