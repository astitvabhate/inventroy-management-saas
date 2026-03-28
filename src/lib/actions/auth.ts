'use server'

import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db/mongodb'
import { slugify } from '@/lib/db/utils'
import { createRawResetToken, hashResetToken } from '@/lib/auth/reset-tokens'
import { hashPassword } from '@/lib/auth/password'
import type { PasswordResetTokenDocument, UserDocument, VendorDocument } from '@/lib/db/types'
import { forgotPasswordSchema, resetPasswordSchema, signUpSchema } from '@/lib/validation/schemas'
import { env } from '@/lib/env'

export async function registerUserAction(input: {
    email: string
    password: string
    businessName: string
    fullName: string
}) {
    const parsed = signUpSchema.safeParse(input)
    if (!parsed.success) {
        return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid sign-up data' }
    }

    const db = await getDb()
    const users = db.collection<UserDocument>('users')
    const vendors = db.collection<VendorDocument>('vendors')

    const existingUser = await users.findOne({ email: parsed.data.email.toLowerCase() })
    if (existingUser) {
        return { ok: false, message: 'An account already exists with that email.' }
    }

    const vendorId = new ObjectId()
    const userId = new ObjectId()
    const now = new Date()

    await vendors.insertOne({
        _id: vendorId,
        name: parsed.data.businessName.trim(),
        slug: `${slugify(parsed.data.businessName)}-${vendorId.toHexString().slice(-6)}`,
        createdAt: now,
        updatedAt: now,
    })

    await users.insertOne({
        _id: userId,
        vendorId,
        name: parsed.data.fullName.trim(),
        email: parsed.data.email.toLowerCase(),
        role: 'owner',
        passwordHash: await hashPassword(parsed.data.password),
        emailVerified: now,
        createdAt: now,
        updatedAt: now,
    })

    return { ok: true, message: 'Account created successfully.' }
}

async function maybeSendResetEmail(email: string, resetLink: string) {
    if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
        console.info(`Password reset requested for ${email}: ${resetLink}`)
        return
    }

    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: env.RESEND_FROM_EMAIL,
            to: email,
            subject: 'Reset your Inventory Flow password',
            html: `<p>Use the link below to reset your password.</p><p><a href="${resetLink}">${resetLink}</a></p>`,
        }),
    })
}

export async function requestPasswordResetAction(input: { email: string }) {
    const parsed = forgotPasswordSchema.safeParse(input)
    if (!parsed.success) {
        return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid email address' }
    }

    const db = await getDb()
    const users = db.collection<UserDocument>('users')
    const resetTokens = db.collection<PasswordResetTokenDocument>('passwordResetTokens')
    const user = await users.findOne({ email: parsed.data.email.toLowerCase() })

    if (user) {
        await resetTokens.deleteMany({ userId: user._id })

        const token = createRawResetToken()
        const tokenHash = hashResetToken(token)
        const expiresAt = new Date(Date.now() + 1000 * 60 * 30)

        await resetTokens.insertOne({
            _id: new ObjectId(),
            userId: user._id,
            tokenHash,
            expiresAt,
            createdAt: new Date(),
        })

        const baseUrl = env.APP_URL ?? 'http://localhost:3000'
        const resetLink = `${baseUrl}/reset-password?token=${token}`
        await maybeSendResetEmail(user.email, resetLink)
    }

    return { ok: true, message: 'If an account exists, a reset link has been sent.' }
}

export async function resetPasswordAction(input: { token: string; password: string }) {
    const parsed = resetPasswordSchema.safeParse(input)
    if (!parsed.success) {
        return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid reset request' }
    }

    const db = await getDb()
    const users = db.collection<UserDocument>('users')
    const resetTokens = db.collection<PasswordResetTokenDocument>('passwordResetTokens')

    const tokenHash = hashResetToken(parsed.data.token)
    const resetRecord = await resetTokens.findOne({
        tokenHash,
        expiresAt: { $gt: new Date() },
    })

    if (!resetRecord) {
        return { ok: false, message: 'This reset link is invalid or has expired.' }
    }

    await users.updateOne(
        { _id: resetRecord.userId },
        {
            $set: {
                passwordHash: await hashPassword(parsed.data.password),
                updatedAt: new Date(),
            },
        }
    )

    await resetTokens.deleteMany({ userId: resetRecord.userId })

    return { ok: true, message: 'Password updated successfully.' }
}
