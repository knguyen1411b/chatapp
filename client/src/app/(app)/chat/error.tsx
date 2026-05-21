'use client'

import { Button, Result } from 'antd'

export default function ChatError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <main className="mx-auto flex h-screen max-w-225 items-center justify-center p-6">
            <Result
                status="error"
                title="Không thể tải trang chat"
                subTitle={error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.'}
                extra={
                    <Button type="primary" onClick={reset}>
                        Thử lại
                    </Button>
                }
            />
        </main>
    )
}
