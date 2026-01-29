'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { signIn } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await signIn(email, password)
            router.push('/dashboard')
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Invalid credentials",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            {/* Mobile Logo */}
            <Link href="/" className="lg:hidden block text-xl tracking-tight mb-8">
                Dhuni<span className="text-muted-foreground">.</span>
            </Link>

            <div className="mb-8">
                <h2 className="text-2xl tracking-tight mb-2">Welcome back</h2>
                <p className="text-sm text-muted-foreground">
                    Sign in to your account to continue
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

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label htmlFor="password" className="block text-xs text-muted-foreground uppercase tracking-wider">
                            Password
                        </label>
                        <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                            Forgot password?
                        </Link>
                    </div>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-transparent border border-border text-sm focus:outline-none focus:border-foreground transition-colors"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-foreground text-background py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>

            <p className="mt-8 text-sm text-center text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-foreground hover:underline">
                    Sign up
                </Link>
            </p>
        </div>
    )
}
