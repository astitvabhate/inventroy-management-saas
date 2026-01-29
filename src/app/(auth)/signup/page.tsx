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
                title: "Success",
                description: "Account created. Please check your email to verify.",
            })
            router.push('/dashboard')
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to create account",
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
                <h2 className="text-2xl tracking-tight mb-2">Create account</h2>
                <p className="text-sm text-muted-foreground">
                    Start managing your inventory today
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="fullName" className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        Full Name
                    </label>
                    <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-transparent border border-border text-sm focus:outline-none focus:border-foreground transition-colors"
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label htmlFor="businessName" className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        Business Name
                    </label>
                    <input
                        id="businessName"
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-transparent border border-border text-sm focus:outline-none focus:border-foreground transition-colors"
                        placeholder="Your Business"
                    />
                </div>

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
                    <label htmlFor="password" className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        Password
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

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-foreground text-background py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {isLoading ? 'Creating account...' : 'Create account'}
                </button>
            </form>

            <p className="mt-8 text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-foreground hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    )
}
