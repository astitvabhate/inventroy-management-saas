import { createClient } from '@/lib/supabase/server'
import { Phone, Mail, MapPin } from 'lucide-react'

export default async function CustomersPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div className="p-8">Please log in</div>

    const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="px-4 md:px-8 py-8 md:py-12">
            {/* Header */}
            <header className="mb-8 md:mb-12">
                <p className="text-sm text-muted-foreground mb-2">Manage</p>
                <h1 className="text-3xl md:text-5xl tracking-tight">Customers</h1>
            </header>

            {/* Customer List */}
            {customers && customers.length > 0 ? (
                <div className="border border-border divide-y divide-border">
                    {customers.map((customer: any) => (
                        <div key={customer.id} className="p-4 md:p-6 hover:bg-accent/50 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <h3 className="font-medium truncate">{customer.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        ID: {customer.id.slice(0, 8)}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    {customer.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5" />
                                            <span>{customer.phone}</span>
                                        </div>
                                    )}
                                    {customer.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5" />
                                            <span>{customer.email}</span>
                                        </div>
                                    )}
                                    {customer.address && (
                                        <div className="flex items-center gap-2 max-w-[200px]">
                                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span className="truncate">{customer.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="border border-dashed border-border p-12 text-center">
                    <p className="text-muted-foreground">No customers yet.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Customers will appear here when you allocate items.
                    </p>
                </div>
            )}
        </div>
    )
}
