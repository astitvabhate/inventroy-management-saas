'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
    images: Array<{
        id: string
        url: string
        isPrimary: boolean
    }>
    itemName: string
}

export function ImageGallery({ images, itemName }: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const sortedImages = [...images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))

    if (sortedImages.length === 0) {
        return (
            <div className="flex aspect-square items-center justify-center rounded-[2rem] border border-dashed border-border bg-card text-sm text-muted-foreground">
                No images
            </div>
        )
    }

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1))
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1))
    }

    return (
        <div className="space-y-4">
            <div className="group relative aspect-square overflow-hidden rounded-[2rem] bg-accent">
                <Image
                    src={sortedImages[currentIndex].url}
                    alt={`${itemName} - Image ${currentIndex + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                />

                {sortedImages.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 opacity-0 transition group-hover:opacity-100 hover:bg-background"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 opacity-0 transition group-hover:opacity-100 hover:bg-background"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1.5 text-xs">
                            {currentIndex + 1} / {sortedImages.length}
                        </div>
                    </>
                )}
            </div>

            {sortedImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {sortedImages.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                'relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl transition-opacity',
                                index === currentIndex ? 'ring-2 ring-foreground' : 'opacity-60 hover:opacity-100'
                            )}
                        >
                            <Image src={image.url} alt={`Thumbnail ${index + 1}`} fill sizes="64px" className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
