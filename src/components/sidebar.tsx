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
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'

const routes = [
    { label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Inventory', icon: Package, href: '/inventory' },
    { label: 'Customers', icon: Users, href: '/customers' },
    { label: 'Sales', icon: ShoppingCart, href: '/sales' },
    { label: 'Usage', icon: History, href: '/usage' },
]

export function Sidebar() {
    const pathname = usePathname()
    const { signOut } = useAuth()

    return (
        <div className="flex flex-col h-full bg-background border-r border-border">
            {/* Logo */}
            <div className="px-6 py-8 border-b border-border">
                <Link href="/" className="block">
                    <span className="text-xl tracking-tight">
                        Dhuni Decor<span className="text-muted-foreground">.</span>
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6">
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "group flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                                pathname === route.href
                                    ? "text-foreground bg-accent"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                            )}
                        >
                            <route.icon className="h-4 w-4" />
                            <span>{route.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Footer */}
            <div className="px-4 py-6 border-t border-border">
                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                </button>
            </div>
        </div>
    )
}

// Mobile Sidebar Component
export function MobileSidebar() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const { signOut, user } = useAuth()

    return (
        <>
            {/* Burger Button */}
            <button
                onClick={() => setOpen(true)}
                className="md:hidden p-2 -ml-2 text-foreground hover:bg-accent transition-colors rounded-md"
                aria-label="Open menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Menu Portal */}
            {open && (
                <div className="fixed inset-0 z-[9999] md:hidden">
                    {/* Dark Overlay */}
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setOpen(false)}
                    />

                    {/* Sidebar Panel */}
                    <div className="fixed inset-y-0 left-0 w-[85vw] max-w-xs bg-zinc-950 flex flex-col h-[100dvh] shadow-2xl animate-in slide-in-from-left duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-900 shrink-0">
                            <span className="text-xl tracking-tight text-white font-medium">
                                Dhuni Decor<span className="text-zinc-600">.</span>
                            </span>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="px-6 py-6 border-b border-zinc-900 shrink-0 bg-zinc-900/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-medium text-sm">
                                    {user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-white truncate">Welcome {user?.user_metadata?.full_name.trim().split(' ')[0]}</p>
                                    <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-3 py-6 overflow-y-auto">
                            <div className="space-y-1">
                                {routes.map((route) => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3.5 text-sm transition-all rounded-lg",
                                            pathname === route.href
                                                ? "text-white bg-zinc-900 font-medium"
                                                : "text-zinc-400 hover:text-white hover:bg-zinc-900/50",
                                        )}
                                    >
                                        <route.icon className="h-5 w-5" />
                                        <span>{route.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </nav>

                        {/* Sign Out */}
                        <div className="p-4 border-t border-zinc-900 shrink-0 bg-zinc-950">
                            <button
                                onClick={() => { signOut(); setOpen(false); }}
                                className="flex items-center gap-3 px-4 py-3.5 w-full text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-lg"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Sign out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
