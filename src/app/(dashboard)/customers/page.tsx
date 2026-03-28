import { requireSessionUser } from '@/lib/auth/session'
import { listCustomers } from '@/lib/data/inventory'
import { CustomerList } from '@/components/customers/customer-list'

export default async function CustomersPage() {
    const user = await requireSessionUser()
    const customers = await listCustomers(user)

    return (
        <div className="px-4 py-8 md:px-8 md:py-12">
            <header className="mb-8 md:mb-12">
                <p className="text-sm text-muted-foreground">Relationships</p>
                <h1 className="mt-2 text-3xl tracking-tight md:text-5xl">Customers</h1>
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                    Customer records stay tied to allocations, orders, and the service history behind each item.
                </p>
            </header>

            {customers.length > 0 ? (
                <CustomerList customers={customers} />
            ) : (
                <div className="rounded-[2rem] border border-dashed border-border bg-card/60 p-12 text-center">
                    <p className="text-muted-foreground">No customers yet.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Customer records will appear here once you start allocating items.
                    </p>
                </div>
            )}
        </div>
    )
}
