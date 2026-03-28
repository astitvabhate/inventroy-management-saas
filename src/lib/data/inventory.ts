import { ObjectId } from 'mongodb'
import { getDb, mongoClientPromise } from '@/lib/db/mongodb'
import type {
    AllocationDocument,
    CustomerDocument,
    ItemDocument,
    ItemImageDocument,
    SaleDocument,
    SessionUser,
    StockEntryDocument,
    UploadedImageInput,
} from '@/lib/db/types'
import { env } from '@/lib/env'
import { roundCurrency, serializeId, toObjectId } from '@/lib/db/utils'

function serializeDate(value: Date | null | undefined) {
    return value ? value.toISOString() : null
}

function serializeItem(item: ItemDocument, images: ItemImageDocument[] = []) {
    return {
        id: serializeId(item._id),
        vendorId: serializeId(item.vendorId),
        name: item.name,
        description: item.description,
        category: item.category,
        unit: item.unit,
        sku: item.sku,
        reorderPoint: item.reorderPoint,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        totalQuantity: item.totalQuantity,
        availableQuantity: item.availableQuantity,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        images: images.map((image) => ({
            id: serializeId(image._id),
            publicId: image.publicId,
            url: image.url,
            fileName: image.fileName,
            altText: image.altText,
            isPrimary: image.isPrimary,
            sortOrder: image.sortOrder,
            width: image.width,
            height: image.height,
        })),
    }
}

async function getVendorCollections() {
    const db = await getDb()
    return {
        items: db.collection<ItemDocument>('items'),
        stockEntries: db.collection<StockEntryDocument>('stockEntries'),
        customers: db.collection<CustomerDocument>('customers'),
        allocations: db.collection<AllocationDocument>('allocations'),
        sales: db.collection<SaleDocument>('sales'),
        itemImages: db.collection<ItemImageDocument>('itemImages'),
    }
}

export async function getDashboardOverview(user: SessionUser) {
    const { items, customers, allocations, sales, itemImages } = await getVendorCollections()
    const vendorId = toObjectId(user.vendorId)

    const [itemDocs, customerCount, allocationDocs, salesDocs] = await Promise.all([
        items.find({ vendorId }).sort({ createdAt: -1 }).limit(5).toArray(),
        customers.countDocuments({ vendorId }),
        allocations.find({ vendorId }).sort({ createdAt: -1 }).toArray(),
        sales.find({ vendorId }).sort({ date: -1 }).toArray(),
    ])

    const itemIds = itemDocs.map((item) => item._id)
    const images = itemIds.length
        ? await itemImages.find({ vendorId, itemId: { $in: itemIds } }).sort({ sortOrder: 1 }).toArray()
        : []

    const imageMap = new Map<string, ItemImageDocument[]>()
    for (const image of images) {
        const key = serializeId(image.itemId)
        imageMap.set(key, [...(imageMap.get(key) ?? []), image])
    }

    const activeAllocations = allocationDocs.filter((allocation) => !allocation.isReturned)
    const overdueAllocations = activeAllocations.filter(
        (allocation) => allocation.expectedReturnDate && allocation.expectedReturnDate < new Date()
    )
    const lowStockItems = itemDocs.filter((item) => item.availableQuantity <= Math.max(item.reorderPoint, 3))

    return {
        counts: {
            items: await items.countDocuments({ vendorId }),
            customers: customerCount,
            allocations: activeAllocations.length,
            sales: salesDocs.length,
        },
        revenue: salesDocs.reduce((sum, sale) => sum + sale.finalAmount, 0),
        profit: salesDocs.reduce((sum, sale) => sum + sale.profit, 0),
        overdueAllocations: overdueAllocations.length,
        lowStockItems: lowStockItems.length,
        recentItems: itemDocs.map((item) => serializeItem(item, imageMap.get(serializeId(item._id)) ?? [])),
    }
}

export async function listInventoryItems(user: SessionUser) {
    const { items, itemImages } = await getVendorCollections()
    const vendorId = toObjectId(user.vendorId)
    const itemDocs = await items.find({ vendorId }).sort({ createdAt: -1 }).toArray()
    const images = await itemImages.find({ vendorId }).sort({ sortOrder: 1 }).toArray()
    const imageMap = new Map<string, ItemImageDocument[]>()

    for (const image of images) {
        const key = serializeId(image.itemId)
        imageMap.set(key, [...(imageMap.get(key) ?? []), image])
    }

    return itemDocs.map((item) => serializeItem(item, imageMap.get(serializeId(item._id)) ?? []))
}

