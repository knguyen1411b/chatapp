'use client'

import { ReactNode } from 'react'

import { Layout } from 'antd'

const { Content, Sider } = Layout

export const ChatShell = ({
    sidebar,
    main,
    detail,
    showSidebarOnMobile,
    showMainOnMobile
}: {
    sidebar: ReactNode
    main: ReactNode
    detail?: ReactNode
    showSidebarOnMobile: boolean
    showMainOnMobile: boolean
}) => (
    <Layout className="glass-panel h-[calc(100vh-2rem)] overflow-hidden rounded-3xl! border! border-purple-500/20! shadow-2xl">
        <Sider
            width={320}
            className={`border-r border-purple-500/10 dark:border-white/5 ${showSidebarOnMobile ? 'block' : 'hidden'} md:block`}
            breakpoint="md"
            collapsedWidth={0}
            trigger={null}
        >
            {sidebar}
        </Sider>
        <Content className={`${showMainOnMobile ? 'block' : 'hidden'} min-h-0 md:block bg-white/10 dark:bg-black/5`}>
            {main}
        </Content>
        {detail ? (
            <Sider width={285} className="hidden border-l border-purple-500/10 dark:border-white/5 xl:block">
                {detail}
            </Sider>
        ) : null}
    </Layout>
)
