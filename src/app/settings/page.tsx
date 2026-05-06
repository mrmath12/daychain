'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, LogOut } from 'lucide-react'
import { useHabits } from '@/hooks/useHabits'
import { useSession } from '@/hooks/useSession'
import { HabitList } from '@/components/habits/HabitList'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import { Sheet } from '@/components/ui/sheet'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const { t } = useAppTranslations()
  const { habits, isLoading, createHabit, updateHabit, archiveHabit, deleteHabit, reorderHabits } =
    useHabits()
  const [manageOpen, setManageOpen] = useState(false)
  const { user, signOut } = useSession()
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const supabase = getSupabaseBrowserClient()
    supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setUsername(data.username)
      })
  }, [user])

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t('settings.title')}</h1>

      {/* Account group */}
      {user && (
        <section className="space-y-2">
          <p className="px-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
            {t('auth.account')}
          </p>
          <div className="overflow-hidden rounded-xl border border-border/60 divide-y divide-border/40">
            {username && (
              <div className="flex items-center gap-4 px-4 py-3.5 min-h-[52px]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">@{username}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted/40 min-h-[52px] text-destructive"
            >
              <LogOut size={16} className="shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium">{t('auth.signOut')}</span>
            </button>
          </div>
        </section>
      )}

      {/* Habits group */}
      <section className="space-y-2">
        <p className="px-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
          {t('habits.title')}
        </p>
        <div className="overflow-hidden rounded-xl border border-border/60">
          <button
            onClick={() => setManageOpen(true)}
            className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted/40 min-h-[52px]"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{t('settings.manageHabits')}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t('settings.manageHabitsDesc')}
              </p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground shrink-0" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Appearance group */}
      <section className="space-y-2">
        <p className="px-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
          {t('settings.appearance')}
        </p>
        <div className="overflow-hidden rounded-xl border border-border/60 divide-y divide-border/40">
          <div className="flex items-center justify-between gap-4 px-4 py-2 min-h-[52px]">
            <span className="text-sm font-medium">{t('settings.theme')}</span>
            <div className="w-44 shrink-0">
              <ThemeToggle />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-2 min-h-[52px]">
            <span className="text-sm font-medium">{t('settings.language')}</span>
            <div className="w-32 shrink-0">
              <LanguageToggle />
            </div>
          </div>
        </div>
      </section>

      <Sheet open={manageOpen} onOpenChange={setManageOpen} title={t('settings.manageHabits')}>
        <HabitList
          habits={habits}
          isLoading={isLoading}
          onCreate={createHabit}
          onUpdate={updateHabit}
          onArchive={archiveHabit}
          onDelete={deleteHabit}
          onReorder={reorderHabits}
        />
      </Sheet>
    </div>
  )
}