export async function listCustomers(user: SessionUser) {
    const { customers } = await getVendorCollections()
    const vendorId = toObjectId(user.vendorId)
    const docs = await customers.find({ vendorId }).sort({ createdAt: -1 }).toArray()

    return docs.map((customer) => ({
        id: serializeId(customer._id),
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        notes: customer.notes,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString(),
    }))
}

export async function listSales(user: SessionUser) {
    const { sales, customers } = await getVendorCollections()
    const vendorId = toObjectId(user.vendorId)
    const [saleDocs, customerDocs] = await Promise.all([
        sales.find({ vendorId }).sort({ date: -1 }).toArray(),
        customers.find({ vendorId }).toArray(),
    ])

    const customerMap = new Map(customerDocs.map((customer) => [serializeId(customer._id), customer]))

    return saleDocs.map((sale) => ({
        id: serializeId(sale._id),
        invoiceNumber: sale.invoiceNumber,
        totalAmount: sale.totalAmount,
        discount: sale.discount,
        finalAmount: sale.finalAmount,
        itemsCost: sale.itemsCost,
        profit: sale.profit,
        paymentMethod: sale.paymentMethod,
        paymentStatus: sale.paymentStatus,
        notes: sale.notes,
        date: sale.date.toISOString(),
        customer: customerMap.get(serializeId(sale.customerId))
            ? {
                id: serializeId(sale.customerId),
                name: customerMap.get(serializeId(sale.customerId))!.name,
            }
            : null,
    }))
}

export async function listAllocations(user: SessionUser) {
    const { allocations, items, customers } = await getVendorCollections()
    const vendorId = toObjectId(user.vendorId)
    const [allocationDocs, itemDocs, customerDocs] = await Promise.all([
        allocations.find({ vendorId }).sort({ createdAt: -1 }).toArray(),
        items.find({ vendorId }).toArray(),
        customers.find({ vendorId }).toArray(),
    ])

    const itemMap = new Map(itemDocs.map((item) => [serializeId(item._id), item]))
    const customerMap = new Map(customerDocs.map((customer) => [serializeId(customer._id), customer]))

    return allocationDocs.map((allocation) => ({
        id: serializeId(allocation._id),
        quantityUsed: allocation.quantityUsed,
        eventName: allocation.eventName,
        eventDate: serializeDate(allocation.eventDate),
        expectedReturnDate: serializeDate(allocation.expectedReturnDate),
        isReturned: allocation.isReturned,
        returnedAt: serializeDate(allocation.returnedAt),
        createdAt: allocation.createdAt.toISOString(),
        item: itemMap.get(serializeId(allocation.itemId))
            ? {
                id: serializeId(allocation.itemId),
                name: itemMap.get(serializeId(allocation.itemId))!.name,
            }
            : null,
        customer: customerMap.get(serializeId(allocation.customerId))
            ? {
                id: serializeId(allocation.customerId),
                name: customerMap.get(serializeId(allocation.customerId))!.name,
            }
            : null,
    }))
}

export async function getItemDetails(user: SessionUser, itemId: string) {
    const { items, stockEntries, customers, allocations, itemImages } = await getVendorCollections()
    const vendorId = toObjectId(user.vendorId)
    const itemObjectId = toObjectId(itemId)
    const [item, stockDocs, customerDocs, allocationDocs, imageDocs] = await Promise.all([
        items.findOne({ _id: itemObjectId, vendorId }),
        stockEntries.find({ itemId: itemObjectId, vendorId }).sort({ createdAt: -1 }).toArray(),
        customers.find({ vendorId }).sort({ name: 1 }).toArray(),
        allocations.find({ itemId: itemObjectId, vendorId }).sort({ createdAt: -1 }).toArray(),
        itemImages.find({ itemId: itemObjectId, vendorId }).sort({ sortOrder: 1 }).toArray(),
    ])

    if (!item) {
        return null
    }

    const customerMap = new Map(customerDocs.map((customer) => [serializeId(customer._id), customer]))

    return {
        item: serializeItem(item, imageDocs),
        stockEntries: stockDocs.map((entry) => ({
            id: serializeId(entry._id),
            quantityAdded: entry.quantityAdded,
            costPerUnit: entry.costPerUnit,
            totalCost: entry.totalCost,
            supplierName: entry.supplierName,
            notes: entry.notes,
            date: entry.date.toISOString(),
            createdAt: entry.createdAt.toISOString(),
        })),
        customers: customerDocs.map((customer) => ({
            id: serializeId(customer._id),
            name: customer.name,
        })),
        allocations: allocationDocs.map((allocation) => ({
            id: serializeId(allocation._id),
            quantityUsed: allocation.quantityUsed,
            eventName: allocation.eventName,
            eventDate: serializeDate(allocation.eventDate),
            expectedReturnDate: serializeDate(allocation.expectedReturnDate),
            isReturned: allocation.isReturned,
            returnedAt: serializeDate(allocation.returnedAt),
            createdAt: allocation.createdAt.toISOString(),
            customer: customerMap.get(serializeId(allocation.customerId))
                ? {
                    id: serializeId(allocation.customerId),
                    name: customerMap.get(serializeId(allocation.customerId))!.name,
                }
                : null,
        })),
    }
}

