import { createClient } from '@/lib/supabase/server'
import { ItemsTable } from '@/components/tables/items-table'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function InventoryPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
   if (!user) return <div className="p-8">Please log in <Link href="/login" className="text-primary">here</Link></div>

    const { data: items } = await supabase
        .from('items')
        .select(`
            *,
            item_images (
                id,
                url,
                is_primary
            )
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="px-8 py-12">
            {/* Header */}
            <header className="flex items-end justify-between mb-12">
                <div>
                    <p className="text-sm text-muted-foreground mb-2">Manage</p>
                    <h1 className="text-4xl md:text-5xl tracking-tight">Inventory</h1>
                </div>
                <Link
                    href="/inventory/new"
                    className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-sm hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-4 h-4" />
                    Add Item
                </Link>
            </header>

            {/* Items Table */}
            <ItemsTable items={items || []} />
        </div>
    )
}
