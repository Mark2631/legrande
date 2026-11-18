import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookies) {
          cookies.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  const protectedRoute = path.startsWith('/member') || path.startsWith('/admin')

  if (protectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('next', path.startsWith('/admin') ? '/admin' : '/member')
    return NextResponse.redirect(url)
  }

  if ((path === '/login' || path === '/register') && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/member'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/member/:path*', '/admin/:path*', '/login', '/register'],
}
