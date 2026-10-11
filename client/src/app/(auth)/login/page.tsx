import type { Metadata } from 'next'

import { LoginPageView } from '@/features/auth'

export const metadata: Metadata = {
    title: 'Đăng nhập',
    description: 'Đăng nhập vào tài khoản ChatApp để bắt đầu trò chuyện realtime, kết nối bạn bè và làm việc nhóm.',
    alternates: {
        canonical: '/login'
    },
    openGraph: {
        title: 'Đăng nhập | ChatApp',
        description: 'Đăng nhập vào tài khoản ChatApp để bắt đầu trò chuyện realtime, kết nối bạn bè và làm việc nhóm.',
        url: '/login'
    },
    robots: {
        index: true,
        follow: true
    }
}

export default function LoginPage() {
    return <LoginPageView />
}
