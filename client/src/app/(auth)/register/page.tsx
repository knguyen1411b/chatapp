import type { Metadata } from 'next'

import { RegisterPageView } from '@/features/auth'

export const metadata: Metadata = {
    title: 'Đăng ký',
    description: 'Tạo tài khoản mới để bắt đầu trò chuyện realtime.',
    robots: {
        index: false,
        follow: false
    }
}

export default function RegisterPage() {
    return <RegisterPageView />
}
