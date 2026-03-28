'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    History,
    LogOut,
    Menu,
    X,
    ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { ThemeToggle } from '@/components/theme-toggle'

const routes = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Inventory', icon: Package, href: '/inventory' },
    { label: 'Customers', icon: Users, href: '/customers' },
    { label: 'Sales', icon: ShoppingCart, href: '/sales' },
    { label: 'Allocations', icon: History, href: '/usage' },
]

function SidebarContent({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
    const pathname = usePathname()
    const { signOut, user } = useAuth()

    return (
        <div className={cn('flex h-full flex-col', mobile ? 'bg-neutral-950 text-white' : 'border-r border-border bg-background')}>
            <div className={cn('border-b px-5 py-6 md:px-6 md:py-7', mobile ? 'border-white/10' : 'border-border')}>
                <Link href="/dashboard" className="block" onClick={onNavigate}>
                    <span className={cn('text-sm uppercase tracking-[0.35em]', mobile ? 'text-stone-200' : 'text-foreground')}>
                        Inventory Flow
                    </span>
                </Link>
                <p className={cn('mt-4 text-xs', mobile ? 'text-stone-400' : 'text-muted-foreground')}>
                    {user?.name ?? 'Operations workspace'}
                </p>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5 md:px-4 md:py-6">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        onClick={onNavigate}
                        className={cn(
                            'group flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors',
                            pathname === route.href
                                ? mobile
                                    ? 'bg-white text-black'
                                    : 'bg-accent text-foreground'
                                : mobile
                                    ? 'text-stone-400 hover:bg-white/5 hover:text-white'
                                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                        )}
                    >
                        <route.icon className="h-4 w-4" />
                        <span>{route.label}</span>
                    </Link>
                ))}
            </nav>

            <div className={cn('border-t p-3 md:p-4', mobile ? 'border-white/10' : 'border-border')}>
                <button
                    type="button"
                    onClick={() => {
                        signOut()
                        onNavigate?.()
                    }}
                    className={cn(
                        'flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors',
                        mobile
                            ? 'text-red-300 hover:bg-red-500/10 hover:text-red-200'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                </button>
            </div>
        </div>
    )
}

export function Sidebar() {
    return <SidebarContent />
}

export function MobileSidebar() {
    const [open, setOpen] = useState(false)
    const { signOut, user } = useAuth()

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-card px-3 text-foreground transition-colors hover:bg-accent md:hidden"
                aria-label="Open menu"
                aria-expanded={open}
                aria-controls="mobile-sidebar"
            >
                <Menu className="h-5 w-5" />
            </button>

            {open && (
                <div className="fixed inset-0 z-[9999] md:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-sidebar-title">
                    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <div id="mobile-sidebar" className="fixed left-4 right-4 top-[max(1rem,env(safe-area-inset-top))]">
                        <div className="flex items-center justify-end p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-full border border-white/10 bg-neutral-900/90 p-2.5 text-white"
                                aria-label="Close menu"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="pb-[max(1rem,env(safe-area-inset-bottom))]">
                            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-950 shadow-2xl shadow-black/40">
                                <h2 id="mobile-sidebar-title" className="sr-only">Mobile workspace actions</h2>
                                <div className="border-b border-white/10 px-5 py-5">
                                    <p className="text-sm uppercase tracking-[0.35em] text-stone-200">Inventory Flow</p>
                                    <p className="mt-3 text-sm font-medium text-white">{user?.name ?? 'Operations workspace'}</p>
                                    <p className="mt-1 truncate text-xs text-stone-400">{user?.email ?? 'Workspace protected'}</p>
                                </div>

                                <div className="space-y-4 px-5 py-5">
                                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                        <ShieldCheck className="h-4 w-4 text-emerald-300" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white">Workspace protected</p>
                                            <p className="text-xs text-stone-400">Use the bottom bar for navigation.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-white">Appearance</p>
                                            <p className="text-xs text-stone-400">Switch between light and dark mode.</p>
                                        </div>
                                        <ThemeToggle />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            signOut()
                                            setOpen(false)
                                        }}
                                        className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-stone-200"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Log out</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export function MobileDock() {
    const pathname = usePathname()

    return (
        <nav
            aria-label="Mobile primary navigation"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden"
        >
            <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] transition-colors',
                            pathname === route.href
                                ? 'bg-accent text-foreground'
                                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                        )}
                        aria-current={pathname === route.href ? 'page' : undefined}
                    >
                        <route.icon className="h-4 w-4" />
                        <span className="truncate">{route.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    )
}
