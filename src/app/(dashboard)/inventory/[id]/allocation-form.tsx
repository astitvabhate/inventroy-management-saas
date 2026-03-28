'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowUpRight, CalendarDays, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createAllocationAction, createCustomerAction } from '@/lib/actions/inventory'

interface AllocationFormProps {
    itemId: string
    itemName: string
    availableQuantity: number
    customers: Array<{ id: string; name: string }>
}

export function AllocationForm({ itemId, itemName, availableQuantity, customers }: AllocationFormProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [quantity, setQuantity] = useState('1')
    const [customerId, setCustomerId] = useState('')
    const [eventName, setEventName] = useState('')
    const [eventDate, setEventDate] = useState('')
    const [expectedReturnDate, setExpectedReturnDate] = useState('')
    const [isAddingCustomer, setIsAddingCustomer] = useState(false)
    const [newCustomerName, setNewCustomerName] = useState('')
    const [newCustomerPhone, setNewCustomerPhone] = useState('')
    const router = useRouter()
    const { toast } = useToast()

    const handleAddCustomer = async () => {
        if (!newCustomerName.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Customer name is required' })
            return
        }

        setLoading(true)
        try {
            const result = await createCustomerAction({
                name: newCustomerName.trim(),
                phone: newCustomerPhone.trim(),
            })

            if (!result.ok || !result.customerId) {
                throw new Error(result.message)
            }

            setCustomerId(result.customerId)
            setIsAddingCustomer(false)
            setNewCustomerName('')
            setNewCustomerPhone('')
            router.refresh()
            toast({ title: 'Success', description: result.message })
        } catch (error: unknown) {
            toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Unable to add customer.' })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (Number(quantity) > availableQuantity) {
                throw new Error(`Only ${availableQuantity} units available`)
            }

            if (!customerId) {
                throw new Error('Please select a customer')
            }

            const result = await createAllocationAction({
                itemId,
                customerId,
                quantityUsed: Number(quantity),
                eventName,
                eventDate,
                expectedReturnDate,
            })

            if (!result.ok) {
                throw new Error(result.message)
            }

            toast({ title: 'Success', description: result.message })
            setOpen(false)
            setQuantity('1')
            setCustomerId('')
            setEventName('')
            setEventDate('')
            setExpectedReturnDate('')
            router.refresh()
        } catch (error: unknown) {
            toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Unable to create allocation.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Allocate
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Allocate Item</DialogTitle>
                    <DialogDescription>Assign {itemName} to a customer or event.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="customer">Customer</Label>
                        {isAddingCustomer ? (
                            <div className="space-y-3 rounded-2xl border border-border bg-accent/30 p-4">
                                <Input
                                    placeholder="Customer name"
                                    value={newCustomerName}
                                    onChange={(e) => setNewCustomerName(e.target.value)}
                                />
                                <Input
                                    placeholder="Phone (optional)"
                                    value={newCustomerPhone}
                                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Button type="button" size="sm" onClick={handleAddCustomer} disabled={loading}>
                                        Add customer
                                    </Button>
                                    <Button type="button" size="sm" variant="ghost" onClick={() => setIsAddingCustomer(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Select value={customerId} onValueChange={setCustomerId}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Select customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map((customer) => (
                                            <SelectItem key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="button" variant="outline" size="icon" onClick={() => setIsAddingCustomer(true)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity (max {availableQuantity})</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            max={availableQuantity}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="eventName">Event or purpose</Label>
                        <Input
                            id="eventName"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            placeholder="Site install, event, transfer"
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="eventDate">Event date</Label>
                            <div className="relative">
                                <Input
                                    id="eventDate"
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="pr-10"
                                />
                                <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/80" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expectedReturnDate">Expected return date</Label>
                            <div className="relative">
                                <Input
                                    id="expectedReturnDate"
                                    type="date"
                                    value={expectedReturnDate}
                                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                                    className="pr-10"
                                />
                                <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/80" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading || isAddingCustomer}>
                            {loading ? 'Allocating...' : 'Allocate'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
