import Link from 'next/link'
import { ArrowRight, Boxes, ChartColumnBig, ShieldCheck } from 'lucide-react'
import { auth } from '@/auth'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function Home() {
    const session = await auth()

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(32_68%_84%/.35)_0%,transparent_30%),linear-gradient(180deg,hsl(var(--background)),color-mix(in_oklab,hsl(var(--background))_85%,hsl(var(--accent))_15%))] text-foreground">
            <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
                <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-10">
                    <Link href="/" className="text-base tracking-[0.18em] uppercase text-foreground md:text-lg">
                        Inventory Flow
                    </Link>
                    <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
                        <ThemeToggle />
                        <Link href={session ? '/dashboard' : '/login'} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                            {session ? 'Dashboard' : 'Sign in'}
                        </Link>
                        <Link
                            href={session ? '/inventory' : '/signup'}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm text-foreground transition hover:bg-accent sm:px-4"
                        >
                            Start free
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="mx-auto flex max-w-7xl flex-col gap-16 px-4 pb-16 pt-12 md:px-10 md:pb-20 md:pt-24">
                <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                    <div className="space-y-6 md:space-y-8">
                        <p className="w-fit rounded-full border border-border bg-card px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:px-4 sm:text-xs sm:tracking-[0.3em]">
                            Operations, inventory, allocations
                        </p>
                        <div className="space-y-6">
                            <h1 className="max-w-4xl font-serif text-4xl leading-[0.95] text-foreground sm:text-5xl md:text-7xl">
                                Run inventory with clarity, warmth, and fewer late surprises.
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
                                Inventory Flow helps teams track stock, monitor active allocations, and spot low-stock risk
                                before it disrupts deliveries, rentals, or daily ops.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                href={session ? '/dashboard' : '/signup'}
                                className="inline-flex items-center justify-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:translate-y-[-1px]"
                            >
                                {session ? 'Open workspace' : 'Create workspace'}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/inventory"
                                className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm text-foreground transition hover:bg-accent"
                            >
                                Explore inventory flow
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-border bg-card/90 p-4 shadow-2xl shadow-black/10 backdrop-blur-md sm:rounded-[2rem] sm:p-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-[1.5rem] border border-border bg-background/70 p-4 sm:p-5">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-xs sm:tracking-[0.3em]">Stock health</p>
                                <p className="mt-4 text-3xl text-foreground sm:text-4xl">98.2%</p>
                                <p className="mt-2 text-sm text-muted-foreground">Availability confidence across your active catalog.</p>
                            </div>
                            <div className="rounded-[1.5rem] border border-amber-500/20 bg-amber-500/10 p-4 sm:p-5">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-xs sm:tracking-[0.3em]">Returns due</p>
                                <p className="mt-4 text-3xl text-foreground sm:text-4xl">14</p>
                                <p className="mt-2 text-sm text-muted-foreground">Overdue and upcoming returns surfaced right on the dashboard.</p>
                            </div>
                            <div className="rounded-[1.5rem] border border-border bg-background/60 p-4 sm:p-5 md:col-span-2">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-xs sm:tracking-[0.3em]">Built for real operators</p>
                                <div className="mt-5 grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Boxes className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                                        <p className="text-sm text-foreground">Track stock, imagery, and reorder signals.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <ChartColumnBig className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                                        <p className="text-sm text-foreground">See sales, profit, and active allocations in one place.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                                        <p className="text-sm text-foreground">Server-side actions, session protection, and clearer ops rules.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
