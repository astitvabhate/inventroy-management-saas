import Link from 'next/link'
import { AlertTriangle, Check, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { requireSessionUser } from '@/lib/auth/session'
import { listAllocations } from '@/lib/data/inventory'
import { formatDate } from '@/lib/format'

export default async function UsagePage() {
    const user = await requireSessionUser()
    const allocations = await listAllocations(user)
    const activeAllocations = allocations.filter((allocation) => !allocation.isReturned)
    const returnedAllocations = allocations.filter((allocation) => allocation.isReturned)

    const isOverdue = (allocation: (typeof allocations)[number]) => {
        if (allocation.isReturned || !allocation.expectedReturnDate) return false
        return new Date(allocation.expectedReturnDate) < new Date()
    }

    return (
        <div className="px-4 py-8 md:px-8 md:py-12">
            <header className="mb-8 md:mb-12">
                <p className="text-sm text-muted-foreground">Track movement</p>
                <h1 className="mt-2 text-3xl tracking-tight md:text-5xl">Allocations</h1>
            </header>

            <section className="mb-12">
                <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Active ({activeAllocations.length})
                </h2>

                {activeAllocations.length > 0 ? (
                    <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
                        {activeAllocations.map((allocation) => {
                            const overdue = isOverdue(allocation)
                            return (
                                <div
                                    key={allocation.id}
                                    className={cn(
                                        'border-b border-border px-4 py-5 transition md:px-6',
                                        overdue ? 'bg-red-500/5' : 'hover:bg-accent/30'
                                    )}
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div className="flex-1">
                                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                                {allocation.item ? (
                                                    <Link href={`/inventory/${allocation.item.id}`} className="font-medium hover:underline">
                                                        {allocation.item.name}
                                                    </Link>
                                                ) : (
                                                    <span className="font-medium">Unknown item</span>
                                                )}
                                                {overdue && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs uppercase tracking-wide text-red-400">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {allocation.customer?.name || 'Unknown customer'} • {allocation.eventName || 'No event'}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm">
                                            <span className="text-muted-foreground">Qty: {allocation.quantityUsed}</span>
                                            {allocation.expectedReturnDate && (
                                                <span className={cn('flex items-center gap-1', overdue ? 'text-red-400' : 'text-muted-foreground')}>
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Return: {formatDate(allocation.expectedReturnDate)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="rounded-[2rem] border border-dashed border-border bg-card/60 p-8 text-center">
                        <p className="text-sm text-muted-foreground">No active allocations</p>
                    </div>
                )}
            </section>

            <section>
                <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Returned ({returnedAllocations.length})
                </h2>

                {returnedAllocations.length > 0 ? (
                    <div className="overflow-hidden rounded-[2rem] border border-border bg-card opacity-70">
                        {returnedAllocations.map((allocation) => (
                            <div key={allocation.id} className="border-b border-border px-4 py-5 md:px-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <span className="font-medium">{allocation.item?.name || 'Unknown item'}</span>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs uppercase tracking-wide text-emerald-400">
                                                <Check className="h-3 w-3" />
                                                Returned
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {allocation.customer?.name || 'Unknown customer'} • {allocation.eventName || 'No event'}
                                        </p>
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        {allocation.returnedAt ? `Returned: ${formatDate(allocation.returnedAt)}` : 'Returned'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[2rem] border border-dashed border-border bg-card/60 p-8 text-center">
                        <p className="text-sm text-muted-foreground">No returned items yet</p>
                    </div>
                )}
            </section>
        </div>
    )
}
