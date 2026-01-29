'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { MobileSidebar } from '@/components/sidebar'

export function Navbar() {
    const { user } = useAuth()

    return (
        <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {/* Mobile Menu */}
                <MobileSidebar />

                {/* Status */}
                <div className="hidden sm:flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs text-muted-foreground">Active</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
                <div className="w-8 h-8 bg-accent flex items-center justify-center text-xs font-medium">
                    {user?.email?.charAt(0).toUpperCase()}
                </div>
            </div>
        </div>
    )
}
