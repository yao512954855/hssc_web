import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/admin')) {
    // 允许未登录用户访问登录页和 /admin 首页（作为统一管理入口）
    const isLoginPage = pathname === '/admin/login' || pathname.startsWith('/admin/login/')
    const isAdminRoot = pathname === '/admin'
    if (!isLoginPage && !isAdminRoot) {
      const adminCookie = request.cookies.get('admin')
      if (!adminCookie) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}