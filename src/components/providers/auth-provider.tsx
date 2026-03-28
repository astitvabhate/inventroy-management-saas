'use client'

import { createContext, useContext } from 'react'
import { SessionProvider, signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import { useRouter } from 'next/navigation'
import { registerUserAction } from '@/lib/actions/auth'

type AuthUser = {
    id: string
    vendorId: string
    role: 'owner' | 'staff' | 'viewer'
    name?: string | null
    email?: string | null
}

interface AuthContextType {
    user: AuthUser | null
    session: Session | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string, businessName: string, fullName: string) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthContextBridge({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()

    const signIn = async (email: string, password: string) => {
        const result = await nextAuthSignIn('credentials', {
            email,
            password,
            redirect: false,
        })

        if (result?.error) {
            throw new Error('Invalid email or password')
        }
    }

    const signUp = async (email: string, password: string, businessName: string, fullName: string) => {
        const result = await registerUserAction({
            email,
            password,
            businessName,
            fullName,
        })

        if (!result.ok) {
            throw new Error(result.message)
        }

        const signInResult = await nextAuthSignIn('credentials', {
            email,
            password,
            redirect: false,
        })

        if (signInResult?.error) {
            throw new Error('Account created, but automatic sign-in failed.')
        }
    }

    const signOut = async () => {
        await nextAuthSignOut({ redirect: false })
        router.push('/login')
        router.refresh()
    }

    const user = session?.user?.id && session.user.vendorId && session.user.role
        ? {
            id: session.user.id,
            vendorId: session.user.vendorId,
            role: session.user.role,
            name: session.user.name,
            email: session.user.email,
        }
        : null

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading: status === 'loading',
                signIn,
                signUp,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function AuthProvider({
    children,
    session,
}: {
    children: React.ReactNode
    session: Session | null
}) {
    return (
        <SessionProvider session={session}>
            <AuthContextBridge>{children}</AuthContextBridge>
        </SessionProvider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
