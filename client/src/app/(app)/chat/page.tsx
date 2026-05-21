import type { Metadata } from 'next'

import { ChatPageView } from '@/features/chat'

export const metadata: Metadata = {
    title: 'Chat',
    description: 'Nhắn tin realtime, tạo nhóm, gửi ảnh và quản lý cuộc trò chuyện.'
}

export default function ChatPage() {
    return <ChatPageView />
}
