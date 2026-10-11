'use client'

import { useSyncExternalStore } from 'react'

import { DesktopOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, Dropdown } from 'antd'
import { useTheme } from 'next-themes'

export type ThemeMode = 'light' | 'dark' | 'system'

const emptySubscribe = () => () => {}

export const ThemeToggle = () => {
    const mounted = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    )

    const { theme, setTheme, resolvedTheme } = useTheme()

    const currentTheme = (theme ?? 'system') as ThemeMode
    const displayIcon =
        currentTheme === 'system' ? <DesktopOutlined /> : resolvedTheme === 'dark' ? <MoonOutlined /> : <SunOutlined />

    if (!mounted) {
        return null
    }

    return (
        <Dropdown
            menu={{
                selectable: true,
                selectedKeys: [currentTheme],
                items: [
                    { key: 'light', icon: <SunOutlined />, label: 'Light' },
                    { key: 'dark', icon: <MoonOutlined />, label: 'Dark' },
                    { key: 'system', icon: <DesktopOutlined />, label: 'System' }
                ],
                onClick: ({ key }) => setTheme(key as ThemeMode)
            }}
        >
            <Button aria-label="Đổi giao diện sáng tối">{displayIcon}</Button>
        </Dropdown>
    )
}
