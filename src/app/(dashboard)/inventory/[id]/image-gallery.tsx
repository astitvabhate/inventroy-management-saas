'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
    images: Array<{
        id: string
        url: string
        is_primary: boolean
    }>
    itemName: string
}

export function ImageGallery({ images, itemName }: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Sort so primary is first
    const sortedImages = [...images].sort((a, b) => {
        if (a.is_primary) return -1
        if (b.is_primary) return 1
        return 0
    })

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1))
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1))
    }

    if (sortedImages.length === 0) {
        return (
            <div className="aspect-square bg-accent flex items-center justify-center">
                <span className="text-muted-foreground text-sm">No images</span>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-accent overflow-hidden group">
                <Image
                    src={sortedImages[currentIndex].url}
                    alt={`${itemName} - Image ${currentIndex + 1}`}
                    fill
                    className="object-cover"
                />

                {/* Navigation Arrows */}
                {sortedImages.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-background/80 backdrop-blur-sm text-xs">
                            {currentIndex + 1} / {sortedImages.length}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {sortedImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {sortedImages.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                "relative w-16 h-16 flex-shrink-0 overflow-hidden transition-opacity",
                                index === currentIndex ? "ring-2 ring-foreground" : "opacity-60 hover:opacity-100"
                            )}
                        >
                            <Image
                                src={image.url}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
