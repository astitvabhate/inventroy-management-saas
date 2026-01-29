'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowUpRight, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AllocationFormProps {
    itemId: string
    itemName: string
    availableQuantity: number
}

type Customer = { id: string, name: string }

export function AllocationForm({ itemId, itemName, availableQuantity }: AllocationFormProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [quantity, setQuantity] = useState('1')
    const [customerId, setCustomerId] = useState('')
    const [eventName, setEventName] = useState('')
    const [eventDate, setEventDate] = useState('')
    const [expectedReturnDate, setExpectedReturnDate] = useState('')
    const [customers, setCustomers] = useState<Customer[]>([])

    // New customer form
    const [isAddingCustomer, setIsAddingCustomer] = useState(false)
    const [newCustomerName, setNewCustomerName] = useState('')
    const [newCustomerPhone, setNewCustomerPhone] = useState('')

    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()

    // Fetch customers when dialog opens
    useEffect(() => {
        if (open) {
            const fetchCustomers = async () => {
                const { data } = await supabase.from('customers').select('id, name').order('name')
                if (data) setCustomers(data)
            }
            fetchCustomers()
        }
    }, [open, supabase])

    const handleAddCustomer = async () => {
        if (!newCustomerName.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Customer name is required' })
            return
        }

        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data: userData } = await supabase
                .from('users')
                .select('vendor_id')
                .eq('id', user.id)
                .single()

            if (!userData) throw new Error('User data not found')

            const { data: newCustomer, error } = await supabase
                .from('customers')
                .insert({
                    vendor_id: userData.vendor_id,
                    name: newCustomerName.trim(),
                    phone: newCustomerPhone.trim() || null,
                })
                .select()
                .single()

            if (error) throw error

            // Add to list and select it
            setCustomers([...customers, { id: newCustomer.id, name: newCustomer.name }])
            setCustomerId(newCustomer.id)
            setIsAddingCustomer(false)
            setNewCustomerName('')
            setNewCustomerPhone('')

            toast({ title: 'Success', description: 'Customer added' })
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (parseInt(quantity) > availableQuantity) {
                throw new Error(`Only ${availableQuantity} units available`)
            }

            if (!customerId) {
                throw new Error('Please select a customer')
            }

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
                .from('usage')
                .insert({
                    vendor_id: userData.vendor_id,
                    item_id: itemId,
                    customer_id: customerId,
                    quantity_used: parseInt(quantity),
                    event_name: eventName || null,
                    event_date: eventDate || null,
                    expected_return_date: expectedReturnDate || null,
                    created_by: user.id
                })

            if (error) throw error

            toast({ title: 'Success', description: 'Items allocated successfully' })

            setOpen(false)
            setQuantity('1')
            setCustomerId('')
            setEventName('')
            setEventDate('')
            setExpectedReturnDate('')
            router.refresh()

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Allocate
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Allocate Item</DialogTitle>
                    <DialogDescription>Assign {itemName} to a customer/event.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Customer Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="customer">Customer *</Label>

                        {isAddingCustomer ? (
                            <div className="space-y-3 p-4 border border-border bg-accent/30">
                                <Input
                                    placeholder="Customer name *"
                                    value={newCustomerName}
                                    onChange={(e) => setNewCustomerName(e.target.value)}
                                />
                                <Input
                                    placeholder="Phone (optional)"
                                    value={newCustomerPhone}
                                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleAddCustomer}
                                        disabled={loading}
                                    >
                                        Add Customer
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setIsAddingCustomer(false)}
                                    >
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
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setIsAddingCustomer(true)}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity * (Max: {availableQuantity})</Label>
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
                        <Label htmlFor="eventName">Event Name</Label>
                        <Input
                            id="eventName"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            placeholder="Wedding, Corporate, etc."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="eventDate">Event Date</Label>
                        <Input
                            id="eventDate"
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="expectedReturnDate">Expected Return Date</Label>
                        <Input
                            id="expectedReturnDate"
                            type="date"
                            value={expectedReturnDate}
                            onChange={(e) => setExpectedReturnDate(e.target.value)}
                        />
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
