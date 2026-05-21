import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: 'Home',
    description: 'Trang điều hướng vào hệ thống chat realtime.'
}

export default function HomePage() {
    redirect('/chat')
}
