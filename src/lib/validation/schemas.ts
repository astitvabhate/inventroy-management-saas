import { z } from 'zod'

export const signUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    businessName: z.string().min(2, 'Business name is required'),
    fullName: z.string().min(2, 'Full name is required'),
})

export const createCustomerSchema = z.object({
    name: z.string().min(2, 'Customer name is required'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
})

export const uploadedImageSchema = z.object({
    publicId: z.string().min(1),
    url: z.string().url(),
    fileName: z.string().min(1),
    width: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
    bytes: z.number().nullable().optional(),
    format: z.string().nullable().optional(),
})

export const createItemSchema = z.object({
    name: z.string().min(2, 'Item name is required'),
    description: z.string().optional(),
    category: z.string().min(2, 'Category is required'),
    unit: z.string().min(1).default('unit'),
    sku: z.string().optional(),
    reorderPoint: z.number().int().min(0).default(0),
    costPrice: z.number().min(0),
    sellingPrice: z.number().min(0),
    initialQuantity: z.number().int().min(0).default(0),
    images: z.array(uploadedImageSchema).default([]),
})

export const stockEntrySchema = z.object({
    itemId: z.string().min(1),
    quantity: z.number().int().min(1),
    costPerUnit: z.number().min(0),
    supplierName: z.string().optional(),
    notes: z.string().optional(),
})

export const allocationSchema = z.object({
    itemId: z.string().min(1),
    customerId: z.string().min(1),
    quantityUsed: z.number().int().min(1),
    eventName: z.string().optional(),
    eventDate: z.string().optional(),
    expectedReturnDate: z.string().optional(),
    notes: z.string().optional(),
})

export const returnAllocationSchema = z.object({
    allocationId: z.string().min(1),
    isReturned: z.boolean(),
})

export const forgotPasswordSchema = z.object({
    email: z.string().email(),
})

export const resetPasswordSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})
