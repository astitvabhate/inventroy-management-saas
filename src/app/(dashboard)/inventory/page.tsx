import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireSessionUser } from '@/lib/auth/session'
import { listInventoryItems } from '@/lib/data/inventory'
import { InventoryList } from '@/components/inventory/inventory-list'

export default async function InventoryPage() {
    const user = await requireSessionUser()
    const items = await listInventoryItems(user)

    return (
        <div className="px-4 py-8 md:px-8 md:py-12">
            <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">Manage catalog</p>
                    <h1 className="mt-2 text-4xl tracking-tight md:text-5xl">Inventory</h1>
                    <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                        Keep stock levels, pricing, and visuals organized in one production-ready workspace.
                    </p>
                </div>
                <Link
                    href="/inventory/new"
                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm text-background transition hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    Add item
                </Link>
            </header>

            <InventoryList items={items} />
        </div>
    )
}
