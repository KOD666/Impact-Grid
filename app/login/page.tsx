'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, LogIn } from 'lucide-react'

interface AccessLevel {
  role: string
  title: string
  email: string
  permissions: string[]
}

const ACCESS_LEVELS: AccessLevel[] = [
  {
    role: 'commander',
    title: 'COMMANDER',
    email: 'commander@impactgrid.in',
    permissions: [
      'Create missions',
      'Deploy response',
      'Reassign teams',
      'View GDACS feed',
      'Manage personnel',
    ],
  },
  {
    role: 'coordinator',
    title: 'COORDINATOR',
    email: 'coordinator@impactgrid.in',
    permissions: [
      'View missions',
      'View personnel',
      'Assign volunteers',
      'Cannot deploy',
      'Cannot create missions',
    ],
  },
  {
    role: 'volunteer',
    title: 'VOLUNTEER',
    email: 'volunteer@impactgrid.in',
    permissions: [
      'View assigned mission only',
      'Read-only access',
      'No write permissions',
    ],
  },
]

/*
 * Seed in Supabase dashboard → Authentication → Users → Edit user → user_metadata:
 * { "role": "commander" } → e.g. commander@impactgrid.in
 * { "role": "coordinator" } → e.g. coordinator@impactgrid.in
 * { "role": "volunteer" } → e.g. volunteer@impactgrid.in
 */

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [supabaseConfigured, setSupabaseConfigured] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    setSupabaseConfigured(supabase !== null)
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      if (!supabase) {
        setError('Auth not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars')
        setLoading(false)
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      // Redirect to dashboard on success
      router.push('/')
    } catch (err) {
      console.error('[v0] Login error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 bg-[var(--tactical-orange)] rotate-45" />
            <h1 className="font-mono text-2xl font-bold tracking-tight">
              <span className="text-[var(--tactical-orange)]">IMPACT</span>
              <span className="text-foreground">GRID</span>
            </h1>
          </div>
          <p className="font-mono text-xs text-muted-foreground tracking-wider">
            CRISIS RESPONSE COORDINATION
          </p>
        </div>

        {/* Login Form */}
        <div className="border border-border bg-card rounded-sm p-6 mb-6">
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-[var(--tactical-red)]/10 border border-[var(--tactical-red)]/20 rounded-sm">
                <AlertCircle className="w-4 h-4 text-[var(--tactical-red)] mt-0.5 flex-shrink-0" />
                <p className="font-mono text-xs text-[var(--tactical-red)]">{error}</p>
              </div>
            )}

            {/* Auth Config Status */}
            {!supabaseConfigured && (
              <div className="flex items-start gap-2 p-3 bg-[var(--tactical-yellow)]/10 border border-[var(--tactical-yellow)]/20 rounded-sm">
                <AlertCircle className="w-4 h-4 text-[var(--tactical-yellow)] mt-0.5 flex-shrink-0" />
                <p className="font-mono text-xs text-[var(--tactical-yellow)]">
                  Auth not configured — set environment variables in project settings
                </p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block font-mono text-xs mb-2 text-foreground">
                EMAIL
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 bg-muted border border-border rounded-sm font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[var(--tactical-orange)] transition-colors"
                disabled={!supabaseConfigured || loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block font-mono text-xs mb-2 text-foreground">
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-muted border border-border rounded-sm font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[var(--tactical-orange)] transition-colors"
                disabled={!supabaseConfigured || loading}
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={!supabaseConfigured || loading}
              className="w-full py-2.5 bg-[var(--tactical-orange)] text-primary-foreground font-mono text-xs font-semibold tracking-wider rounded-sm hover:bg-[var(--tactical-orange)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        {/* Access Levels Reference */}
        <div className="space-y-3">
          <p className="font-mono text-xs text-muted-foreground">ACCESS LEVELS:</p>
          {ACCESS_LEVELS.map((level) => (
            <div key={level.role} className="border border-border bg-muted/30 rounded-sm p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-semibold text-[var(--tactical-orange)]">
                  {level.title}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  ({level.email})
                </span>
              </div>
              <ul className="space-y-1">
                {level.permissions.map((perm) => (
                  <li key={perm} className="font-mono text-[10px] text-muted-foreground flex items-start gap-1">
                    <span className="text-[var(--tactical-orange)] mt-0.5">→</span>
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center font-mono text-[10px] text-muted-foreground mt-6">
          Seed users in Supabase Auth dashboard with role metadata
        </p>
      </div>
    </div>
  )
}
