'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { User, Session } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface SessionState {
  user: User | null
  session: Session | null
  isLoading: boolean
}

export function useSession(): SessionState & { signOut: () => Promise<void> } {
  const supabase = getSupabaseBrowserClient()
  const supabaseRef = useRef(supabase)
  const router = useRouter()

  const [state, setState] = useState<SessionState>({
    user: null,
    session: null,
    isLoading: true,
  })

  useEffect(() => {
    const { auth } = supabaseRef.current

    auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, session, isLoading: false })
    })

    const {
      data: { subscription },
    } = auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, isLoading: false })
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return { ...state, signOut }
}
