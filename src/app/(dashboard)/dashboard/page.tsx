import { createClient } from '@/lib/supabase/server'
import { Package, Users, ShoppingCart, History, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Fetch basic stats
    const { count: itemsCount } = await supabase.from('items').select('*', { count: 'exact', head: true })
    const { count: customersCount } = await supabase.from('customers').select('*', { count: 'exact', head: true })
    const { count: salesCount } = await supabase.from('sales').select('*', { count: 'exact', head: true })
    const { count: usageCount } = await supabase.from('usage').select('*', { count: 'exact', head: true })

    const stats = [
        { label: 'Items', value: itemsCount || 0, href: '/inventory' },
        { label: 'Customers', value: customersCount || 0, href: '/customers' },
        { label: 'Sales', value: salesCount || 0, href: '/sales' },
        { label: 'Allocations', value: usageCount || 0, href: '/usage' },
    ]

    return (
        <div className="px-8 py-12">
            {/* Header */}
            <header className="mb-16">
                <p className="text-sm text-muted-foreground mb-2">Dashboard</p>
                <h1 className="text-4xl md:text-5xl tracking-tight">
                    Overview
                </h1>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border mb-16">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="group bg-background p-8 hover:bg-accent/50 transition-colors"
                    >
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                            {stat.label}
                        </p>
                        <div className="flex items-end justify-between">
                            <span className="text-4xl tracking-tight">{stat.value}</span>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <section>
                <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-6">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/inventory/new"
                        className="group flex items-center justify-between p-6 border border-border hover:bg-accent/50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <Package className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm">Add new item</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <Link
                        href="/customers"
                        className="group flex items-center justify-between p-6 border border-border hover:bg-accent/50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <Users className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm">View customers</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <Link
                        href="/usage"
                        className="group flex items-center justify-between p-6 border border-border hover:bg-accent/50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <History className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm">Track allocations</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                </div>
            </section>
        </div>
    )
}
