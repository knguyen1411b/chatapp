import type { Metadata } from 'next'

import { RegisterPageView } from '@/features/auth'

export const metadata: Metadata = {
    title: 'Đăng ký tài khoản',
    description:
        'Tạo tài khoản ChatApp miễn phí để bắt đầu nhắn tin thời gian thực, trò chuyện nhóm và gửi tập tin bảo mật.',
    alternates: {
        canonical: '/register'
    },
    openGraph: {
        title: 'Đăng ký tài khoản | ChatApp',
        description:
            'Tạo tài khoản ChatApp miễn phí để bắt đầu nhắn tin thời gian thực, trò chuyện nhóm và gửi tập tin bảo mật.',
        url: '/register'
    },
    robots: {
        index: true,
        follow: true
    }
}

export default function RegisterPage() {
    return <RegisterPageView />
}
