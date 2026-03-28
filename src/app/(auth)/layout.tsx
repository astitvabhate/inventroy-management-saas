import Link from 'next/link'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[linear-gradient(120deg,hsl(0_0%_5%),hsl(28_22%_10%))] text-foreground lg:grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="hidden lg:flex flex-col justify-between border-r border-white/10 px-12 py-10">
                <Link href="/" className="text-sm uppercase tracking-[0.35em] text-stone-300">
                    Inventory Flow
                </Link>

                <div className="space-y-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Modern inventory workspace</p>
                    <h1 className="max-w-xl font-serif text-6xl leading-[0.95] text-white">
                        A friendlier operating system for stock, returns, and team visibility.
                    </h1>
                    <p className="max-w-md text-base leading-7 text-stone-300">
                        Designed for teams who need dependable inventory control without the cold, overbuilt enterprise feel.
                    </p>
                </div>

                <p className="text-xs text-stone-500">
                    Production-minded inventory management for fast-moving teams.
                </p>
            </div>

            <div className="flex min-h-screen items-center justify-center px-6 py-10">
                <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-black/30 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
                    {children}
                </div>
            </div>
        </div>
    )
}
