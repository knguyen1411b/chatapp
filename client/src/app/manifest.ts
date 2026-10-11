import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'ChatApp - Nhắn tin Realtime',
        short_name: 'ChatApp',
        description: 'Ứng dụng nhắn tin realtime tốc độ cao, hỗ trợ trò chuyện riêng tư, chat nhóm và gửi file an toàn.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0c0a1a',
        theme_color: '#8b5cf6',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon'
            }
        ]
    }
}
