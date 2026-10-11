import type { Metadata } from 'next'

import { Be_Vietnam_Pro } from 'next/font/google'

import { AntdRegistry } from '@ant-design/nextjs-registry'

import { AppProviders } from '@/shared/providers/app-providers'

import './globals.css'

const appFont = Be_Vietnam_Pro({
    subsets: ['latin', 'vietnamese'],
    display: 'swap',
    variable: '--font-app',
    weight: ['400', '500', '600', '700']
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
    metadataBase: new URL(appUrl),
    title: {
        default: 'ChatApp - Nền tảng nhắn tin Realtime Hiện đại & Bảo mật',
        template: '%s | ChatApp'
    },
    description:
        'ChatApp là ứng dụng nhắn tin realtime tốc độ cao, hỗ trợ trò chuyện riêng tư, chat nhóm, chia sẻ hình ảnh và tệp tin với giao diện glassmorphism sang trọng.',
    applicationName: 'ChatApp',
    keywords: [
        'chatapp',
        'nhắn tin realtime',
        'chat trực tuyến',
        'chat nhóm',
        'socket.io chat',
        'ứng dụng chat bảo mật',
        'nextjs chat app',
        'vietnam chat app'
    ],
    authors: [{ name: 'Knguyen1411b' }],
    creator: 'Knguyen1411b',
    publisher: 'ChatApp',
    formatDetection: {
        email: false,
        address: false,
        telephone: false
    },
    alternates: {
        canonical: '/'
    },
    openGraph: {
        title: 'ChatApp - Nền tảng nhắn tin Realtime Hiện đại & Bảo mật',
        description:
            'Trò chuyện riêng tư, chat nhóm, chia sẻ tập tin và trạng thái online thời gian thực với trải nghiệm mượt mà.',
        url: '/',
        siteName: 'ChatApp',
        locale: 'vi_VN',
        type: 'website'
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ChatApp - Nền tảng nhắn tin Realtime Hiện đại & Bảo mật',
        description:
            'Trò chuyện riêng tư, chat nhóm, chia sẻ tập tin và trạng thái online thời gian thực.',
        creator: '@knguyen1411b'
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1
        }
    }
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ChatApp',
    url: appUrl,
    description: 'Ứng dụng nhắn tin realtime tốc độ cao, bảo mật và hiện đại.',
    applicationCategory: 'CommunicationApplication',
    operatingSystem: 'All',
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'VND'
    },
    author: {
        '@type': 'Person',
        name: 'Knguyen1411b'
    }
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className={`${appFont.variable}`}>
                <a href="#main-content" className="skip-link">
                    Skip to main content
                </a>
                <AntdRegistry>
                    <AppProviders>{children}</AppProviders>
                </AntdRegistry>
            </body>
        </html>
    )
}
