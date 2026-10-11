import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: 'ChatApp - Nhắn tin Realtime',
    description: 'Nền tảng nhắn tin realtime bảo mật, hỗ trợ kết nối trực tuyến nhanh chóng và thuận tiện.',
    alternates: {
        canonical: '/'
    }
}

export default function HomePage() {
    redirect('/chat')
}
