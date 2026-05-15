'use client'

import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pb-16 lg:pl-64 lg:pb-0">
        <div className="mx-auto max-w-[900px] px-4 pt-6 pb-4 lg:p-6">{children}</div>
      </main>
      <BottomNav />
    </div>
  )
}
