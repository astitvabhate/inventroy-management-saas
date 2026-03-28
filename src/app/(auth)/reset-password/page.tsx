'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { resetPasswordAction } from '@/lib/actions/auth'
import { useToast } from '@/hooks/use-toast'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const searchParams = useSearchParams()
    const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])
    const router = useRouter()
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Passwords do not match',
            })
            return
        }

        setIsLoading(true)

        try {
            const result = await resetPasswordAction({ token, password })
            if (!result.ok) {
                throw new Error(result.message)
            }

            toast({
                title: 'Password updated',
                description: result.message,
            })

            router.push('/login')
        } catch (error: unknown) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to reset password',
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (!token) {
        return (
            <div>
                <Link href="/" className="mb-8 block text-sm uppercase tracking-[0.3em] text-stone-400 lg:hidden">
                    Inventory Flow
                </Link>

                <div className="mb-8">
                    <h2 className="text-3xl tracking-tight text-white">Invalid reset link</h2>
                    <p className="mt-2 text-sm text-stone-400">
                        This password reset link is missing or invalid.
                    </p>
                </div>

                <Link
                    href="/forgot-password"
                    className="inline-block w-full rounded-2xl bg-white py-3 text-center text-sm font-medium text-black transition hover:opacity-90"
                >
                    Request a new link
                </Link>
            </div>
        )
    }

    return (
        <div>
            <Link href="/" className="mb-8 block text-sm uppercase tracking-[0.3em] text-stone-400 lg:hidden">
                Inventory Flow
            </Link>

            <div className="mb-8">
                <h2 className="text-3xl tracking-tight text-white">Choose a new password</h2>
                <p className="mt-2 text-sm text-stone-400">
                    Enter a strong password to secure your workspace.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="password" className="mb-2 block text-xs uppercase tracking-[0.25em] text-stone-500">
                        New password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-100/50"
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="mb-2 block text-xs uppercase tracking-[0.25em] text-stone-500">
                        Confirm password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-100/50"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-2xl bg-white py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
                >
                    {isLoading ? 'Updating...' : 'Reset password'}
                </button>
            </form>
        </div>
    )
}
