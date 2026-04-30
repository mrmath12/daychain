'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart2, Trophy, Settings } from 'lucide-react'
import { useAppTranslations } from '@/hooks/useAppTranslations'

const NAV_ITEMS = [
  { href: '/', icon: Home, labelKey: 'nav.home' },
  { href: '/progress/week', icon: BarChart2, labelKey: 'nav.progress' },
  { href: '/challenges', icon: Trophy, labelKey: 'nav.challenges' },
  { href: '/settings', icon: Settings, labelKey: 'nav.settings' },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useAppTranslations()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background lg:hidden"
    >
      <div className="flex h-16 items-center">
        {NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => {
          const active = isActive(href)
          const label = t(labelKey)
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 min-h-[44px] min-w-[44px] transition-colors ${
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={20} aria-hidden="true" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
