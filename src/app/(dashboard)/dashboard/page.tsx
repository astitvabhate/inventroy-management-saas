import Link from 'next/link'
import { AlertTriangle, ArrowRight, Boxes, ClipboardList, Users2, Wallet } from 'lucide-react'
import { requireSessionUser } from '@/lib/auth/session'
import { getDashboardOverview } from '@/lib/data/inventory'
import { formatCurrency } from '@/lib/format'

const cards = [
    { key: 'items', label: 'Catalog', href: '/inventory', icon: Boxes },
    { key: 'customers', label: 'Customers', href: '/customers', icon: Users2 },
    { key: 'allocations', label: 'Active allocations', href: '/usage', icon: ClipboardList },
    { key: 'sales', label: 'Sales', href: '/sales', icon: Wallet },
] as const

export default async function DashboardPage() {
    const user = await requireSessionUser()
    const overview = await getDashboardOverview(user)

    return (
        <div className="px-4 py-8 md:px-8 md:py-12">
            <header className="mb-8 flex flex-col gap-4 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">Operations overview</p>
                    <h1 className="mt-2 text-3xl tracking-tight sm:text-4xl md:text-5xl">
                        Welcome back, {user.name.split(' ')[0]}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                        Keep stock visible, catch overdue allocations early, and give your team a cleaner daily operating rhythm.
                    </p>
                </div>
                <Link
                    href="/inventory/new"
                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm text-background transition hover:opacity-90"
                >
                    Add new item
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </header>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                {cards.map((card) => (
                    <Link
                        key={card.key}
                        href={card.href}
                        className="rounded-[1.6rem] border border-border bg-card p-4 transition hover:border-foreground/20 hover:bg-accent/30 md:rounded-[2rem] md:p-6"
                    >
                        <div className="flex items-center justify-between">
                            <card.icon className="h-5 w-5 text-muted-foreground" />
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:mt-6 sm:text-sm sm:tracking-[0.2em]">
                            {card.label}
                        </p>
                        <p className="mt-1.5 text-2xl tracking-tight sm:mt-2 sm:text-4xl">
                            {overview.counts[card.key]}
                        </p>
                    </Link>
                ))}
            </div>

            <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-[2rem] border border-border bg-card p-6">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Inventory pulse</p>
                            <h2 className="text-2xl tracking-tight">Recent items</h2>
                        </div>
                        <Link href="/inventory" className="text-sm text-muted-foreground hover:text-foreground">
                            View all
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {overview.recentItems.length > 0 ? overview.recentItems.map((item) => (
                            <Link
                                key={item.id}
                                href={`/inventory/${item.id}`}
                                className="flex flex-col gap-3 rounded-2xl border border-border px-4 py-4 transition hover:bg-accent/30 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="min-w-0">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="mt-1 text-sm text-muted-foreground capitalize">
                                        {item.category} • {item.availableQuantity}/{item.totalQuantity} available
                                    </p>
                                </div>
                                <span className="text-sm text-muted-foreground sm:text-right">{formatCurrency(item.sellingPrice)}</span>
                            </Link>
                        )) : (
                            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                                Your latest items will appear here once the catalog starts growing.
                            </div>
                        )}
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="rounded-[2rem] border border-border bg-card p-6">
                        <p className="text-sm text-muted-foreground">Signals that need attention</p>
                        <div className="mt-6 space-y-4">
                            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-4 w-4 text-amber-300" />
                                    <p className="text-sm font-medium">Low-stock items</p>
                                </div>
                                <p className="mt-3 text-3xl tracking-tight">{overview.lowStockItems}</p>
                                <p className="mt-2 text-sm text-muted-foreground">Items at or below their safety threshold.</p>
                            </div>
                            <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-4">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-4 w-4 text-red-300" />
                                    <p className="text-sm font-medium">Overdue returns</p>
                                </div>
                                <p className="mt-3 text-3xl tracking-tight">{overview.overdueAllocations}</p>
                                <p className="mt-2 text-sm text-muted-foreground">Allocations whose expected return date has passed.</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-border bg-card p-6">
                        <p className="text-sm text-muted-foreground">Revenue snapshot</p>
                        <div className="mt-5 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Revenue</p>
                                <p className="mt-2 text-2xl tracking-tight">{formatCurrency(overview.revenue)}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Profit</p>
                                <p className="mt-2 text-2xl tracking-tight">{formatCurrency(overview.profit)}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
