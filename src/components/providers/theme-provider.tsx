'use client'

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
    theme: Theme
    mounted: boolean
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const subscribe = () => () => {}

function applyTheme(theme: Theme) {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') {
            return 'dark'
        }

        const stored = window.localStorage.getItem('inventory-flow-theme')
        if (stored === 'light' || stored === 'dark') {
            return stored
        }

        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    })
    const mounted = useSyncExternalStore(subscribe, () => true, () => false)

    useEffect(() => {
        applyTheme(theme)
    }, [theme])

    const setTheme = (nextTheme: Theme) => {
        setThemeState(nextTheme)
        window.localStorage.setItem('inventory-flow-theme', nextTheme)
        applyTheme(nextTheme)
    }

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    return (
        <ThemeContext.Provider value={{ theme, mounted, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }

    return context
}
