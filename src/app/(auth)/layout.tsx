import Link from 'next/link'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background p-8 md:p-12 flex-col justify-between">
                <Link href="/" className="text-xl tracking-tight">
                    Dhuni Decor<span className="opacity-40">.</span>
                </Link>

                <div>
                    <h1 className="text-4xl md:text-5xl leading-tight tracking-tight mb-6">
                        Track your
                        <br />
                        <span className="italic">decorations</span>
                        <br />
                        with clarity.
                    </h1>
                    <p className="text-sm opacity-60 max-w-sm">
                        A refined system for managing inventory, tracking allocations,
                        and understanding where every piece goes.
                    </p>
                </div>

                <p className="text-xs opacity-40">
                    © 2026 Dhuni Decor. All rights reserved.
                </p>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-8 bg-background">
                <div className="w-full max-w-sm">
                    {children}
                </div>
            </div>
        </div>
    )
}
