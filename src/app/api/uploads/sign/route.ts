import { NextResponse } from 'next/server'
import { createUploadSignature } from '@/lib/cloudinary'
import { requireSessionUser } from '@/lib/auth/session'

export async function POST() {
    const user = await requireSessionUser()
    const timestamp = Math.floor(Date.now() / 1000)
    const folder = `inventory-flow/${user.vendorId}/items`

    return NextResponse.json(createUploadSignature(folder, timestamp))
}
