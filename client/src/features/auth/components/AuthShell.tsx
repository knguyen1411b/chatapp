'use client'

import { ReactNode } from 'react'

import { Card, Tag, Typography } from 'antd'
import Title from 'antd/es/typography/Title'
import { motion } from 'framer-motion'

import { ThemeToggle } from '@/features/theme'

import { ChatDemo } from './ChatDemo'

export const AuthShell = ({ children, position = 'right' }: { children: ReactNode; position?: 'left' | 'right' }) => {
    const renderDemo = () => (
        <section className="relative hidden bg-linear-to-br from-purple-700 via-violet-600 to-fuchsia-500 p-12 text-white lg:flex lg:flex-col lg:justify-between overflow-hidden">
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-cyan-400/25 blur-3xl" />
            <div className="pointer-events-none absolute -top-14 -left-14 h-60 w-60 rounded-full bg-fuchsia-400/30 blur-3xl" />
            <div>
                <Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 900 }}>
                    Welcome to Chatapp
                </Title>
            </div>
            <div>
                <Tag variant="solid" className="bg-white/20! text-white!" style={{ fontSize: 14 }}>
                    Kết nối mọi người, mọi lúc, mọi nơi
                </Tag>
            </div>
            <ChatDemo />
            <div className="text-center">
                <Typography.Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                    © {new Date().getFullYear()} Knguyen1411b. All rights reserved.
                </Typography.Text>
            </div>
        </section>
    )
    return (
        <main id="main-content" className="relative flex min-h-screen items-center justify-center p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, ease: 'easeOut' }}
                className="w-full max-w-5xl"
            >
                <Card className="glass-panel w-full overflow-hidden rounded-4xl" styles={{ body: { padding: 0 } }}>
                    <div className="grid min-h-160 grid-cols-1 overflow-hidden lg:grid-cols-[1.1fr_1fr]">
                        {position === 'right' && renderDemo()}
                        <section className="flex flex-col justify-center p-8 py-12 md:p-12 lg:p-14 relative">
                            <div className="absolute top-4 right-4">
                                <ThemeToggle />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">{children}</div>
                        </section>
                        {position === 'left' && renderDemo()}
                    </div>
                </Card>
            </motion.div>
        </main>
    )
}
