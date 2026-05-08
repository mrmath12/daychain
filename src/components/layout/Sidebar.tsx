'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart2, BookOpen, Trophy, Settings } from 'lucide-react'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { useAppStore } from '@/store/appStore'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

const STATIC_NAV_ITEMS = [
  { href: '/home', icon: Home, labelKey: 'nav.home', matchPrefix: '/home' },
  { href: '/habits', icon: BookOpen, labelKey: 'nav.habits', matchPrefix: undefined },
  { href: '/challenges', icon: Trophy, labelKey: 'nav.challenges', matchPrefix: undefined },
  { href: '/settings', icon: Settings, labelKey: 'nav.settings', matchPrefix: undefined },
]

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useAppTranslations()
  const lastProgressTab = useAppStore((s) => s.lastProgressTab)

  const NAV_ITEMS = [
    STATIC_NAV_ITEMS[0],
    { href: lastProgressTab, icon: BarChart2, labelKey: 'nav.progress', matchPrefix: '/progress' },
    ...STATIC_NAV_ITEMS.slice(1),
  ]

  function isActive(href: string, matchPrefix?: string) {
    return pathname.startsWith(matchPrefix ?? href)
  }

  return (
    <>
      <aside
        aria-label="Sidebar navigation"
        className="sidebar-root hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-background z-40"
      >
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Logo */}
          <div className="flex h-16 items-center px-5 border-b">
            <Image
              src="/logo/daychain-logo-full-dark.svg"
              alt="Daychain"
              width={105}
              height={28}
              className="block dark:hidden"
            />
            <Image
              src="/logo/daychain-logo-full-light.svg"
              alt="Daychain"
              width={105}
              height={28}
              className="hidden dark:block"
            />
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-5">
            {NAV_ITEMS.map(({ href, icon: Icon, labelKey, matchPrefix }, i) => {
              const active = isActive(href, matchPrefix)
              const label = t(labelKey)
              return (
                <div key={href}>
                  {i > 0 && <div className="sidebar-chain-connector" />}
                  <Link
                    href={href}
                    aria-label={label}
                    aria-current={active ? 'page' : undefined}
                    className={`sidebar-nav-item ${active ? 'active' : ''}`}
                  >
                    <Icon size={16} aria-hidden="true" className="sidebar-nav-icon flex-shrink-0" />
                    <span>{label}</span>
                  </Link>
                </div>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t">
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  )
}
