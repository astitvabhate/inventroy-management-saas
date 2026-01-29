import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-screen flex overflow-hidden bg-background">
            {/* Sidebar */}
            <div className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0">
                <Sidebar />
            </div>

            {/* Main content */}
            <main className="flex-1 md:pl-60 overflow-y-auto">
                <Navbar />
                <div className="min-h-[calc(100vh-4rem)]">
                    {children}
                </div>
            </main>
        </div>
    )
}
