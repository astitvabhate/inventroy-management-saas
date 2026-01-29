'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from "@/lib/utils"
import { ArrowRight } from 'lucide-react'

interface Item {
    id: string
    name: string
    category: string
    total_quantity: number
    available_quantity: number
    cost_price: number
    selling_price: number
    item_images?: Array<{
        id: string
        url: string
        is_primary: boolean
    }>
}

export function ItemsTable({ items }: { items: Item[] }) {
    const getStockStatus = (available: number, total: number) => {
        const percentage = total > 0 ? (available / total) * 100 : 0
        if (percentage === 0) return { label: 'Out of Stock', color: 'text-red-400' }
        if (percentage < 20) return { label: 'Low Stock', color: 'text-amber-400' }
        return { label: 'In Stock', color: 'text-emerald-400' }
    }

    if (items.length === 0) {
        return (
            <div className="border border-border p-12 text-center">
                <p className="text-muted-foreground">No items yet. Add your first item to get started.</p>
            </div>
        )
    }

    return (
        <div className="border border-border divide-y divide-border">
            {/* Header - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 md:px-6 py-4 text-xs text-muted-foreground uppercase tracking-wider">
                <div className="col-span-5">Item</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2 text-right">Stock</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-1"></div>
            </div>

            {/* Items */}
            {items.map((item) => {
                const primaryImage = item.item_images?.find(img => img.is_primary) || item.item_images?.[0]
                const status = getStockStatus(item.available_quantity, item.total_quantity)

                return (
                    <Link
                        key={item.id}
                        href={`/inventory/${item.id}`}
                        className="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-4 md:py-6 hover:bg-accent/50 transition-colors"
                    >
                        {/* Item Info */}
                        <div className="md:col-span-5 flex items-center gap-3 md:gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-accent overflow-hidden flex-shrink-0">
                                {primaryImage ? (
                                    <Image
                                        src={primaryImage.url}
                                        alt={item.name}
                                        width={56}
                                        height={56}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                        —
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground md:hidden capitalize">{item.category}</p>
                            </div>
                        </div>

                        {/* Category - Desktop only */}
                        <div className="hidden md:flex md:col-span-2 items-center">
                            <span className="text-sm text-muted-foreground capitalize">{item.category}</span>
                        </div>

                        {/* Mobile: Stock + Price in a row */}
                        <div className="md:hidden flex items-center justify-between text-sm">
                            <div>
                                <span>{item.available_quantity}</span>
                                <span className="text-muted-foreground"> / {item.total_quantity}</span>
                                <span className={cn("ml-2 text-xs", status.color)}>{status.label}</span>
                            </div>
                            <span>₹{item.selling_price.toLocaleString()}</span>
                        </div>

                        {/* Stock - Desktop */}
                        <div className="hidden md:flex md:col-span-2 items-center justify-end">
                            <div className="text-right">
                                <p className="text-sm">
                                    {item.available_quantity} <span className="text-muted-foreground">/ {item.total_quantity}</span>
                                </p>
                                <p className={cn("text-xs mt-0.5", status.color)}>{status.label}</p>
                            </div>
                        </div>

                        {/* Price - Desktop */}
                        <div className="hidden md:flex md:col-span-2 items-center justify-end">
                            <div className="text-right">
                                <p className="text-sm">₹{item.selling_price.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">₹{item.cost_price.toLocaleString()} cost</p>
                            </div>
                        </div>

                        {/* Arrow - Desktop */}
                        <div className="hidden md:flex md:col-span-1 items-center justify-end">
                            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}
