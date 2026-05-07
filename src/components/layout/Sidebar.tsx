'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart2, Trophy, Settings } from 'lucide-react'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { useAppStore } from '@/store/appStore'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

const STATIC_NAV_ITEMS = [
  { href: '/home', icon: Home, labelKey: 'nav.home', matchPrefix: '/home' },
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
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .sidebar-root {
          font-family: var(--font-dm-sans), sans-serif;
        }

        .sidebar-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 9px 12px;
          border-radius: 7px;
          font-size: 0.875rem;
          font-weight: 500;
          min-height: 44px;
          text-decoration: none;
          color: hsl(var(--muted-foreground));
          transition: background 0.15s ease, color 0.15s ease;
          overflow: hidden;
        }

        .sidebar-nav-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 0;
          background: #d6ff0a;
          border-radius: 0 3px 3px 0;
          transition: height 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .sidebar-nav-item:hover {
          background: hsl(var(--accent));
          color: hsl(var(--foreground));
        }

        .sidebar-nav-item.active {
          background: hsl(var(--accent));
          color: hsl(var(--foreground));
        }

        .sidebar-nav-item.active::before {
          height: 55%;
        }

        .sidebar-nav-item.active .sidebar-nav-icon {
          color: #d6ff0a;
        }

        .sidebar-chain-connector {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding-left: 23px;
          gap: 0;
          height: 20px;
          justify-content: center;
        }

        .sidebar-chain-connector::before {
          content: '';
          display: block;
          width: 1px;
          height: 8px;
          background: hsl(var(--border));
          margin-left: 8px;
        }

        .sidebar-chain-connector::after {
          content: '';
          display: block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          border: 1.5px solid hsl(var(--border));
          background: hsl(var(--background));
          margin-left: 5.5px;
        }
      `,
        }}
      />

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
