import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import type { SessionUser } from '@/lib/db/types'

export async function getCurrentSessionUser(): Promise<SessionUser | null> {
    const session = await auth()
    if (!session?.user?.id || !session.user.vendorId || !session.user.role || !session.user.email) {
        return null
    }

    return {
        userId: session.user.id,
        vendorId: session.user.vendorId,
        role: session.user.role,
        name: session.user.name ?? 'Operator',
        email: session.user.email,
    }
}

export async function requireSessionUser() {
    const user = await getCurrentSessionUser()
    if (!user) {
        redirect('/login')
    }

    return user
}
