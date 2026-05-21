'use client'

import Link from 'next/link'

import { Button, Result } from 'antd'

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center p-6">
            <Result
                status="404"
                title="404"
                subTitle="Trang bạn tìm không tồn tại."
                extra={
                    <Link href="/chat">
                        <Button type="primary">Về trang chat</Button>
                    </Link>
                }
            />
        </main>
    )
}
