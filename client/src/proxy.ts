import { NextRequest, NextResponse } from 'next/server'

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password']
const CHAT_PATH = '/chat'

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get('chat_access')?.value

    if (AUTH_PAGES.some(page => pathname.startsWith(page)) && token) {
        return NextResponse.redirect(new URL(CHAT_PATH, request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/chat/:path*', '/profile/:path*', '/login', '/register', '/forgot-password', '/reset-password']
}
