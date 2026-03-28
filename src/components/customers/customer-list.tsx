'use client'

import { useMemo, useState } from 'react'
import { Mail, MapPin, Phone, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Customer {
    id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
    notes: string | null
    createdAt: string
    updatedAt: string
}

export function CustomerList({ customers }: { customers: Customer[] }) {
    const [query, setQuery] = useState('')

    const filteredCustomers = useMemo(() => {
        const search = query.trim().toLowerCase()
        if (!search) return customers

        return customers.filter((customer) =>
            customer.name.toLowerCase().includes(search) ||
            (customer.email ?? '').toLowerCase().includes(search) ||
            (customer.phone ?? '').toLowerCase().includes(search) ||
            (customer.address ?? '').toLowerCase().includes(search)
        )
    }, [customers, query])

    return (
        <div className="space-y-6">
            <div className="rounded-[2rem] border border-border bg-card p-4 md:p-5">
                <label htmlFor="customer-search" className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Search customers
                </label>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="customer-search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9"
                        placeholder="Search by name, email, phone, or address"
                    />
                </div>
            </div>

            {filteredCustomers.length > 0 ? (
                <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
                    {filteredCustomers.map((customer) => (
                        <div key={customer.id} className="border-b border-border px-4 py-5 transition hover:bg-accent/30 md:px-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="min-w-0">
                                    <h3 className="truncate font-medium">{customer.name}</h3>
                                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                        {customer.id.slice(0, 8)}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    {customer.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5" />
                                            <span>{customer.phone}</span>
                                        </div>
                                    )}
                                    {customer.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5" />
                                            <span>{customer.email}</span>
                                        </div>
                                    )}
                                    {customer.address && (
                                        <div className="flex max-w-[240px] items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span className="truncate">{customer.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-[2rem] border border-dashed border-border bg-card/60 p-12 text-center">
                    <p className="text-muted-foreground">No customers match that search.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Try a different name, email, phone, or address.
                    </p>
                </div>
            )}
        </div>
    )
}
