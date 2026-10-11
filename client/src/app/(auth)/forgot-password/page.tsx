import type { Metadata } from 'next'

import { ForgotPasswordPageView } from '@/features/auth'

export const metadata: Metadata = {
    title: 'Quên mật khẩu',
    description: 'Yêu cầu lấy lại mật khẩu tài khoản ChatApp qua email xác thực an toàn.',
    alternates: {
        canonical: '/forgot-password'
    },
    openGraph: {
        title: 'Quên mật khẩu | ChatApp',
        description: 'Yêu cầu lấy lại mật khẩu tài khoản ChatApp qua email xác thực an toàn.',
        url: '/forgot-password'
    },
    robots: {
        index: true,
        follow: true
    }
}

export default function ForgotPage() {
    return <ForgotPasswordPageView />
}
