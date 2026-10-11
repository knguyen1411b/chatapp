import type { Metadata } from 'next'

import { ProfilePageView } from '@/features/profile'

export const metadata: Metadata = {
    title: 'Hồ sơ cá nhân',
    description: 'Quản lý thông tin tài khoản, avatar và cài đặt cá nhân trên ChatApp.',
    robots: {
        index: false,
        follow: false
    }
}

export default function ProfilePage() {
    return <ProfilePageView />
}
