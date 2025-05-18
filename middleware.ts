import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Clear any problematic redirect loops by checking the referrer
    const { pathname, search } = req.nextUrl
    
    // Handle problematic redirect chains
    if (search && search.includes('%252F')) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Specify which paths to apply the middleware to
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/auth/:path*', 
    '/profile/:path*',
    '/events/:path*',  // Add protection for events routes
  ]
}