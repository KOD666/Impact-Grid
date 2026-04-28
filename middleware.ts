import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page and auth routes without session
  if (pathname === '/login' || pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

  // Check for Supabase session
  try {
    const supabase = await createClient()
    if (!supabase) {
      // Supabase not configured, redirect to login
      if (pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      return NextResponse.next()
    }

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      // No session, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // User is authenticated - attach role to headers for server components
    const role = session.user.user_metadata?.role || 'volunteer'
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-role', String(role))
    requestHeaders.set('x-user-email', session.user.email || '')

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error('[v0] Middleware error:', error)
    // On error, redirect to login if not already there
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
