'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ItemsTable } from '@/components/tables/items-table'

interface Item {
    id: string
    name: string
    category: string
    totalQuantity: number
    availableQuantity: number
    costPrice: number
    sellingPrice: number
    reorderPoint: number
    unit: string
    sku?: string | null
    images?: Array<{
        id: string
        url: string
        isPrimary: boolean
    }>
}

export function InventoryList({ items }: { items: Item[] }) {
    const [query, setQuery] = useState('')

    const filteredItems = useMemo(() => {
        const search = query.trim().toLowerCase()
        if (!search) return items

        return items.filter((item) =>
            item.name.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search) ||
            item.unit.toLowerCase().includes(search) ||
            (item.sku ?? '').toLowerCase().includes(search)
        )
    }, [items, query])

    return (
        <div className="space-y-6">
            <div className="rounded-[2rem] border border-border bg-card p-4 md:p-5">
                <label htmlFor="inventory-search" className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Search inventory
                </label>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="inventory-search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9"
                        placeholder="Search by item name, SKU, category, or unit"
                    />
                </div>
            </div>

            <ItemsTable items={filteredItems} />
        </div>
    )
}
