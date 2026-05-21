'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { SendOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Alert, Button, Form, Input } from 'antd'
import Title from 'antd/es/typography/Title'

import { AuthShell } from '@/features/auth/components/AuthShell'
import { authStorage } from '@/shared/lib/auth-storage'
import { chatApi } from '@/shared/lib/chat-api'

export default function RegisterPageView() {
    const router = useRouter()
    const mutation = useMutation({
        mutationFn: (values: { username: string; email: string; password: string; displayName?: string }) =>
            chatApi.register(values),
        onSuccess: user => {
            authStorage.setUser(user)
            router.push('/chat')
        }
    })

    return (
        <AuthShell position="left">
            <Title level={2} className="text-center text-white">
                Tạo tài khoản mới
            </Title>
            <Form layout="vertical" onFinish={v => mutation.mutate(v)} requiredMark={false}>
                <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, min: 2, message: 'Username tối thiểu 2 ký tự!' }]}
                >
                    <Input
                        size="large"
                        name="username"
                        placeholder="Nhập username của bạn"
                        autoComplete="username"
                        spellCheck={false}
                    />
                </Form.Item>
                <Form.Item name="displayName" label="Tên hiển thị">
                    <Input
                        size="large"
                        name="displayName"
                        placeholder="Nhập tên hiển thị của bạn"
                        autoComplete="name"
                    />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ required: true, type: 'email', message: 'Vui lòng nhập đúng định dạng email!' }]}
                >
                    <Input
                        size="large"
                        name="email"
                        type="email"
                        placeholder="Nhập email của bạn"
                        autoComplete="email"
                        spellCheck={false}
                    />
                </Form.Item>
                <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }]}
                >
                    <Input.Password
                        size="large"
                        name="password"
                        placeholder="Nhập mật khẩu của bạn"
                        autoComplete="new-password"
                    />
                </Form.Item>
                <Button
                    htmlType="submit"
                    type="primary"
                    block
                    size="large"
                    icon={<SendOutlined />}
                    loading={mutation.isPending}
                    className="hover-glow! mt-2! bg-linear-to-r! from-purple-600 to-indigo-600 border-0 hover:from-purple-500 hover:to-indigo-500 transition-all font-semibold"
                >
                    Tạo tài khoản
                </Button>
            </Form>
            {mutation.isError && (
                <Alert
                    aria-live="polite"
                    className="mt-4!"
                    type="error"
                    showIcon
                    title={(mutation.error as any)?.response?.data?.message ?? 'Đăng ký thất bại'}
                />
            )}
            <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
                Đã có tài khoản?{' '}
                <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                    Đăng nhập ngay
                </Link>
            </p>
        </AuthShell>
    )
}
