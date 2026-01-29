import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default async function SalesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div className="p-8">Please log in <Link href="/login" className="text-primary text-blue-500 hover:text-blue-600">here</Link></div>

    const { data: sales } = await supabase
        .from('sales')
        .select(`
            *,
            customers (name)
        `)
        .order('date', { ascending: false })

    // Calculate totals
    const totalRevenue = sales?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0
    const totalProfit = sales?.reduce((sum, s) => sum + (s.profit || 0), 0) || 0

    return (
        <div className="px-4 md:px-8 py-8 md:py-12">
            {/* Header */}
            <header className="mb-8 md:mb-12">
                <p className="text-sm text-muted-foreground mb-2">Revenue</p>
                <h1 className="text-3xl md:text-5xl tracking-tight">Sales</h1>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-6 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total Revenue</p>
                    <p className="text-2xl md:text-3xl tracking-tight">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-6 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total Profit</p>
                    <p className="text-2xl md:text-3xl tracking-tight text-emerald-400">+₹{totalProfit.toLocaleString()}</p>
                </div>
            </div>

            {/* Sales List */}
            {sales && sales.length > 0 ? (
                <div className="border border-border divide-y divide-border">
                    {/* Header - Desktop only */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 text-xs text-muted-foreground uppercase tracking-wider">
                        <div className="col-span-2">Date</div>
                        <div className="col-span-3">Customer</div>
                        <div className="col-span-2">Invoice</div>
                        <div className="col-span-2 text-right">Amount</div>
                        <div className="col-span-2 text-right">Profit</div>
                        <div className="col-span-1">Status</div>
                    </div>

                    {sales.map((sale: any) => (
                        <div key={sale.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-4 hover:bg-accent/50 transition-colors">
                            <div className="md:col-span-2 text-sm text-muted-foreground">
                                {new Date(sale.date).toLocaleDateString()}
                            </div>
                            <div className="md:col-span-3 font-medium">
                                {sale.customers?.name || 'Unknown'}
                            </div>
                            <div className="md:col-span-2 text-sm text-muted-foreground">
                                {sale.invoice_number || '—'}
                            </div>
                            <div className="md:col-span-2 text-sm md:text-right">
                                ₹{sale.total_amount?.toLocaleString() || 0}
                            </div>
                            <div className="md:col-span-2 text-sm text-emerald-400 md:text-right">
                                +₹{sale.profit?.toLocaleString() || 0}
                            </div>
                            <div className="md:col-span-1">
                                <span className={cn(
                                    "inline-flex px-2 py-0.5 text-xs",
                                    sale.payment_status === 'paid'
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "bg-amber-500/10 text-amber-400"
                                )}>
                                    {sale.payment_status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="border border-dashed border-border p-12 text-center">
                    <p className="text-muted-foreground">No sales recorded yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Sales will appear here as you complete transactions.
                    </p>
                </div>
            )}
        </div>
    )
}
