'use client'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="mx-4 rounded-lg bg-background p-6 shadow-lg">
        <h2 id="confirm-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded border px-4 py-2 text-sm">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded bg-destructive px-4 py-2 text-sm text-destructive-foreground"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
