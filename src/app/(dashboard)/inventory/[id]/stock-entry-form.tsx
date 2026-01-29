'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface StockEntryFormProps {
    itemId: string
    currentCost: number
}

export function StockEntryForm({ itemId, currentCost }: StockEntryFormProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [quantity, setQuantity] = useState('')
    const [cost, setCost] = useState(currentCost.toString())
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Get current user's vendor_id
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data } = await supabase
                .from('users')
                .select('vendor_id')
                .eq('id', user.id)
                .single()

            const userData = data as { vendor_id: string } | null

            if (!userData) throw new Error('User data not found')

            const { error } = await supabase
                .from('stock_entries')
                .insert({
                    vendor_id: userData.vendor_id,
                    item_id: itemId,
                    quantity_added: parseInt(quantity),
                    cost_per_unit: parseFloat(cost),
                    created_by: user.id
                })

            if (error) throw error

            toast({
                title: 'Success',
                description: 'Stock added successfully',
            })

            setOpen(false)
            setQuantity('')
            router.refresh() // Refresh server component to show new stats

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stock
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Stock</DialogTitle>
                    <DialogDescription>Add new inventory units for this item.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity Added</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cost">Cost Per Unit</Label>
                        <Input
                            id="cost"
                            type="number"
                            step="0.01"
                            min="0"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Stock'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
