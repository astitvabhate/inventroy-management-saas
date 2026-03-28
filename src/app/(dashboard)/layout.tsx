import { Navbar } from '@/components/navbar'
import { MobileDock, Sidebar } from '@/components/sidebar'
import { requireSessionUser } from '@/lib/auth/session'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    await requireSessionUser()

    return (
        <div className="flex min-h-screen overflow-hidden bg-background">
            <div className="hidden md:fixed md:inset-y-0 md:flex md:w-72">
                <Sidebar />
            </div>

            <main className="flex-1 md:pl-72">
                <Navbar />
                <div className="min-h-[calc(100vh-4rem)] pb-24 md:pb-0">
                    {children}
                </div>
                <MobileDock />
            </main>
        </div>
    )
}
