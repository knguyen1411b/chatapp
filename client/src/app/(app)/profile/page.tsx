import type { Metadata } from 'next'

import { ProfilePageView } from '@/features/profile'

export const metadata: Metadata = {
    title: 'Profile',
    description: 'Quản lý hồ sơ người dùng, avatar và thông tin cá nhân.'
}

export default function ProfilePage() {
    return <ProfilePageView />
}
