import { cn } from '@/lib/utils'
import { requireSessionUser } from '@/lib/auth/session'
import { listSales } from '@/lib/data/inventory'
import { formatCurrency, formatDate } from '@/lib/format'

export default async function SalesPage() {
    const user = await requireSessionUser()
    const sales = await listSales(user)
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0)

    return (
        <div className="px-4 py-8 md:px-8 md:py-12">
            <header className="mb-8 md:mb-12">
                <p className="text-sm text-muted-foreground">Revenue</p>
                <h1 className="mt-2 text-3xl tracking-tight md:text-5xl">Sales</h1>
            </header>

            <div className="mb-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[2rem] border border-border bg-card p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total revenue</p>
                    <p className="mt-2 text-2xl tracking-tight md:text-3xl">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="rounded-[2rem] border border-border bg-card p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total profit</p>
                    <p className="mt-2 text-2xl tracking-tight text-emerald-400 md:text-3xl">{formatCurrency(totalProfit)}</p>
                </div>
            </div>

            {sales.length > 0 ? (
                <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
                    <div className="hidden grid-cols-12 gap-4 border-b border-border px-6 py-4 text-xs uppercase tracking-[0.2em] text-muted-foreground md:grid">
                        <div className="col-span-2">Date</div>
                        <div className="col-span-3">Customer</div>
                        <div className="col-span-2">Invoice</div>
                        <div className="col-span-2 text-right">Amount</div>
                        <div className="col-span-2 text-right">Profit</div>
                        <div className="col-span-1">Status</div>
                    </div>

                    {sales.map((sale) => (
                        <div key={sale.id} className="grid grid-cols-1 gap-2 border-b border-border px-4 py-4 transition hover:bg-accent/30 md:grid-cols-12 md:gap-4 md:px-6">
                            <div className="text-sm text-muted-foreground md:col-span-2">
                                {formatDate(sale.date)}
                            </div>
                            <div className="font-medium md:col-span-3">
                                {sale.customer?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-muted-foreground md:col-span-2">
                                {sale.invoiceNumber || 'Pending'}
                            </div>
                            <div className="text-sm md:col-span-2 md:text-right">
                                {formatCurrency(sale.totalAmount)}
                            </div>
                            <div className="text-sm text-emerald-400 md:col-span-2 md:text-right">
                                {formatCurrency(sale.profit)}
                            </div>
                            <div className="md:col-span-1">
                                <span className={cn(
                                    'inline-flex rounded-full px-2 py-1 text-xs uppercase tracking-wide',
                                    sale.paymentStatus === 'paid'
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'bg-amber-500/10 text-amber-400'
                                )}>
                                    {sale.paymentStatus}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-[2rem] border border-dashed border-border bg-card/60 p-12 text-center">
                    <p className="text-muted-foreground">No sales recorded yet.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Sales history will appear here once transactions are logged.
                    </p>
                </div>
            )}
        </div>
    )
}
