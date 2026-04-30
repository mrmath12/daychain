'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart2, Trophy, Settings } from 'lucide-react'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { ThemeLanguageToggle } from '@/components/shared/ThemeLanguageToggle'

const NAV_ITEMS = [
  { href: '/', icon: Home, labelKey: 'nav.home' },
  { href: '/progress/week', icon: BarChart2, labelKey: 'nav.progress' },
  { href: '/challenges', icon: Trophy, labelKey: 'nav.challenges' },
  { href: '/settings', icon: Settings, labelKey: 'nav.settings' },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useAppTranslations()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside
      aria-label="Sidebar navigation"
      className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-background z-40"
    >
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex h-16 items-center px-4 border-b">
          <span className="text-lg font-bold tracking-tight">Daychain</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => {
            const active = isActive(href)
            const label = t(labelKey)
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 min-h-[44px] text-sm font-medium transition-colors ${
                  active
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t">
          <ThemeLanguageToggle />
        </div>
      </div>
    </aside>
  )
}
