'use server'

import { revalidatePath } from 'next/cache'
import {
    addStockEntry,
    createAllocation,
    createCustomer,
    createItemWithInitialStock,
    setAllocationReturned,
} from '@/lib/data/inventory'
import { requireSessionUser } from '@/lib/auth/session'
import {
    allocationSchema,
    createCustomerSchema,
    createItemSchema,
    returnAllocationSchema,
    stockEntrySchema,
} from '@/lib/validation/schemas'

export async function createItemAction(input: {
    name: string
    description?: string
    category: string
    unit: string
    sku?: string
    reorderPoint: number
    costPrice: number
    sellingPrice: number
    initialQuantity: number
    images: Array<{
        publicId: string
        url: string
        fileName: string
        width?: number | null
        height?: number | null
        bytes?: number | null
        format?: string | null
    }>
}) {
    const parsed = createItemSchema.safeParse(input)
    if (!parsed.success) {
        return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid item data' }
    }

    const user = await requireSessionUser()
    const itemId = await createItemWithInitialStock(user, parsed.data)

    revalidatePath('/inventory')
    revalidatePath('/dashboard')

    return { ok: true, message: 'Item created successfully.', itemId }
}

export async function addStockEntryAction(input: {
    itemId: string
    quantity: number
    costPerUnit: number
    supplierName?: string
    notes?: string
}) {
    const parsed = stockEntrySchema.safeParse(input)
    if (!parsed.success) {
        return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid stock entry' }
    }

    const user = await requireSessionUser()
    await addStockEntry(user, parsed.data)

    revalidatePath(`/inventory/${parsed.data.itemId}`)
    revalidatePath('/inventory')
    revalidatePath('/dashboard')

    return { ok: true, message: 'Stock added successfully.' }
}

export async function createCustomerAction(input: {
    name: string
    email?: string
    phone?: string
    address?: string
    notes?: string
}) {
    const parsed = createCustomerSchema.safeParse(input)
    if (!parsed.success) {
        return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid customer data' }
    }

    const user = await requireSessionUser()
    const customerId = await createCustomer(user, parsed.data)

    revalidatePath('/customers')

    return { ok: true, message: 'Customer created successfully.', customerId }
}

export async function createAllocationAction(input: {
    itemId: string
    customerId: string
    quantityUsed: number
    eventName?: string
    eventDate?: string
    expectedReturnDate?: string
    notes?: string
}) {
    const parsed = allocationSchema.safeParse(input)
    if (!parsed.success) {
        return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid allocation data' }
    }

    const user = await requireSessionUser()
    await createAllocation(user, parsed.data)

    revalidatePath(`/inventory/${parsed.data.itemId}`)
    revalidatePath('/usage')
    revalidatePath('/dashboard')

    return { ok: true, message: 'Allocation created successfully.' }
}

export async function setAllocationReturnedAction(input: {
    allocationId: string
    isReturned: boolean
}) {
    const parsed = returnAllocationSchema.safeParse(input)
    if (!parsed.success) {
        return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid allocation update' }
    }

    const user = await requireSessionUser()
    await setAllocationReturned(user, parsed.data)

    revalidatePath('/usage')
    revalidatePath('/inventory')
    revalidatePath('/dashboard')

    return { ok: true, message: 'Allocation updated successfully.' }
}
