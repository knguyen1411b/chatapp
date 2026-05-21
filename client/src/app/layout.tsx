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

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    title: {
        default: 'Realtime Chat App',
        template: '%s | Realtime Chat App'
    },
    description: 'Realtime chat app with Next.js, Socket.IO, PostgreSQL, and modern Ant Design dashboard.',
    openGraph: {
        title: 'Realtime Chat App',
        description: 'Secure realtime messaging with private chat, groups, and presence indicators.',
        type: 'website'
    },
    robots: {
        index: true,
        follow: true
    }
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="vi" suppressHydrationWarning>
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
