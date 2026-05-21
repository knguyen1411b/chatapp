'use client'

import { useEffect } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { GithubOutlined, GoogleOutlined, LoginOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Alert, Button, Divider, Form, Input } from 'antd'
import Paragraph from 'antd/es/typography/Paragraph'
import Title from 'antd/es/typography/Title'

import { AuthShell } from '@/features/auth/components/AuthShell'
import { authStorage } from '@/shared/lib/auth-storage'
import { chatApi } from '@/shared/lib/chat-api'

const GoogleIcon = () => (
    <svg
        className="mr-2 h-4 w-4"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
        <path
            fill="#EA4335"
            d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.107C18.29 1.845 15.538 1 12.24 1 5.48 1 0 6.48 0 13.2s5.48 12.2 12.24 12.2c7.055 0 11.75-4.91 11.75-11.9 0-.8-.085-1.4-.2-2.015H12.24z"
        />
    </svg>
)

const GithubIcon = () => (
    <svg
        className="mr-2 h-4 w-4"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        style={{ display: 'inline-block', verticalAlign: 'middle', fill: 'currentColor' }}
    >
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
)

export default function LoginPageView() {
    const router = useRouter()

    useEffect(() => {
        chatApi
            .getMe()
            .then(user => {
                authStorage.setUser(user)
                router.replace('/chat')
            })
            .catch(() => {})
    }, [router])

    const loginMutation = useMutation({
        mutationFn: (values: { email: string; password: string }) => chatApi.login(values),
        onSuccess: user => {
            authStorage.setUser(user)
            router.push('/chat')
        }
    })

    return (
        <AuthShell>
            <Title level={2} className="text-center text-white">
                Chào mừng trở lại!
            </Title>
            <Paragraph className="text-center text-slate-400">
                Vui lòng đăng nhập vào tài khoản của bạn để tiếp tục
            </Paragraph>
            <Form layout="vertical" onFinish={v => loginMutation.mutate(v)} requiredMark={false}>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ required: true, type: 'email', message: 'Vui lòng nhập đúng định dạng email!' }]}
                >
                    <Input
                        size="large"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Nhập email của bạn"
                        spellCheck={false}
                    />
                </Form.Item>
                <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[{ required: true, min: 6, message: 'Mật khẩu phải từ 6 ký tự!' }]}
                >
                    <Input.Password
                        size="large"
                        name="password"
                        placeholder="Nhập mật khẩu của bạn"
                        autoComplete="current-password"
                    />
                </Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={loginMutation.isPending}
                    className="hover-glow! mt-3! bg-linear-to-r! from-purple-600 to-indigo-600 border-0 hover:from-purple-500 hover:to-indigo-500 transition-all font-semibold"
                    icon={<LoginOutlined />}
                >
                    Đăng nhập
                </Button>
            </Form>
            {loginMutation.isError && (
                <Alert
                    aria-live="polite"
                    className="mt-4!"
                    type="error"
                    showIcon
                    title={(loginMutation.error as any)?.response?.data?.message ?? 'Đăng nhập thất bại'}
                />
            )}
            <div className="mt-6 flex justify-between text-xs *:text-slate-700! dark:*:text-slate-50!">
                <Link href="/register" className="hover:text-purple-400 transition-colors font-medium">
                    Tạo tài khoản mới
                </Link>
                <Link href="/forgot-password" className="hover:text-purple-400 transition-colors font-medium">
                    Quên mật khẩu?
                </Link>
            </div>
            <Divider plain className="my-6!">
                Hoặc tiếp tục với
            </Divider>
            <div className="grid grid-cols-2 gap-3">
                <Button
                    size="large"
                    icon={<GoogleOutlined />}
                    // href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
                >
                    Google
                </Button>
                <Button
                    size="large"
                    icon={<GithubOutlined />}
                    // href={`${process.env.NEXT_PUBLIC_API_URL}/auth/github`}
                >
                    GitHub
                </Button>
            </div>
        </AuthShell>
    )
}
