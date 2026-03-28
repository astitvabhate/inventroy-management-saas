'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Check, RotateCcw } from 'lucide-react'
import { setAllocationReturnedAction } from '@/lib/actions/inventory'
import { formatDate } from '@/lib/format'

interface Allocation {
    id: string
    quantityUsed: number
    eventName: string | null
    eventDate: string | null
    expectedReturnDate: string | null
    isReturned: boolean
    returnedAt: string | null
    createdAt: string
    customer: { id: string; name: string } | null
}

interface AllocationListProps {
    allocations: Allocation[]
}

export function AllocationList({ allocations }: AllocationListProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const router = useRouter()
    const { toast } = useToast()

    const handleToggle = async (allocationId: string, isReturned: boolean) => {
        setLoadingId(allocationId)
        try {
            const result = await setAllocationReturnedAction({ allocationId, isReturned })
            if (!result.ok) {
                throw new Error(result.message)
            }

            toast({ title: 'Success', description: result.message })
            router.refresh()
        } catch (error: unknown) {
            toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Unable to update allocation.' })
        } finally {
            setLoadingId(null)
        }
    }

    if (allocations.length === 0) {
        return (
            <div className="rounded-[1.5rem] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No allocations yet
            </div>
        )
    }

    const sortedAllocations = [...allocations].sort((a, b) => {
        if (a.isReturned === b.isReturned) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        return a.isReturned ? 1 : -1
    })

    return (
        <div className="space-y-3">
            {sortedAllocations.map((allocation) => {
                const isOverdue = !allocation.isReturned &&
                    allocation.expectedReturnDate &&
                    new Date(allocation.expectedReturnDate) < new Date()

                return (
                    <div
                        key={allocation.id}
                        className={cn(
                            'flex flex-col gap-4 rounded-[1.5rem] border p-4 transition-colors sm:flex-row sm:justify-between',
                            allocation.isReturned
                                ? 'border-border/50 bg-accent/30 opacity-60'
                                : isOverdue
                                    ? 'border-red-500/50 bg-red-500/5'
                                    : 'border-border bg-card'
                        )}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                <p className="font-medium truncate">
                                    {allocation.customer?.name || 'Unknown customer'}
                                </p>
                                {allocation.isReturned && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs uppercase tracking-wide text-emerald-500">
                                        <Check className="h-3 w-3" />
                                        Returned
                                    </span>
                                )}
                                {isOverdue && (
                                    <span className="rounded-full bg-red-500/10 px-2 py-1 text-xs uppercase tracking-wide text-red-500">
                                        Overdue
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {allocation.eventName || 'No event specified'}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span>Qty: {allocation.quantityUsed}</span>
                                {allocation.eventDate && (
                                    <span>Event: {formatDate(allocation.eventDate)}</span>
                                )}
                                {allocation.expectedReturnDate && (
                                    <span>Return: {formatDate(allocation.expectedReturnDate)}</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {allocation.isReturned ? (
                                <button
                                    onClick={() => handleToggle(allocation.id, false)}
                                    disabled={loadingId === allocation.id}
                                    className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs transition-colors hover:bg-accent disabled:opacity-50"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    Undo
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleToggle(allocation.id, true)}
                                    disabled={loadingId === allocation.id}
                                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-2 text-xs text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                                >
                                    <Check className="h-3 w-3" />
                                    {loadingId === allocation.id ? 'Updating...' : 'Mark returned'}
                                </button>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
