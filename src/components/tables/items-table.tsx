'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

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
    images?: Array<{
        id: string
        url: string
        isPrimary: boolean
    }>
}

export function ItemsTable({ items }: { items: Item[] }) {
    const getStockStatus = (available: number, reorderPoint: number) => {
        if (available === 0) return { label: 'Out of stock', color: 'text-red-400' }
        if (available <= reorderPoint || available <= 3) return { label: 'Low stock', color: 'text-amber-300' }
        return { label: 'Healthy', color: 'text-emerald-400' }
    }

    if (items.length === 0) {
        return (
            <div className="rounded-[2rem] border border-dashed border-border bg-card/60 p-12 text-center">
                <p className="text-lg">No items yet.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Add your first SKU, upload a few images, and start tracking stock safely.
                </p>
            </div>
        )
    }

    return (
        <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
            <div className="hidden grid-cols-12 gap-4 border-b border-border px-6 py-4 text-xs uppercase tracking-[0.2em] text-muted-foreground md:grid">
                <div className="col-span-5">Item</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2 text-right">Available</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-1" />
            </div>

            {items.map((item) => {
                const primaryImage = item.images?.find((image) => image.isPrimary) ?? item.images?.[0]
                const status = getStockStatus(item.availableQuantity, item.reorderPoint)

                return (
                    <Link
                        key={item.id}
                        href={`/inventory/${item.id}`}
                        className="group grid grid-cols-1 gap-3 border-b border-border/80 px-4 py-5 transition-colors hover:bg-accent/40 md:grid-cols-12 md:gap-4 md:px-6"
                    >
                        <div className="flex items-center gap-4 md:col-span-5">
                            <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-accent">
                                {primaryImage ? (
                                    <Image src={primaryImage.url} alt={item.name} fill sizes="56px" className="object-cover" />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                        No image
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate font-medium">{item.name}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {item.unit} • reorder at {item.reorderPoint}
                                </p>
                            </div>
                        </div>

                        <div className="hidden items-center md:flex md:col-span-2">
                            <span className="rounded-full bg-accent px-3 py-1 text-xs capitalize text-muted-foreground">
                                {item.category}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-sm md:hidden">
                            <span className="capitalize text-muted-foreground">{item.category}</span>
                            <span className={cn('text-xs uppercase tracking-wide', status.color)}>{status.label}</span>
                        </div>

                        <div className="hidden items-center justify-end md:col-span-2 md:flex">
                            <div className="text-right">
                                <p className="text-sm">
                                    {item.availableQuantity} <span className="text-muted-foreground">/ {item.totalQuantity}</span>
                                </p>
                                <p className={cn('mt-0.5 text-xs uppercase tracking-wide', status.color)}>{status.label}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm md:col-span-2 md:justify-end">
                            <div className="min-w-0 text-left md:text-right">
                                <p>{formatCurrency(item.sellingPrice)}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">{formatCurrency(item.costPrice)} cost</p>
                            </div>
                        </div>

                        <div className="hidden items-center justify-end md:col-span-1 md:flex">
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}
