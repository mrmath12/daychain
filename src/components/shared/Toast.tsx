'use client'

interface ToastProps {
  message: string
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-lg bg-foreground px-4 py-2 text-sm text-background"
    >
      {message}
    </div>
  )
}
