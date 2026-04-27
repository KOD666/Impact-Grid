import { createBrowserClient } from '@supabase/ssr'

// Check if Supabase environment variables are configured
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Gracefully return null if env vars are missing (for local dev without Supabase)
  if (!url || !key) {
    return null
  }

  return createBrowserClient(url, key)
}
