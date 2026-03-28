'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export type UploadedImage = {
    publicId: string
    url: string
    fileName: string
    width?: number | null
    height?: number | null
    bytes?: number | null
    format?: string | null
}

interface ImageUploadProps {
    maxImages?: number
    onImagesUploaded: (images: UploadedImage[]) => void
}

export function ImageUpload({
    maxImages = 5,
    onImagesUploaded,
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [images, setImages] = useState<UploadedImage[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        if (images.length + files.length > maxImages) {
            toast({
                title: 'Too many images',
                description: `You can upload up to ${maxImages} images.`,
                variant: 'destructive',
            })
            return
        }

        setUploading(true)

        try {
            const uploadedImages: UploadedImage[] = []

            for (const file of files) {
                if (!file.type.startsWith('image/')) {
                    toast({
                        title: 'Invalid file',
                        description: `${file.name} is not an image.`,
                        variant: 'destructive',
                    })
                    continue
                }

                if (file.size > 5 * 1024 * 1024) {
                    toast({
                        title: 'File too large',
                        description: `${file.name} exceeds 5MB.`,
                        variant: 'destructive',
                    })
                    continue
                }

                const signResponse = await fetch('/api/uploads/sign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileName: file.name }),
                })

                if (!signResponse.ok) {
                    throw new Error('Unable to prepare image upload.')
                }

                const signedPayload = await signResponse.json()
                const formData = new FormData()
                formData.append('file', file)
                formData.append('api_key', signedPayload.apiKey)
                formData.append('timestamp', String(signedPayload.timestamp))
                formData.append('signature', signedPayload.signature)
                formData.append('folder', signedPayload.folder)

                const uploadResponse = await fetch(
                    `https://api.cloudinary.com/v1_1/${signedPayload.cloudName}/image/upload`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                )

                if (!uploadResponse.ok) {
                    throw new Error(`Upload failed for ${file.name}.`)
                }

                const uploaded = await uploadResponse.json()
                uploadedImages.push({
                    publicId: uploaded.public_id,
                    url: uploaded.secure_url,
                    fileName: file.name,
                    width: uploaded.width ?? null,
                    height: uploaded.height ?? null,
                    bytes: uploaded.bytes ?? null,
                    format: uploaded.format ?? null,
                })
            }

            const nextImages = [...images, ...uploadedImages]
            setImages(nextImages)
            onImagesUploaded(nextImages)

            toast({
                title: 'Images ready',
                description: `${uploadedImages.length} image(s) uploaded.`,
            })
        } catch (error: unknown) {
            toast({
                title: 'Upload failed',
                description: error instanceof Error ? error.message : 'Upload failed.',
                variant: 'destructive',
            })
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const removeImage = (index: number) => {
        const nextImages = images.filter((_, imageIndex) => imageIndex !== index)
        setImages(nextImages)
        onImagesUploaded(nextImages)
    }

    return (
        <div className="space-y-4">
            {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {images.map((image, index) => (
                        <div key={image.publicId} className="group relative overflow-hidden rounded-3xl border border-border bg-card">
                            <div className="relative aspect-square">
                                <Image src={image.url} alt={image.fileName} fill sizes="(max-width: 768px) 45vw, 240px" className="object-cover" />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute right-3 top-3 rounded-full bg-black/70 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            {index === 0 && (
                                <div className="absolute bottom-3 left-3 rounded-full bg-white px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-black">
                                    Primary
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

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
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload images ({images.length}/{maxImages})
                            </>
                        )}
                    </Button>
                </div>
            )}

            <p className="text-sm text-muted-foreground">
                Upload up to {maxImages} images. The first image becomes the primary product view.
            </p>
        </div>
    )
}
