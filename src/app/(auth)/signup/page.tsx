'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [businessName, setBusinessName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { signUp } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await signUp(email, password, businessName, fullName)
            toast({
                title: 'Workspace created',
                description: 'Your inventory workspace is ready.',
            })
            router.push('/dashboard')
            router.refresh()
        } catch (error: unknown) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to create account',
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
                <h2 className="text-3xl tracking-tight text-white">Create your workspace</h2>
                <p className="mt-2 text-sm text-stone-400">
                    Set up a clean home for stock, customers, allocations, and sales.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="fullName" className="mb-2 block text-xs uppercase tracking-[0.25em] text-stone-500">
                        Full name
                    </label>
                    <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-100/50"
                        placeholder="Alex Carter"
                    />
                </div>

                <div>
                    <label htmlFor="businessName" className="mb-2 block text-xs uppercase tracking-[0.25em] text-stone-500">
                        Workspace name
                    </label>
                    <input
                        id="businessName"
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-100/50"
                        placeholder="Northline Supply"
                    />
                </div>

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
                    <label htmlFor="password" className="mb-2 block text-xs uppercase tracking-[0.25em] text-stone-500">
                        Password
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

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-2xl bg-white py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
                >
                    {isLoading ? 'Creating workspace...' : 'Create workspace'}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-stone-400">
                Already have an account?{' '}
                <Link href="/login" className="text-white hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    )
}