export async function createItemWithInitialStock(user: SessionUser, input: {
    name: string
    description?: string
    category: string
    unit: string
    sku?: string
    reorderPoint: number
    costPrice: number
    sellingPrice: number
    initialQuantity: number
    images: UploadedImageInput[]
}) {
    const client = await mongoClientPromise
    const session = client.startSession()
    const vendorId = toObjectId(user.vendorId)
    const userId = toObjectId(user.userId)
    const itemId = new ObjectId()
    const now = new Date()

    try {
        await session.withTransaction(async () => {
            const db = client.db(env.MONGODB_DB_NAME)
            const items = db.collection<ItemDocument>('items')
            const stockEntries = db.collection<StockEntryDocument>('stockEntries')
            const itemImages = db.collection<ItemImageDocument>('itemImages')

            await items.insertOne(
                {
                    _id: itemId,
                    vendorId,
                    name: input.name,
                    description: input.description?.trim() || null,
                    category: input.category,
                    unit: input.unit,
                    sku: input.sku?.trim() || null,
                    reorderPoint: input.reorderPoint,
                    costPrice: roundCurrency(input.costPrice),
                    sellingPrice: roundCurrency(input.sellingPrice),
                    totalQuantity: input.initialQuantity,
                    availableQuantity: input.initialQuantity,
                    createdAt: now,
                    updatedAt: now,
                },
                { session }
            )

            if (input.initialQuantity > 0) {
                await stockEntries.insertOne(
                    {
                        _id: new ObjectId(),
                        vendorId,
                        itemId,
                        quantityAdded: input.initialQuantity,
                        costPerUnit: roundCurrency(input.costPrice),
                        totalCost: roundCurrency(input.costPrice * input.initialQuantity),
                        supplierName: null,
                        notes: 'Initial stock',
                        date: now,
                        createdBy: userId,
                        createdAt: now,
                    },
                    { session }
                )
            }

            if (input.images.length > 0) {
                await itemImages.insertMany(
                    input.images.map((image, index) => ({
                        _id: new ObjectId(),
                        vendorId,
                        itemId,
                        publicId: image.publicId,
                        url: image.url,
                        fileName: image.fileName,
                        altText: input.name,
                        width: image.width ?? null,
                        height: image.height ?? null,
                        bytes: image.bytes ?? null,
                        format: image.format ?? null,
                        sortOrder: index,
                        isPrimary: index === 0,
                        createdAt: now,
                    })),
                    { session }
                )
            }
        })
    } finally {
        await session.endSession()
    }

    return serializeId(itemId)
}

export async function addStockEntry(user: SessionUser, input: {
    itemId: string
    quantity: number
    costPerUnit: number
    supplierName?: string
    notes?: string
}) {
    const client = await mongoClientPromise
    const session = client.startSession()
    const vendorId = toObjectId(user.vendorId)
    const userId = toObjectId(user.userId)
    const itemId = toObjectId(input.itemId)

    try {
        await session.withTransaction(async () => {
            const db = client.db(env.MONGODB_DB_NAME)
            const items = db.collection<ItemDocument>('items')
            const stockEntries = db.collection<StockEntryDocument>('stockEntries')
            const item = await items.findOne({ _id: itemId, vendorId }, { session })

            if (!item) {
                throw new Error('Item not found')
            }

            const nextTotal = item.totalQuantity + input.quantity
            const nextAvailable = item.availableQuantity + input.quantity
            const nextCost =
                nextTotal === 0
                    ? input.costPerUnit
                    : roundCurrency(
                        ((item.costPrice * item.totalQuantity) + (input.costPerUnit * input.quantity)) / nextTotal
                    )

            await stockEntries.insertOne(
                {
                    _id: new ObjectId(),
                    vendorId,
                    itemId,
                    quantityAdded: input.quantity,
                    costPerUnit: roundCurrency(input.costPerUnit),
                    totalCost: roundCurrency(input.quantity * input.costPerUnit),
                    supplierName: input.supplierName?.trim() || null,
                    notes: input.notes?.trim() || null,
                    date: new Date(),
                    createdBy: userId,
                    createdAt: new Date(),
                },
                { session }
            )

            await items.updateOne(
                { _id: itemId, vendorId },
                {
                    $set: {
                        totalQuantity: nextTotal,
                        availableQuantity: nextAvailable,
                        costPrice: nextCost,
                        updatedAt: new Date(),
                    },
                },
                { session }
            )
        })
    } finally {
        await session.endSession()
    }
}

