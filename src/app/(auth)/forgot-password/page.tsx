'use client'

import { useState } from 'react'
import Link from 'next/link'
import { requestPasswordResetAction } from '@/lib/actions/auth'
import { useToast } from '@/hooks/use-toast'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await requestPasswordResetAction({ email })
            if (!result.ok) {
                throw new Error(result.message)
            }

            setEmailSent(true)
            toast({
                title: 'Check your inbox',
                description: result.message,
            })
        } catch (error: unknown) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to send reset email',
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (emailSent) {
        return (
            <div>
                <Link href="/" className="mb-8 block text-sm uppercase tracking-[0.3em] text-stone-400 lg:hidden">
                    Inventory Flow
                </Link>

                <div className="mb-8">
                    <h2 className="text-3xl tracking-tight text-white">Check your email</h2>
                    <p className="mt-2 text-sm text-stone-400">
                        If an account exists for <strong>{email}</strong>, a reset link is on the way.
                    </p>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-stone-400">
                        Didn&apos;t receive the email? Check spam or try again.
                    </p>
                    <button
                        onClick={() => setEmailSent(false)}
                        className="text-sm text-white hover:underline"
                    >
                        Try another email
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Link href="/" className="mb-8 block text-sm uppercase tracking-[0.3em] text-stone-400 lg:hidden">
                Inventory Flow
            </Link>

            <div className="mb-8">
                <h2 className="text-3xl tracking-tight text-white">Reset your password</h2>
                <p className="mt-2 text-sm text-stone-400">
                    Enter your email and we&apos;ll send a password reset link.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="mb-2 block text-xs uppercase tracking-[0.25em] text-stone-500">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-100/50"
                        placeholder="name@example.com"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-2xl bg-white py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
                >
                    {isLoading ? 'Sending...' : 'Send reset link'}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-stone-400">
                Remember your password?{' '}
                <Link href="/login" className="text-white hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    )
}
