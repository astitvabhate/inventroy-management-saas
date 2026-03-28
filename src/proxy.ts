import { NextResponse } from 'next/server'
import { auth } from '@/auth'

const protectedPaths = ['/dashboard', '/inventory', '/customers', '/sales', '/usage']
const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password']

export default auth((req) => {
    const pathname = req.nextUrl.pathname
    const isLoggedIn = !!req.auth?.user
    const isProtected = protectedPaths.some((path) => pathname.startsWith(path))
    const isAuthPage = authPaths.some((path) => pathname.startsWith(path))

    if (!isLoggedIn && isProtected) {
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('next', pathname)
        return NextResponse.redirect(loginUrl)
    }

    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
