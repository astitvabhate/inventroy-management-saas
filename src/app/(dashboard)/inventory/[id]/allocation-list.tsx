'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Check, RotateCcw } from 'lucide-react'

interface Allocation {
    id: string
    quantity_used: number
    event_name: string | null
    event_date: string | null
    expected_return_date: string | null
    is_returned: boolean
    returned_at: string | null
    created_at: string
    customers: { name: string } | null
}

interface AllocationListProps {
    allocations: Allocation[]
}

export function AllocationList({ allocations }: AllocationListProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()

    const handleMarkReturned = async (allocationId: string) => {
        setLoadingId(allocationId)
        try {
            const { error } = await supabase
                .from('usage')
                .update({
                    is_returned: true,
                    returned_at: new Date().toISOString()
                })
                .eq('id', allocationId)

            if (error) throw error

            toast({ title: 'Success', description: 'Marked as returned' })
            router.refresh()
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message })
        } finally {
            setLoadingId(null)
        }
    }

    const handleUndoReturn = async (allocationId: string) => {
        setLoadingId(allocationId)
        try {
            const { error } = await supabase
                .from('usage')
                .update({
                    is_returned: false,
                    returned_at: null
                })
                .eq('id', allocationId)

            if (error) throw error

            toast({ title: 'Success', description: 'Undo successful' })
            router.refresh()
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message })
        } finally {
            setLoadingId(null)
        }
    }

    if (allocations.length === 0) {
        return (
            <div className="py-8 border border-dashed border-border text-center text-sm text-muted-foreground">
                No allocations yet
            </div>
        )
    }

    // Sort: pending first, then returned
    const sortedAllocations = [...allocations].sort((a, b) => {
        if (a.is_returned === b.is_returned) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
        return a.is_returned ? 1 : -1
    })

    return (
        <div className="space-y-3">
            {sortedAllocations.map((allocation) => {
                const isOverdue = !allocation.is_returned &&
                    allocation.expected_return_date &&
                    new Date(allocation.expected_return_date) < new Date()

                return (
                    <div
                        key={allocation.id}
                        className={cn(
                            "flex flex-col sm:flex-row justify-between gap-4 p-4 border transition-colors",
                            allocation.is_returned
                                ? "border-border/50 bg-accent/30 opacity-60"
                                : isOverdue
                                    ? "border-red-500/50 bg-red-500/5"
                                    : "border-border"
                        )}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium truncate">
                                    {allocation.customers?.name || 'Unknown Customer'}
                                </p>
                                {allocation.is_returned && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-xs">
                                        <Check className="w-3 h-3" />
                                        Returned
                                    </span>
                                )}
                                {isOverdue && (
                                    <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-xs">
                                        Overdue
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {allocation.event_name || 'No event specified'}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                                <span>Qty: {allocation.quantity_used}</span>
                                {allocation.event_date && (
                                    <span>Event: {new Date(allocation.event_date).toLocaleDateString()}</span>
                                )}
                                {allocation.expected_return_date && (
                                    <span>Return: {new Date(allocation.expected_return_date).toLocaleDateString()}</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            {allocation.is_returned ? (
                                <button
                                    onClick={() => handleUndoReturn(allocation.id)}
                                    disabled={loadingId === allocation.id}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-xs border border-border hover:bg-accent transition-colors disabled:opacity-50"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    Undo
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleMarkReturned(allocation.id)}
                                    disabled={loadingId === allocation.id}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-xs bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    <Check className="w-3 h-3" />
                                    {loadingId === allocation.id ? 'Updating...' : 'Mark Returned'}
                                </button>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
