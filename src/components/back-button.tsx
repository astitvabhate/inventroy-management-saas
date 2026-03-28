'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function BackButton({
    fallbackHref,
    label,
    className = '',
}: {
    fallbackHref: string
    label?: string
    className?: string
}) {
    const router = useRouter()

    const handleBack = () => {
        if (window.history.length > 1) {
            router.back()
            return
        }

        router.push(fallbackHref)
    }

    return (
        <button
            type="button"
            onClick={handleBack}
            className={`inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground ${className}`}
        >
            <ArrowLeft className="h-4 w-4" />
            {label ?? 'Back'}
        </button>
    )
}
