import { ObjectId } from 'mongodb'

export type UserRole = 'owner' | 'staff' | 'viewer'

export interface VendorDocument {
    _id: ObjectId
    name: string
    slug: string
    createdAt: Date
    updatedAt: Date
}

export interface UserDocument {
    _id: ObjectId
    vendorId: ObjectId
    name: string
    email: string
    role: UserRole
    passwordHash: string
    emailVerified: Date | null
    createdAt: Date
    updatedAt: Date
}

export interface ItemDocument {
    _id: ObjectId
    vendorId: ObjectId
    name: string
    description: string | null
    category: string
    unit: string
    sku: string | null
    reorderPoint: number
    costPrice: number
    sellingPrice: number
    totalQuantity: number
    availableQuantity: number
    createdAt: Date
    updatedAt: Date
}

export interface StockEntryDocument {
    _id: ObjectId
    vendorId: ObjectId
    itemId: ObjectId
    quantityAdded: number
    costPerUnit: number
    totalCost: number
    supplierName: string | null
    notes: string | null
    date: Date
    createdBy: ObjectId
    createdAt: Date
}

export interface CustomerDocument {
    _id: ObjectId
    vendorId: ObjectId
    name: string
    email: string | null
    phone: string | null
    address: string | null
    notes: string | null
    createdAt: Date
    updatedAt: Date
}

export interface AllocationDocument {
    _id: ObjectId
    vendorId: ObjectId
    itemId: ObjectId
    customerId: ObjectId
    quantityUsed: number
    eventName: string | null
    eventDate: Date | null
    expectedReturnDate: Date | null
    isReturned: boolean
    returnedAt: Date | null
    notes: string | null
    createdBy: ObjectId
    createdAt: Date
}

export interface SaleDocument {
    _id: ObjectId
    vendorId: ObjectId
    customerId: ObjectId
    invoiceNumber: string | null
    totalAmount: number
    discount: number
    finalAmount: number
    itemsCost: number
    profit: number
    paymentMethod: string | null
    paymentStatus: 'pending' | 'partial' | 'paid'
    notes: string | null
    date: Date
    createdBy: ObjectId | null
    createdAt: Date
}

export interface ItemImageDocument {
    _id: ObjectId
    vendorId: ObjectId
    itemId: ObjectId
    publicId: string
    url: string
    fileName: string
    altText: string | null
    width: number | null
    height: number | null
    bytes: number | null
    format: string | null
    sortOrder: number
    isPrimary: boolean
    createdAt: Date
}

export interface PasswordResetTokenDocument {
    _id: ObjectId
    userId: ObjectId
    tokenHash: string
    expiresAt: Date
    createdAt: Date
}

export interface UploadedImageInput {
    publicId: string
    url: string
    fileName: string
    width?: number | null
    height?: number | null
    bytes?: number | null
    format?: string | null
}

export interface SessionUser {
    userId: string
    vendorId: string
    role: UserRole
    name: string
    email: string
}
