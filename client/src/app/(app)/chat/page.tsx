import type { Metadata } from 'next'

import { ChatPageView } from '@/features/chat'

export const metadata: Metadata = {
    title: 'Phòng trò chuyện',
    description: 'Nhắn tin realtime, tạo nhóm, gửi ảnh và quản lý cuộc trò chuyện an toàn.',
    robots: {
        index: false,
        follow: false
    }
}

export default function ChatPage() {
    return <ChatPageView />
}
