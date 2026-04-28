import { createBrowserClient } from '@supabase/ssr'

// The Supabase connector exposes NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY)
}

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return null
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
}
