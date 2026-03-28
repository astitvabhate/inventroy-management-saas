import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { mongoClientPromise } from '@/lib/db/mongodb'
import { env } from '@/lib/env'
import type { UserDocument } from '@/lib/db/types'
import { verifyPassword } from '@/lib/auth/password'

export const { handlers, auth } = NextAuth({
    adapter: MongoDBAdapter(mongoClientPromise),
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/login',
    },
    trustHost: true,
    secret: env.AUTH_SECRET,
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            authorize: async (credentials) => {
                const rawEmail = typeof credentials?.email === 'string' ? credentials.email : ''
                const rawPassword = typeof credentials?.password === 'string' ? credentials.password : ''
                const email = rawEmail.toLowerCase().trim()
                const password = rawPassword

                if (!email || !password) {
                    return null
                }

                const db = (await mongoClientPromise).db(env.MONGODB_DB_NAME)
                const users = db.collection<UserDocument>('users')
                const user = await users.findOne({ email })

                if (!user) {
                    return null
                }

                const passwordMatches = await verifyPassword(password, user.passwordHash)
                if (!passwordMatches) {
                    return null
                }

                return {
                    id: user._id.toHexString(),
                    email: user.email,
                    name: user.name,
                    vendorId: user.vendorId.toHexString(),
                    role: user.role,
                }
            },
        }),
    ],
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.sub = user.id
                token.vendorId = user.vendorId
                token.role = user.role
            }

            return token
        },
        session: async ({ session, token }) => {
            if (session.user) {
                session.user.id = token.sub ?? ''
                session.user.vendorId = typeof token.vendorId === 'string' ? token.vendorId : ''
                session.user.role = token.role === 'owner' || token.role === 'staff' || token.role === 'viewer'
                    ? token.role
                    : 'viewer'
            }

            return session
        },
    },
})
