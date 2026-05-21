import type { Metadata } from 'next'

import { ResetPasswordPageView } from '@/features/auth'

export const metadata: Metadata = {
    title: 'Đặt lại mật khẩu',
    description: 'Đặt lại mật khẩu mới cho tài khoản.',
    robots: {
        index: false,
        follow: false
    }
}

export default function ResetPasswordPage() {
    return <ResetPasswordPageView />
}
