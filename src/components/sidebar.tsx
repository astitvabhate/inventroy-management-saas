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
                        Dhuni<span className="text-muted-foreground">.</span>
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
                className="md:hidden p-2 hover:bg-accent transition-colors"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Slide-in Menu */}
            <div className={cn(
                "fixed inset-y-0 left-0 w-72 bg-black border-r border-border z-50 transform transition-transform duration-300 md:hidden",
                open ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-6 border-b border-border">
                    <span className="text-xl tracking-tight">
                        Dhuni<span className="text-muted-foreground">.</span>
                    </span>
                    <button onClick={() => setOpen(false)} className="p-2 hover:bg-accent transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User Info */}
                <div className="px-6 py-4 border-b border-border">
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                </div>

                {/* Navigation */}
                <nav className="px-4 py-6">
                    <div className="space-y-1">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "group flex items-center gap-3 px-3 py-3 text-sm transition-colors",
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

                {/* Sign Out */}
                <div className="absolute bottom-0 left-0 right-0 px-4 py-6 border-t border-border">
                    <button
                        onClick={() => { signOut(); setOpen(false); }}
                        className="flex items-center gap-3 px-3 py-3 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Sign out</span>
                    </button>
                </div>
            </div>
        </>
    )
}
