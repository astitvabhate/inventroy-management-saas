import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/providers/auth-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { auth } from '@/auth'

export const metadata: Metadata = {
    title: 'Inventory Flow',
    description: 'Friendly, production-ready inventory operations for growing teams.',
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const session = await auth()

    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased min-h-screen">
                <ThemeProvider>
                    <AuthProvider session={session}>
                        {children}
                        <Toaster />
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
