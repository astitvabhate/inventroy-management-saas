'use client'

import { Moon, SunMedium } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'

export function ThemeToggle() {
    const { theme, mounted, toggleTheme } = useTheme()

    if (!mounted) {
        return (
            <div
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-border bg-card px-3"
                aria-hidden="true"
            />
        )
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 text-sm text-foreground transition-colors hover:bg-accent"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
    )
}