export async function createCustomer(user: SessionUser, input: {
    name: string
    email?: string
    phone?: string
    address?: string
    notes?: string
}) {
    const db = await getDb()
    const customers = db.collection<CustomerDocument>('customers')
    const now = new Date()
    const customerId = new ObjectId()

    await customers.insertOne({
        _id: customerId,
        vendorId: toObjectId(user.vendorId),
        name: input.name.trim(),
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        address: input.address?.trim() || null,
        notes: input.notes?.trim() || null,
        createdAt: now,
        updatedAt: now,
    })

    return serializeId(customerId)
}

export async function createAllocation(user: SessionUser, input: {
    itemId: string
    customerId: string
    quantityUsed: number
    eventName?: string
    eventDate?: string
    expectedReturnDate?: string
    notes?: string
}) {
    const client = await mongoClientPromise
    const session = client.startSession()
    const vendorId = toObjectId(user.vendorId)

    try {
        await session.withTransaction(async () => {
            const db = client.db(env.MONGODB_DB_NAME)
            const items = db.collection<ItemDocument>('items')
            const allocations = db.collection<AllocationDocument>('allocations')
            const item = await items.findOne({ _id: toObjectId(input.itemId), vendorId }, { session })

            if (!item) {
                throw new Error('Item not found')
            }

            if (item.availableQuantity < input.quantityUsed) {
                throw new Error(`Only ${item.availableQuantity} units available.`)
            }

            await allocations.insertOne(
                {
                    _id: new ObjectId(),
                    vendorId,
                    itemId: toObjectId(input.itemId),
                    customerId: toObjectId(input.customerId),
                    quantityUsed: input.quantityUsed,
                    eventName: input.eventName?.trim() || null,
                    eventDate: input.eventDate ? new Date(input.eventDate) : null,
                    expectedReturnDate: input.expectedReturnDate ? new Date(input.expectedReturnDate) : null,
                    isReturned: false,
                    returnedAt: null,
                    notes: input.notes?.trim() || null,
                    createdBy: toObjectId(user.userId),
                    createdAt: new Date(),
                },
                { session }
            )

            await items.updateOne(
                { _id: item._id, vendorId },
                {
                    $set: {
                        availableQuantity: item.availableQuantity - input.quantityUsed,
                        updatedAt: new Date(),
                    },
                },
                { session }
            )
        })
    } finally {
        await session.endSession()
    }
}

export async function setAllocationReturned(user: SessionUser, input: {
    allocationId: string
    isReturned: boolean
}) {
    const client = await mongoClientPromise
    const session = client.startSession()
    const vendorId = toObjectId(user.vendorId)

    try {
        await session.withTransaction(async () => {
            const db = client.db(env.MONGODB_DB_NAME)
            const allocations = db.collection<AllocationDocument>('allocations')
            const items = db.collection<ItemDocument>('items')
            const allocation = await allocations.findOne({ _id: toObjectId(input.allocationId), vendorId }, { session })

            if (!allocation) {
                throw new Error('Allocation not found')
            }

            if (allocation.isReturned === input.isReturned) {
                return
            }

            const item = await items.findOne({ _id: allocation.itemId, vendorId }, { session })
            if (!item) {
                throw new Error('Item not found')
            }

            const quantityDelta = input.isReturned ? allocation.quantityUsed : -allocation.quantityUsed
            const nextAvailable = item.availableQuantity + quantityDelta

            if (nextAvailable < 0) {
                throw new Error('Undo would make stock negative.')
            }

            await allocations.updateOne(
                { _id: allocation._id, vendorId },
                {
                    $set: {
                        isReturned: input.isReturned,
                        returnedAt: input.isReturned ? new Date() : null,
                    },
                },
                { session }
            )

            await items.updateOne(
                { _id: item._id, vendorId },
                {
                    $set: {
                        availableQuantity: nextAvailable,
                        updatedAt: new Date(),
                    },
                },
                { session }
            )
        })
    } finally {
        await session.endSession()
    }
}
