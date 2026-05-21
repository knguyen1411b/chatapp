'use client'

import Link from 'next/link'

import { SendOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Alert, Button, Form, Input, Typography } from 'antd'

import { AuthShell } from '@/features/auth/components/AuthShell'
import { chatApi } from '@/shared/lib/chat-api'
import { getErrorMessage } from '@/shared/lib/http'

export default function ForgotPasswordPageView() {
    const forgot = useMutation({
        mutationFn: chatApi.forgotPassword
    })

    return (
        <AuthShell>
            <Typography.Title level={2}>Quên mật khẩu</Typography.Title>
            <Typography.Paragraph type="secondary" className="mt-0! mb-6!">
                Nhập email của bạn để gửi yêu cầu đặt lại mật khẩu.
            </Typography.Paragraph>
            <Form layout="vertical" onFinish={v => forgot.mutate(v.email)} requiredMark={false}>
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
                        spellCheck={false}
                        placeholder="Nhập email của bạn"
                    />
                </Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={forgot.isPending}
                    block
                    icon={<SendOutlined />}
                    size="large"
                    className="hover-glow! mt-2! bg-linear-to-r! from-purple-600 to-indigo-600 border-0 hover:from-purple-500 hover:to-indigo-500 transition-all font-semibold"
                >
                    Gửi email đặt lại mật khẩu
                </Button>
            </Form>
            {forgot.error ? (
                <Alert
                    className="mt-4!"
                    type="error"
                    showIcon
                    title={getErrorMessage(forgot.error, 'Không gửi được email đặt lại mật khẩu')}
                />
            ) : null}
            {forgot.isSuccess ? (
                <Alert
                    className="mt-4!"
                    type="success"
                    showIcon
                    title="Gửi email thành công"
                    description="Vui lòng kiểm tra hộp thư và bấm vào link để đặt lại mật khẩu."
                />
            ) : null}

            <div className="mt-6 flex justify-start text-xs text-slate-500 dark:text-slate-400">
                Đã nhớ mật khẩu?
                <Link
                    href="/login"
                    className="ml-1 text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                >
                    Quay lại đăng nhập
                </Link>
            </div>
        </AuthShell>
    )
}
