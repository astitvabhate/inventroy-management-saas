import { v2 as cloudinary } from 'cloudinary'
import { env } from '@/lib/env'

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
})

export function createUploadSignature(folder: string, timestamp: number) {
    const signature = cloudinary.utils.api_sign_request(
        {
            folder,
            timestamp,
        },
        env.CLOUDINARY_API_SECRET
    )

    return {
        signature,
        timestamp,
        folder,
        apiKey: env.CLOUDINARY_API_KEY,
        cloudName: env.CLOUDINARY_CLOUD_NAME,
    }
}
