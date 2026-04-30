'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Sheet({ open, onOpenChange, title, children, className }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className={cn(
          'relative z-10 w-full bg-background rounded-t-2xl sm:rounded-2xl sm:max-w-md max-h-[90dvh] flex flex-col',
          className
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <h2 id="sheet-title" className="text-base font-semibold">
            {title}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Fechar"
            className="rounded-md p-1 hover:bg-accent transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
