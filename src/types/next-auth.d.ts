import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            vendorId: string
            role: 'owner' | 'staff' | 'viewer'
            name?: string | null
            email?: string | null
        }
    }

    interface User {
        vendorId?: string
        role?: 'owner' | 'staff' | 'viewer'
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        vendorId?: string
        role?: 'owner' | 'staff' | 'viewer'
    }
}
