'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'

interface ImageUploadProps {
    vendorId?: string
    itemId?: string
    maxImages?: number
    onImagesUploaded: (paths: string[]) => void
}

export function ImageUpload({
    vendorId,
    itemId,
    maxImages = 5,
    onImagesUploaded,
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [images, setImages] = useState<Array<{ path: string; url: string }>>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()
    const supabase = createClient()

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])

        if (files.length === 0) return
        if (images.length + files.length > maxImages) {
            toast({
                title: 'Too many images',
                description: `You can only upload up to ${maxImages} images`,
                variant: 'destructive',
            })
            return
        }

        setUploading(true)

        try {
            // Get current user's vendor_id if not provided
            let currentVendorId = vendorId
            if (!currentVendorId) {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('Not authenticated')

                const { data: userData } = await supabase
                    .from('users')
                    .select('vendor_id')
                    .eq('id', user.id)
                    .single()

                if (userData) {
                    currentVendorId = userData.vendor_id
                } else {
                    // Fallback or error if no vendor link
                }
            }

            if (!currentVendorId) throw new Error('Vendor ID not found')

            const uploadedImagesList: Array<{ path: string; url: string }> = []

            for (const file of files) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    toast({
                        title: 'Invalid file',
                        description: `${file.name} is not an image`,
                        variant: 'destructive',
                    })
                    continue
                }

                // Validate file size (5MB max)
                if (file.size > 5 * 1024 * 1024) {
                    toast({
                        title: 'File too large',
                        description: `${file.name} exceeds 5MB`,
                        variant: 'destructive',
                    })
                    continue
                }

                // Generate unique filename
                const fileExt = file.name.split('.').pop()
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
                const filePath = itemId
                    ? `${currentVendorId}/${itemId}/${fileName}`
                    : `${currentVendorId}/temp/${fileName}`

                // Upload to Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from('vendor-item-images')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false,
                    })

                if (uploadError) throw uploadError

                // Get public URL
                const { data } = supabase.storage
                    .from('vendor-item-images')
                    .getPublicUrl(filePath)

                uploadedImagesList.push({ path: filePath, url: data.publicUrl })
            }

            const newImages = [...images, ...uploadedImagesList];
            setImages(newImages)
            onImagesUploaded(newImages.map(img => img.path))

            toast({
                title: 'Success',
                description: `${uploadedImagesList.length} image(s) uploaded`,
            })
        } catch (error: any) {
            toast({
                title: 'Upload failed',
                description: error.message,
                variant: 'destructive',
            })
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleRemoveImage = async (index: number) => {
        const image = images[index]

        try {
            // Delete from storage
            const { error } = await supabase.storage
                .from('vendor-item-images')
                .remove([image.path])

            if (error) throw error

            const newImages = images.filter((_, i) => i !== index)
            setImages(newImages)
            onImagesUploaded(newImages.map(img => img.path))

            toast({
                title: 'Success',
                description: 'Image removed',
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                    <div key={index} className="relative group">
                        <Image
                            src={image.url}
                            alt={`Upload ${index + 1}`}
                            width={200}
                            height={200}
                            className="rounded-lg object-cover w-full h-48"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                Primary
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {images.length < maxImages && (
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Images ({images.length}/{maxImages})
                            </>
                        )}
                    </Button>
                </div>
            )}

            <p className="text-sm text-gray-500">
                Maximum {maxImages} images. First image will be the primary display image.
            </p>
        </div>
    )
}
