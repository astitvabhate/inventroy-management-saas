'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { SupabaseClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/image-upload'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'

export default function NewItemPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [uploadedImages, setUploadedImages] = useState<string[]>([])

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        cost_price: '',
        selling_price: '',
        initial_quantity: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const supabase = createClient() as SupabaseClient<Database>

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data: userData } = await supabase
                .from('users')
                .select('vendor_id')
                .eq('id', user.id)
                .single()

            if (!userData) throw new Error('User data not found')

            const { data: item, error: itemError } = await supabase
                .from('items')
                .insert({
                    vendor_id: userData.vendor_id,
                    name: formData.name,
                    description: formData.description,
                    category: formData.category,
                    cost_price: parseFloat(formData.cost_price),
                    selling_price: parseFloat(formData.selling_price),
                    total_quantity: 0,
                    available_quantity: 0,
                } as Database['public']['Tables']['items']['Insert'])
                .select()
                .single()

            if (itemError) throw itemError

            if (formData.initial_quantity && parseInt(formData.initial_quantity) > 0) {
                const { error: stockError } = await supabase
                    .from('stock_entries')
                    .insert({
                        vendor_id: userData.vendor_id,
                        item_id: item.id,
                        quantity_added: parseInt(formData.initial_quantity),
                        cost_per_unit: parseFloat(formData.cost_price),
                        created_by: user.id,
                    } as Database['public']['Tables']['stock_entries']['Insert'])

                if (stockError) throw stockError
            }

            if (uploadedImages.length > 0) {
                const imageRecords = uploadedImages.map((path, index) => ({
                    vendor_id: userData.vendor_id,
                    item_id: item.id,
                    path,
                    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vendor-item-images/${path}`,
                    file_name: path.split('/').pop() || '',
                    is_primary: index === 0,
                }))

                const { error: imageError } = await supabase
                    .from('item_images')
                    .insert(imageRecords as Database['public']['Tables']['item_images']['Insert'][])

                if (imageError) throw imageError
            }

            toast({ title: 'Success', description: 'Item created successfully' })
            router.push('/inventory')
            router.refresh()
        } catch (error: any) {
            console.error(error)
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="px-4 md:px-8 py-8 md:py-12 max-w-2xl">
            {/* Back Link */}
            <Link
                href="/inventory"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to inventory
            </Link>

            <h1 className="text-3xl md:text-4xl tracking-tight mb-8">Add New Item</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">
                        Item Name *
                    </Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="mt-2"
                        placeholder="Enter item name"
                    />
                </div>

                <div>
                    <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground">
                        Description
                    </Label>
                    <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-2"
                        placeholder="Optional description"
                    />
                </div>

                <div>
                    <Label htmlFor="category" className="text-xs uppercase tracking-wider text-muted-foreground">
                        Category *
                    </Label>
                    <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                        <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="flowers">Flowers</SelectItem>
                            <SelectItem value="lights">Lights</SelectItem>
                            <SelectItem value="fabrics">Fabrics</SelectItem>
                            <SelectItem value="props">Props</SelectItem>
                            <SelectItem value="furniture">Furniture</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="cost_price" className="text-xs uppercase tracking-wider text-muted-foreground">
                            Cost Price (₹) *
                        </Label>
                        <Input
                            id="cost_price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.cost_price}
                            onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                            required
                            className="mt-2"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <Label htmlFor="selling_price" className="text-xs uppercase tracking-wider text-muted-foreground">
                            Selling Price (₹) *
                        </Label>
                        <Input
                            id="selling_price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.selling_price}
                            onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                            required
                            className="mt-2"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="initial_quantity" className="text-xs uppercase tracking-wider text-muted-foreground">
                        Initial Quantity
                    </Label>
                    <Input
                        id="initial_quantity"
                        type="number"
                        min="0"
                        value={formData.initial_quantity}
                        onChange={(e) => setFormData({ ...formData, initial_quantity: e.target.value })}
                        className="mt-2"
                        placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                        You can add stock later if you leave this empty
                    </p>
                </div>

                <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground block mb-3">
                        Item Images
                    </Label>
                    <ImageUpload
                        onImagesUploaded={setUploadedImages}
                        maxImages={5}
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Item'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    )
}
