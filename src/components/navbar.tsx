'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { MobileSidebar } from '@/components/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

export function Navbar() {
    const { user } = useAuth()

    return (
        <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-sm md:px-8 md:py-4">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <MobileSidebar />
                <div className="min-w-0 md:hidden">
                    <p className="truncate text-sm font-medium">Inventory Flow</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                        {user?.name ?? 'Operations workspace'}
                    </p>
                </div>
                <div className="hidden items-center gap-3 rounded-full border border-border bg-card px-3 py-1.5 sm:flex">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-muted-foreground">Workspace protected</span>
                </div>
            </div>

            <div className="min-w-0 flex items-center gap-2 sm:gap-3">
                <ThemeToggle />
                <div className="hidden text-right sm:block">
                    <p className="truncate text-sm font-medium">{user?.name ?? 'Inventory operator'}</p>
                    <p className="max-w-[180px] truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-semibold uppercase">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'I'}
                </div>
            </div>
        </div>
    )
}
