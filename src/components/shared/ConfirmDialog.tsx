'use client'

import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isDestructive?: boolean
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
  isDestructive = false,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        className="relative z-10 mx-4 w-full max-w-sm rounded-lg bg-background p-6 shadow-lg"
      >
        <h2 id="confirm-title" className="text-base font-semibold">
          {title}
        </h2>
        <p id="confirm-desc" className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
          {description}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'rounded-md px-4 py-2 text-sm transition-colors',
              isDestructive
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
