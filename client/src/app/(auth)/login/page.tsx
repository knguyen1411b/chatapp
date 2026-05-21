import type { Metadata } from 'next'

import { LoginPageView } from '@/features/auth'

export const metadata: Metadata = {
    title: 'Đăng nhập',
    description: 'Đăng nhập vào tài khoản để sử dụng hệ thống chat realtime.',
    robots: {
        index: false,
        follow: false
    }
}

export default function LoginPage() {
    return <LoginPageView />
}
