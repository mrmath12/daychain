'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart2, Trophy, Settings } from 'lucide-react'
import { useAppTranslations } from '@/hooks/useAppTranslations'

const NAV_ITEMS = [
  { href: '/', icon: Home, labelKey: 'nav.home', matchPrefix: undefined },
  { href: '/progress/week', icon: BarChart2, labelKey: 'nav.progress', matchPrefix: '/progress' },
  { href: '/challenges', icon: Trophy, labelKey: 'nav.challenges', matchPrefix: undefined },
  { href: '/settings', icon: Settings, labelKey: 'nav.settings', matchPrefix: undefined },
]

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useAppTranslations()

  function isActive(href: string, matchPrefix?: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(matchPrefix ?? href)
  }

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 lg:hidden"
    >
      <div className="flex items-center gap-1 rounded-2xl border border-border/40 bg-background/80 px-2 py-2 shadow-[0_8px_40px_rgba(0,0,0,0.14)] backdrop-blur-2xl">
        {NAV_ITEMS.map(({ href, icon: Icon, labelKey, matchPrefix }) => {
          const active = isActive(href, matchPrefix)
          const label = t(labelKey)
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center justify-center rounded-xl px-3 py-2.5 min-h-[44px] min-w-[44px] transition-all duration-300 ease-out ${
                active
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              }`}
            >
              <Icon
                size={18}
                aria-hidden="true"
                className={`shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}
              />
              <span
                className={`overflow-hidden whitespace-nowrap text-xs font-semibold tracking-tight transition-all duration-300 ease-out ${
                  active ? 'max-w-24 opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
