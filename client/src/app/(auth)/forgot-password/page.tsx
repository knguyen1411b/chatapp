import type { Metadata } from 'next'

import { ForgotPasswordPageView } from '@/features/auth'

export const metadata: Metadata = {
    title: 'Quên mật khẩu',
    description: 'Gửi yêu cầu đặt lại mật khẩu qua email.',
    robots: {
        index: false,
        follow: false
    }
}

export default function ForgotPage() {
    return <ForgotPasswordPageView />
}
