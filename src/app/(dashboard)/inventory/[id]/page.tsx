import { createClient } from '@/lib/supabase/server'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { StockEntryForm } from "@/app/(dashboard)/inventory/[id]/stock-entry-form"
import { AllocationForm } from "@/app/(dashboard)/inventory/[id]/allocation-form"
import { ImageGallery } from "@/app/(dashboard)/inventory/[id]/image-gallery"
import { AllocationList } from "@/app/(dashboard)/inventory/[id]/allocation-list"
import { ArrowLeft, Edit } from 'lucide-react'

export default async function ItemDetailsPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const { data: item } = await supabase
        .from('items')
        .select(`
            *,
            item_images (*),
            stock_entries (*),
            usage (
                *,
                customers (name)
            )
        `)
        .eq('id', id)
        .single()

    if (!item) {
        return (
            <div className="px-4 md:px-8 py-12 text-center">
                <p className="text-muted-foreground">Item not found</p>
                <Link href="/inventory" className="text-sm underline mt-4 inline-block">
                    Back to inventory
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="px-4 md:px-8 py-6 md:py-12 border-b border-border">
                <div className="flex flex-col gap-6">
                    {/* Back Link */}
                    <Link
                        href="/inventory"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to inventory
                    </Link>

                    {/* Title and Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                                {item.category}
                            </p>
                            <h1 className="text-3xl md:text-5xl tracking-tight">{item.name}</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <AllocationForm
                                itemId={item.id}
                                itemName={item.name}
                                availableQuantity={item.available_quantity}
                            />
                            <Link
                                href={`/inventory/${id}/edit`}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm hover:bg-accent transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Left: Media & Stats */}
                <div className="lg:col-span-5 p-4 md:p-8 lg:border-r border-border">
                    <div className="lg:sticky lg:top-24 space-y-8">
                        {/* Image Gallery */}
                        <ImageGallery images={item.item_images || []} itemName={item.name} />

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-4 border border-border">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Cost</p>
                                <p className="text-2xl tracking-tight">₹{item.cost_price.toLocaleString()}</p>
                            </div>
                            <div className="p-4 border border-border">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Price</p>
                                <p className="text-2xl tracking-tight">₹{item.selling_price.toLocaleString()}</p>
                            </div>
                            <div className="p-4 border border-border">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total Stock</p>
                                <p className="text-2xl tracking-tight">{item.total_quantity}</p>
                            </div>
                            <div className="p-4 border border-border">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Available</p>
                                <p className="text-2xl tracking-tight">{item.available_quantity}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Details & History */}
                <div className="lg:col-span-7 p-4 md:p-8 space-y-12">
                    {/* Description */}
                    {item.description && (
                        <section>
                            <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Description</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {item.description}
                            </p>
                        </section>
                    )}

                    <Separator />

                    {/* Stock Entries */}
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xs text-muted-foreground uppercase tracking-wider">Stock History</h2>
                            <StockEntryForm itemId={item.id} currentCost={item.cost_price} />
                        </div>

                        {item.stock_entries && item.stock_entries.length > 0 ? (
                            <div className="space-y-3">
                                {item.stock_entries.map((entry: any) => (
                                    <div key={entry.id} className="flex justify-between items-center p-4 border border-border">
                                        <div>
                                            <p className="text-sm font-medium">+{entry.quantity_added} units</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(entry.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm">₹{entry.total_cost.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">
                                                ₹{entry.cost_per_unit}/unit
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 border border-dashed border-border text-center text-sm text-muted-foreground">
                                No stock entries yet
                            </div>
                        )}
                    </section>

                    <Separator />

                    {/* Allocations */}
                    <section className="pb-12">
                        <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-6">Allocations</h2>
                        <AllocationList allocations={item.usage || []} />
                    </section>
                </div>
            </div>
        </div>
    )
}
