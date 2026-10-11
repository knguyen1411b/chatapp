'use client'

import { useMemo } from 'react'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { useMutation, useQuery } from '@tanstack/react-query'
import { Alert, Button, Form, Input, Typography } from 'antd'

import { AuthShell } from '@/features/auth/components/AuthShell'
import { chatApi } from '@/shared/lib/chat-api'
import { getErrorMessage } from '@/shared/lib/http'

export default function ResetPasswordPageView() {
    const searchParams = useSearchParams()
    const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams])
    const email = useMemo(() => searchParams.get('email')?.trim() ?? '', [searchParams])

    const verifyQuery = useQuery({
        queryKey: ['verify-reset-token', token, email],
        queryFn: () => chatApi.verifyResetPasswordToken(token, email),
        enabled: Boolean(token && email),
        retry: false
    })

    const resetMutation = useMutation({
        mutationFn: (payload: { newPassword: string }) => chatApi.resetPassword({ token, email, ...payload })
    })

    const missingQuery = !token || !email

    return (
        <AuthShell>
            {missingQuery ? (
                <Alert
                    type="error"
                    showIcon
                    className="rounded-xl border-red-500/20 bg-red-500/10 text-red-200"
                    title="Link không hợp lệ"
                    description="Vui lòng mở lại link đặt lại mật khẩu từ email."
                />
            ) : null}

            {!missingQuery && verifyQuery.isLoading ? (
                <Alert
                    type="info"
                    showIcon
                    className="rounded-xl border-blue-500/20 bg-blue-500/10 text-blue-200"
                    title="Đang xác thực link..."
                />
            ) : null}

            {!missingQuery && verifyQuery.isError ? (
                <Alert
                    type="error"
                    showIcon
                    className="rounded-xl border-red-500/20 bg-red-500/10 text-red-200"
                    title={getErrorMessage(verifyQuery.error, 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn')}
                />
            ) : null}

            {!missingQuery && verifyQuery.isSuccess ? (
                <>
                    <Typography.Title level={1} className="text-2xl! md:text-3xl! font-bold">Đặt lại mật khẩu</Typography.Title>
                    <Typography.Paragraph className="text-slate-400">
                        Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
                    </Typography.Paragraph>
                    <Form
                        className="mt-4"
                        layout="vertical"
                        onFinish={v => resetMutation.mutate(v)}
                        requiredMark={false}
                    >
                        <Form.Item
                            name="newPassword"
                            label="Mật khẩu mới"
                            rules={[{ required: true, min: 6, message: 'Mật khẩu mới tối thiểu 6 ký tự!' }]}
                        >
                            <Input.Password
                                name="newPassword"
                                autoComplete="new-password"
                                placeholder="Nhập mật khẩu mới của bạn"
                            />
                        </Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={resetMutation.isPending}
                            block
                            size="large"
                            className="hover-glow mt-2! bg-linear-to-r! from-purple-600 to-indigo-600 border-0 hover:from-purple-500 hover:to-indigo-500 transition-all font-semibold"
                        >
                            Cập nhật mật khẩu
                        </Button>
                    </Form>
                </>
            ) : null}

            {resetMutation.error ? (
                <Alert
                    className="mt-4!"
                    type="error"
                    showIcon
                    title={getErrorMessage(resetMutation.error, 'Không thể cập nhật mật khẩu')}
                />
            ) : null}

            {resetMutation.isSuccess ? (
                <Alert
                    className="mt-4!"
                    type="success"
                    showIcon
                    title="Đặt lại mật khẩu thành công"
                    description={
                        <span>
                            Bạn có thể{' '}
                            <Link href="/login" className="text-purple-400 font-semibold hover:underline">
                                đăng nhập ngay
                            </Link>{' '}
                            với mật khẩu mới.
                        </span>
                    }
                />
            ) : null}
        </AuthShell>
    )
}
