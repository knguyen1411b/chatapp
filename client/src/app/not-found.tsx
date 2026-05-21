import Link from 'next/link'
import type { Metadata } from 'next'

import { Button, Result } from 'antd'

export const metadata: Metadata = {
    title: '404 - Không tìm thấy trang',
    description: 'Trang bạn yêu cầu không tồn tại.',
    robots: {
        index: false,
        follow: false
    }
}

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
