'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'signin' | 'signup'
type Role = 'commander' | 'coordinator' | 'volunteer'

const ROLES: { value: Role; label: string; description: string }[] = [
  { value: 'commander', label: 'COMMANDER', description: 'Full access — deploy, create missions, manage teams' },
  { value: 'coordinator', label: 'COORDINATOR', description: 'Assign volunteers, view missions and personnel' },
  { value: 'volunteer', label: 'VOLUNTEER', description: 'View assigned missions, read-only access' },
]

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('signin')

  // Shared fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Sign-up only
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [role, setRole] = useState<Role>('volunteer')
  const [success, setSuccess] = useState('')

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
    setRole('volunteer')
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: { role },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      setSuccess('Account created. Check your email to confirm, then sign in.')
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
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

        {/* Tab Switcher */}
        <div className="flex border border-border rounded-sm mb-6 overflow-hidden">
          <button
            type="button"
            onClick={() => { setTab('signin'); resetForm() }}
            className={cn(
              "flex-1 py-2.5 font-mono text-xs tracking-wider transition-colors flex items-center justify-center gap-2",
              tab === 'signin'
                ? "bg-[var(--tactical-orange)] text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <LogIn className="w-3.5 h-3.5" />
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); resetForm() }}
            className={cn(
              "flex-1 py-2.5 font-mono text-xs tracking-wider transition-colors flex items-center justify-center gap-2",
              tab === 'signup'
                ? "bg-[var(--tactical-orange)] text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <UserPlus className="w-3.5 h-3.5" />
            CREATE ACCOUNT
          </button>
        </div>

        {/* Card */}
        <div className="border border-border bg-card rounded-sm p-6">

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 mb-4 bg-[var(--tactical-red)]/10 border border-[var(--tactical-red)]/20 rounded-sm">
              <AlertCircle className="w-4 h-4 text-[var(--tactical-red)] mt-0.5 shrink-0" />
              <p className="font-mono text-xs text-[var(--tactical-red)]">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-start gap-2 p-3 mb-4 bg-[var(--tactical-green)]/10 border border-[var(--tactical-green)]/20 rounded-sm">
              <AlertCircle className="w-4 h-4 text-[var(--tactical-green)] mt-0.5 shrink-0" />
              <p className="font-mono text-xs text-[var(--tactical-green)]">{success}</p>
            </div>
          )}

          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="signin-email" className="block font-mono text-xs mb-2 text-foreground">
                  EMAIL
                </label>
                <input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-sm font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[var(--tactical-orange)] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="signin-password" className="block font-mono text-xs mb-2 text-foreground">
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 pr-10 bg-muted border border-border rounded-sm font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[var(--tactical-orange)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[var(--tactical-orange)] text-primary-foreground font-mono text-xs font-semibold tracking-wider rounded-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {loading ? 'SIGNING IN...' : 'SIGN IN'}
              </button>

              <p className="text-center font-mono text-[10px] text-muted-foreground">
                No account?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('signup'); resetForm() }}
                  className="text-[var(--tactical-orange)] hover:underline"
                >
                  Create one
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="signup-email" className="block font-mono text-xs mb-2 text-foreground">
                  EMAIL
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-sm font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[var(--tactical-orange)] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="block font-mono text-xs mb-2 text-foreground">
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min. 6 characters"
                    className="w-full px-3 py-2 pr-10 bg-muted border border-border rounded-sm font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[var(--tactical-orange)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="signup-confirm" className="block font-mono text-xs mb-2 text-foreground">
                  CONFIRM PASSWORD
                </label>
                <div className="relative">
                  <input
                    id="signup-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 pr-10 bg-muted border border-border rounded-sm font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[var(--tactical-orange)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block font-mono text-xs mb-2 text-foreground">
                  ROLE
                </label>
                <div className="space-y-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 border rounded-sm transition-all",
                        role === r.value
                          ? "border-[var(--tactical-orange)] bg-[var(--tactical-orange)]/10"
                          : "border-border bg-muted/30 hover:bg-muted/60"
                      )}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={cn(
                          "font-mono text-xs font-semibold",
                          role === r.value ? "text-[var(--tactical-orange)]" : "text-foreground"
                        )}>
                          {r.label}
                        </span>
                        {role === r.value && (
                          <span className="w-2 h-2 rounded-full bg-[var(--tactical-orange)]" />
                        )}
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                        {r.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[var(--tactical-orange)] text-primary-foreground font-mono text-xs font-semibold tracking-wider rounded-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>

              <p className="text-center font-mono text-[10px] text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('signin'); resetForm() }}
                  className="text-[var(--tactical-orange)] hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>

        <p className="text-center font-mono text-[10px] text-muted-foreground mt-4">
          IMPACTGRID &mdash; CRISIS RESPONSE COORDINATION SYSTEM
        </p>
      </div>
    </div>
  )
}
