'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart2, Trophy, Settings } from 'lucide-react'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500&display=swap');

        .sidebar-root {
          font-family: 'DM Sans', sans-serif;
        }

        .sidebar-logo {
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 0.18em;
          font-size: 1.45rem;
          line-height: 1;
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
          background: #f59e0b;
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
          color: #f59e0b;
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
      `}</style>

      <aside
        aria-label="Sidebar navigation"
        className="sidebar-root hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-background z-40"
      >
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Logo */}
          <div className="flex h-16 items-center px-5 border-b gap-3">
            <div
              className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: '#f59e0b' }}
              aria-hidden="true"
            >
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                <rect
                  x="0.75"
                  y="0.75"
                  width="4.5"
                  height="8.5"
                  rx="2.25"
                  stroke="white"
                  strokeWidth="1.5"
                />
                <rect
                  x="8.75"
                  y="0.75"
                  width="4.5"
                  height="8.5"
                  rx="2.25"
                  stroke="white"
                  strokeWidth="1.5"
                />
                <line x1="5.25" y1="5" x2="8.75" y2="5" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="sidebar-logo text-foreground">Daychain</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-5">
            {NAV_ITEMS.map(({ href, icon: Icon, labelKey }, i) => {
              const active = isActive(href)
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
