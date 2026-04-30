'use client'

export function Sidebar() {
  return (
    <aside
      aria-label="Sidebar navigation"
      className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-background"
    >
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs text-muted-foreground">Sidebar placeholder</span>
      </div>
    </aside>
  )
}
