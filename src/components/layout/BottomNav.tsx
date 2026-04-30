'use client'

export function BottomNav() {
  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background lg:hidden"
    >
      <div className="flex h-16 items-center justify-around">
        <span className="text-xs text-muted-foreground">BottomNav placeholder</span>
      </div>
    </nav>
  )
}
