import { NextRequest, NextResponse } from 'next/server'

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password']
const CHAT_PATH = '/chat'
const PRIVATE_PATHS = ['/chat', '/profile']

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get('chat_access')?.value

    if (PRIVATE_PATHS.some(path => pathname.startsWith(path)) && !token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('next', pathname)
        return NextResponse.redirect(loginUrl)
    }

    if (AUTH_PAGES.some(page => pathname.startsWith(page)) && token) {
        return NextResponse.redirect(new URL(CHAT_PATH, request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/chat/:path*', '/profile/:path*', '/login', '/register', '/forgot-password', '/reset-password']
}
