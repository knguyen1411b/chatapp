'use client'

import { Spin } from 'antd'

export default function GlobalLoading() {
    return (
        <main className="flex min-h-screen items-center justify-center p-6">
            <div className="glass-panel flex items-center gap-3 rounded-2xl px-5 py-4">
                <Spin />
                <span className="text-sm text-slate-600">Đang tải giao diện…</span>
            </div>
        </main>
    )
}
