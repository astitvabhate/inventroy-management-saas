'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload, type UploadedImage } from '@/components/image-upload'
import { useToast } from '@/hooks/use-toast'
import { createItemAction } from '@/lib/actions/inventory'
import { BackButton } from '@/components/back-button'

const categories = ['electronics', 'supplies', 'equipment', 'packaging', 'materials', 'office', 'other']

export default function NewItemPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        customCategory: '',
        unit: 'unit',
        sku: '',
        reorderPoint: '3',
        costPrice: '',
        sellingPrice: '',
        initialQuantity: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await createItemAction({
                name: formData.name,
                description: formData.description,
                category: formData.category === 'other' ? formData.customCategory : formData.category,
                unit: formData.unit,
                sku: formData.sku,
                reorderPoint: Number(formData.reorderPoint || 0),
                costPrice: Number(formData.costPrice),
                sellingPrice: Number(formData.sellingPrice),
                initialQuantity: Number(formData.initialQuantity || 0),
                images: uploadedImages,
            })

            if (!result.ok) {
                throw new Error(result.message)
            }

            toast({ title: 'Success', description: result.message })
            router.push(`/inventory/${result.itemId}`)
            router.refresh()
        } catch (error: unknown) {
            toast({ title: 'Error', description: error instanceof Error ? error.message : 'Unable to create item.', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl px-4 py-8 md:px-8 md:py-12">
            <BackButton fallbackHref="/inventory" label="Back to inventory" className="mb-8" />

            <h1 className="text-3xl tracking-tight md:text-4xl">Add New Item</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                Create a clean catalog entry with pricing, reorder context, and product imagery.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-[2rem] border border-border bg-card p-6 md:p-8">
                <div>
                    <Label htmlFor="name" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Item name
                    </Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="mt-2"
                        placeholder="Portable work light"
                    />
                </div>

                <div>
                    <Label htmlFor="description" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Description
                    </Label>
                    <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-2"
                        placeholder="Short description for the team"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="category" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Category
                        </Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {formData.category === 'other' && (
                            <Input
                                value={formData.customCategory}
                                onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                                className="mt-3"
                                placeholder="Enter custom category"
                                required
                            />
                        )}
                    </div>
                    <div>
                        <Label htmlFor="unit" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Unit
                        </Label>
                        <Input
                            id="unit"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            className="mt-2"
                            placeholder="unit, box, set"
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="sku" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            SKU
                        </Label>
                        <Input
                            id="sku"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            className="mt-2"
                            placeholder="INV-1042"
                        />
                    </div>
                    <div>
                        <Label htmlFor="reorderPoint" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Reorder point
                        </Label>
                        <Input
                            id="reorderPoint"
                            type="number"
                            min="0"
                            value={formData.reorderPoint}
                            onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                            className="mt-2"
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <Label htmlFor="costPrice" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Cost price
                        </Label>
                        <Input
                            id="costPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.costPrice}
                            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                            required
                            className="mt-2"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <Label htmlFor="sellingPrice" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Selling price
                        </Label>
                        <Input
                            id="sellingPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.sellingPrice}
                            onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                            required
                            className="mt-2"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <Label htmlFor="initialQuantity" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Initial quantity
                        </Label>
                        <Input
                            id="initialQuantity"
                            type="number"
                            min="0"
                            value={formData.initialQuantity}
                            onChange={(e) => setFormData({ ...formData, initialQuantity: e.target.value })}
                            className="mt-2"
                            placeholder="0"
                        />
                    </div>
                </div>

                <div>
                    <Label className="mb-3 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Item images
                    </Label>
                    <ImageUpload onImagesUploaded={setUploadedImages} maxImages={5} />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create item'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            if (window.history.length > 1) {
                                router.back()
                                return
                            }
                            router.push('/inventory')
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    )
}
