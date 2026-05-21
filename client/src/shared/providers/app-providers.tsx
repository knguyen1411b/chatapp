'use client'

import { ReactNode, useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App, ConfigProvider, theme } from 'antd'
import { ThemeProvider, useTheme } from 'next-themes'

const AppThemeProvider = ({ children }: { children: ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient())
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === 'dark'

    return (
        <ConfigProvider
            theme={{
                algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorPrimary: '#8b5cf6',
                    borderRadius: 16,
                    fontFamily: 'var(--font-app), Helvetica, Arial, sans-serif',
                    colorBgLayout: 'transparent',
                    colorBgContainer: isDark ? 'rgba(12, 10, 26, 0.5)' : 'rgba(255, 255, 255, 0.55)',
                    colorText: isDark ? '#f3f0ff' : '#1f1a3a',
                    colorTextSecondary: isDark ? '#9c9aab' : '#6b6780',
                    colorBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(139, 92, 246, 0.08)',
                    colorBorderSecondary: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(139, 92, 246, 0.04)',
                    controlHeight: 44,
                    boxShadow: isDark
                        ? '0 24px 64px -12px rgba(0, 0, 0, 0.7)'
                        : '0 24px 64px -12px rgba(109, 40, 217, 0.08)'
                },
                components: {
                    Card: {
                        borderRadiusLG: 24,
                        colorBgContainer: isDark ? 'rgba(15, 12, 30, 0.45)' : 'rgba(255, 255, 255, 0.45)'
                    },
                    Layout: {
                        bodyBg: 'transparent',
                        siderBg: 'transparent',
                        headerBg: 'transparent'
                    },
                    Button: {
                        borderRadius: 99,
                        controlHeight: 44,
                        fontWeight: 600
                    },
                    Input: {
                        borderRadius: 12,
                        controlHeight: 44
                    },
                    Select: {
                        borderRadius: 12,
                        controlHeight: 44
                    }
                }
            }}
        >
            <App>
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </App>
        </ConfigProvider>
    )
}

export const AppProviders = ({ children }: { children: ReactNode }) => (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AppThemeProvider>{children}</AppThemeProvider>
    </ThemeProvider>
)
