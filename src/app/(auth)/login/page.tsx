'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { signIn } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await signIn(email, password)
            router.push(searchParams.get('next') || '/dashboard')
            router.refresh()
        } catch (error: unknown) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'Invalid credentials',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <Link href="/" className="mb-8 block text-sm uppercase tracking-[0.3em] text-stone-400 lg:hidden">
                Inventory Flow
            </Link>

            <div className="mb-8">
                <h2 className="text-3xl tracking-tight text-white">Welcome back</h2>
                <p className="mt-2 text-sm text-stone-400">
                    Sign in to manage stock, returns, and daily operations.
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

                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <label htmlFor="password" className="block text-xs uppercase tracking-[0.25em] text-stone-500">
                            Password
                        </label>
                        <Link href="/forgot-password" className="text-xs text-stone-400 transition hover:text-white">
                            Forgot password?
                        </Link>
                    </div>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-100/50"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-2xl bg-white py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
                >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-stone-400">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-white hover:underline">
                    Create one
                </Link>
            </p>
        </div>
    )
}
