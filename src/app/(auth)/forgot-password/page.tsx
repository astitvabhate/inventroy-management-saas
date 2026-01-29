'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const { toast } = useToast()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) throw error

            setEmailSent(true)
            toast({
                title: "Email sent",
                description: "Check your inbox for the password reset link.",
            })
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to send reset email",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (emailSent) {
        return (
            <div>
                <Link href="/" className="lg:hidden block text-xl tracking-tight mb-8">
                    Dhuni<span className="text-muted-foreground">.</span>
                </Link>

                <div className="mb-8">
                    <h2 className="text-2xl tracking-tight mb-2">Check your email</h2>
                    <p className="text-sm text-muted-foreground">
                        We&apos;ve sent a password reset link to <strong>{email}</strong>
                    </p>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Didn&apos;t receive the email? Check your spam folder or try again.
                    </p>
                    <button
                        onClick={() => setEmailSent(false)}
                        className="text-sm text-foreground hover:underline"
                    >
                        Try another email
                    </button>
                </div>

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
                Dhuni<span className="text-muted-foreground">.</span>
            </Link>

            <div className="mb-8">
                <h2 className="text-2xl tracking-tight mb-2">Forgot password</h2>
                <p className="text-sm text-muted-foreground">
                    Enter your email and we&apos;ll send you a reset link
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-transparent border border-border text-sm focus:outline-none focus:border-foreground transition-colors"
                        placeholder="name@example.com"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-foreground text-background py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {isLoading ? 'Sending...' : 'Send reset link'}
                </button>
            </form>

            <p className="mt-8 text-sm text-center text-muted-foreground">
                Remember your password?{' '}
                <Link href="/login" className="text-foreground hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    )
}
