import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Check, Clock, AlertTriangle } from 'lucide-react'

export default async function UsagePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div className="p-8">Please log in <Link href="/login" className="text-primary text-blue-500 hover:text-blue-600">here</Link></div>

    const { data: usages } = await supabase
        .from('usage')
        .select(`
            *,
            items (id, name),
            customers (name)
        `)
        .order('created_at', { ascending: false })

    // Separate active and returned
    const activeAllocations = usages?.filter(u => !u.is_returned) || []
    const returnedAllocations = usages?.filter(u => u.is_returned) || []

    const isOverdue = (usage: any) => {
        if (usage.is_returned) return false
        if (!usage.expected_return_date) return false
        return new Date(usage.expected_return_date) < new Date()
    }

    return (
        <div className="px-4 md:px-8 py-8 md:py-12">
            {/* Header */}
            <header className="mb-8 md:mb-12">
                <p className="text-sm text-muted-foreground mb-2">Track</p>
                <h1 className="text-3xl md:text-5xl tracking-tight">Allocations</h1>
            </header>

            {/* Active Allocations */}
            <section className="mb-12">
                <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                    Active ({activeAllocations.length})
                </h2>

                {activeAllocations.length > 0 ? (
                    <div className="border border-border divide-y divide-border">
                        {activeAllocations.map((usage: any) => {
                            const overdue = isOverdue(usage)
                            return (
                                <div
                                    key={usage.id}
                                    className={cn(
                                        "p-4 md:p-6 transition-colors",
                                        overdue ? "bg-red-500/5" : "hover:bg-accent/50"
                                    )}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Link
                                                    href={`/inventory/${usage.items?.id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {usage.items?.name}
                                                </Link>
                                                {overdue && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 text-xs">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {usage.customers?.name} • {usage.event_name || 'No event'}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm">
                                            <span className="text-muted-foreground">
                                                Qty: {usage.quantity_used}
                                            </span>
                                            {usage.expected_return_date && (
                                                <span className={cn(
                                                    "flex items-center gap-1",
                                                    overdue ? "text-red-400" : "text-muted-foreground"
                                                )}>
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Return: {new Date(usage.expected_return_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="border border-dashed border-border p-8 text-center">
                        <p className="text-sm text-muted-foreground">No active allocations</p>
                    </div>
                )}
            </section>

            {/* Returned Allocations */}
            <section>
                <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                    Returned ({returnedAllocations.length})
                </h2>

                {returnedAllocations.length > 0 ? (
                    <div className="border border-border divide-y divide-border opacity-60">
                        {returnedAllocations.map((usage: any) => (
                            <div key={usage.id} className="p-4 md:p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">{usage.items?.name}</span>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs">
                                                <Check className="w-3 h-3" />
                                                Returned
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {usage.customers?.name} • {usage.event_name || 'No event'}
                                        </p>
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        {usage.returned_at && (
                                            <span>Returned: {new Date(usage.returned_at).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="border border-dashed border-border p-8 text-center">
                        <p className="text-sm text-muted-foreground">No returned items yet</p>
                    </div>
                )}
            </section>
        </div>
    )
}
