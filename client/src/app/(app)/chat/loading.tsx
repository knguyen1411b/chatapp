'use client'

import { Card, Layout, Skeleton, Space } from 'antd'

export default function ChatLoading() {
    return (
        <main className="mx-auto h-screen max-w-400 p-3 md:p-4">
            <Layout className="glass-panel h-[calc(100vh-2rem)] overflow-hidden rounded-3xl">
                <Layout.Sider width={320} className="border-r border-slate-200/70 p-3">
                    <Space orientation="vertical" className="w-full" size={12}>
                        <Skeleton active avatar paragraph={{ rows: 2 }} />
                        <Skeleton.Input active block size="large" />
                        <Skeleton active paragraph={{ rows: 6 }} />
                    </Space>
                </Layout.Sider>
                <Layout.Content className="p-4">
                    <Space orientation="vertical" className="w-full" size={16}>
                        <Skeleton active avatar paragraph={{ rows: 1 }} />
                        <Card className="rounded-2xl">
                            <Skeleton active paragraph={{ rows: 8 }} />
                        </Card>
                    </Space>
                </Layout.Content>
            </Layout>
        </main>
    )
}
