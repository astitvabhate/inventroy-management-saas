'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isValidSession, setIsValidSession] = useState(false)
    const [checking, setChecking] = useState(true)
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()

    useEffect(() => {
        // Check if user has a valid recovery session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setIsValidSession(!!session)
            setChecking(false)
        }
        checkSession()
    }, [supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Passwords do not match",
            })
            return
        }

        if (password.length < 6) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Password must be at least 6 characters",
            })
            return
        }

        setIsLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            toast({
                title: "Password updated",
                description: "Your password has been reset successfully.",
            })

            router.push('/login')
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to reset password",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (checking) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Verifying...</p>
            </div>
        )
    }

    if (!isValidSession) {
        return (
            <div>
                <Link href="/" className="lg:hidden block text-xl tracking-tight mb-8">
                    Dhuni Decor<span className="text-muted-foreground">.</span>
                </Link>

                <div className="mb-8">
                    <h2 className="text-2xl tracking-tight mb-2">Invalid or expired link</h2>
                    <p className="text-sm text-muted-foreground">
                        This password reset link is invalid or has expired.
                    </p>
                </div>

                <Link
                    href="/forgot-password"
                    className="inline-block w-full text-center bg-foreground text-background py-3 text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    Request new link
                </Link>

                <p className="mt-8 text-sm text-center text-muted-foreground">
                    Remember your password?{' '}
                    <Link href="/login" className="text-foreground hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        )
    }

    return (
        <div>
            <Link href="/" className="lg:hidden block text-xl tracking-tight mb-8">
                Dhuni Decor<span className="text-muted-foreground">.</span>
            </Link>

            <div className="mb-8">
                <h2 className="text-2xl tracking-tight mb-2">Reset password</h2>
                <p className="text-sm text-muted-foreground">
                    Enter your new password below
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="password" className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        New Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 bg-transparent border border-border text-sm focus:outline-none focus:border-foreground transition-colors"
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 bg-transparent border border-border text-sm focus:outline-none focus:border-foreground transition-colors"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-foreground text-background py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {isLoading ? 'Updating...' : 'Reset password'}
                </button>
            </form>
        </div>
    )
}
