'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { useAppStore } from '@/store/appStore'

const TABS = [
  { href: '/progress/week', labelKey: 'progress.week' },
  { href: '/progress/month', labelKey: 'progress.month' },
  { href: '/progress/year', labelKey: 'progress.year' },
  { href: '/progress/stats', labelKey: 'progress.stats' },
] as const

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}

interface ProgressTabsProps {
  children: React.ReactNode
}

export function ProgressTabs({ children }: ProgressTabsProps) {
  const pathname = usePathname()
  const { t } = useAppTranslations()
  const setLastProgressTab = useAppStore((s) => s.setLastProgressTab)
  const [direction, setDirection] = useState(1)
  const currentIndex = TABS.findIndex((tab) => tab.href === pathname)

  function handleTabClick(newIndex: number, href: string) {
    setDirection(newIndex > currentIndex ? 1 : -1)
    setLastProgressTab(href)
  }

  const tabWidth = 100 / TABS.length
  const indicatorLeft = currentIndex >= 0 ? currentIndex * tabWidth : 0

  return (
    <div className="flex flex-col">
      <div className="relative flex border-b">
        {TABS.map((tab, index) => {
          const active = tab.href === pathname
          const label = t(tab.labelKey)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              onClick={() => handleTabClick(index, tab.href)}
              className={`flex flex-1 items-center justify-center min-h-[44px] px-3 py-2 text-sm font-medium transition-colors ${
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </Link>
          )
        })}
        <motion.div
          className="absolute bottom-0 h-0.5 bg-foreground"
          animate={{ left: `${indicatorLeft}%`, width: `${tabWidth}%` }}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={pathname}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
