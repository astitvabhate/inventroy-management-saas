import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { requireSessionUser } from '@/lib/auth/session'
import { getItemDetails } from '@/lib/data/inventory'
import { formatCurrency, formatDate } from '@/lib/format'
import { AllocationForm } from '@/app/(dashboard)/inventory/[id]/allocation-form'
import { AllocationList } from '@/app/(dashboard)/inventory/[id]/allocation-list'
import { ImageGallery } from '@/app/(dashboard)/inventory/[id]/image-gallery'
import { StockEntryForm } from '@/app/(dashboard)/inventory/[id]/stock-entry-form'
import { BackButton } from '@/components/back-button'

export default async function ItemDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const user = await requireSessionUser()
    const details = await getItemDetails(user, id)

    if (!details) {
        return (
            <div className="px-4 py-12 text-center md:px-8">
                <p className="text-muted-foreground">Item not found.</p>
                <Link href="/inventory" className="mt-4 inline-block text-sm underline">
                    Back to inventory
                </Link>
            </div>
        )
    }

    const { item, stockEntries, allocations, customers } = details

    return (
        <div className="min-h-screen">
            <div className="border-b border-border px-4 py-6 md:px-8 md:py-10">
                <div className="flex flex-col gap-6">
                    <BackButton fallbackHref="/inventory" label="Back to inventory" />

                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                {item.category}
                            </p>
                            <h1 className="text-3xl tracking-tight md:text-5xl">{item.name}</h1>
                            <p className="mt-3 text-sm text-muted-foreground">
                                {item.unit} • reorder at {item.reorderPoint} • SKU {item.sku || 'not set'}
                            </p>
                        </div>

                        <AllocationForm
                            itemId={item.id}
                            itemName={item.name}
                            availableQuantity={item.availableQuantity}
                            customers={customers}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="p-4 md:p-8 lg:col-span-5 lg:border-r lg:border-border">
                    <div className="space-y-8 lg:sticky lg:top-24">
                        <ImageGallery images={item.images || []} itemName={item.name} />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-[1.5rem] border border-border bg-card p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cost</p>
                                <p className="mt-2 text-2xl tracking-tight">{formatCurrency(item.costPrice)}</p>
                            </div>
                            <div className="rounded-[1.5rem] border border-border bg-card p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Price</p>
                                <p className="mt-2 text-2xl tracking-tight">{formatCurrency(item.sellingPrice)}</p>
                            </div>
                            <div className="rounded-[1.5rem] border border-border bg-card p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total stock</p>
                                <p className="mt-2 text-2xl tracking-tight">{item.totalQuantity}</p>
                            </div>
                            <div className="rounded-[1.5rem] border border-border bg-card p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Available</p>
                                <p className="mt-2 text-2xl tracking-tight">{item.availableQuantity}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-12 p-4 md:p-8 lg:col-span-7">
                    {item.description && (
                        <section>
                            <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">Description</h2>
                            <p className="text-lg leading-relaxed text-muted-foreground">{item.description}</p>
                        </section>
                    )}

                    <Separator />

                    <section>
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Stock history</h2>
                            <StockEntryForm itemId={item.id} currentCost={item.costPrice} />
                        </div>

                        {stockEntries.length > 0 ? (
                            <div className="space-y-3">
                                {stockEntries.map((entry) => (
                                    <div key={entry.id} className="flex flex-col justify-between gap-3 rounded-[1.5rem] border border-border bg-card p-4 sm:flex-row sm:items-center">
                                        <div>
                                            <p className="text-sm font-medium">+{entry.quantityAdded} units</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(entry.date)}
                                            </p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-sm">{formatCurrency(entry.totalCost)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatCurrency(entry.costPerUnit)} / unit
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[1.5rem] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                                No stock entries yet
                            </div>
                        )}
                    </section>

                    <Separator />

                    <section className="pb-12">
                        <h2 className="mb-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">Allocations</h2>
                        <AllocationList allocations={allocations} />
                    </section>
                </div>
            </div>
        </div>
    )
}
