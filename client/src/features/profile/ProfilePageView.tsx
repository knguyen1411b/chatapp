'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import { ArrowLeftOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { App, Avatar, Button, Card, Form, Input, Space, Typography } from 'antd'

import { ThemeToggle } from '@/features/theme'
import { authStorage } from '@/shared/lib/auth-storage'
import { chatApi } from '@/shared/lib/chat-api'
import { getErrorMessage } from '@/shared/lib/http'
import { AuthUser } from '@/shared/lib/types'

export default function ProfilePageView() {
    const router = useRouter()
    const { message } = App.useApp()

    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [form] = Form.useForm<{ displayName: string }>()

    useEffect(() => {
        const run = async () => {
            setLoading(true)
            try {
                const profile = await chatApi.getMyProfile()
                setUser(profile)
                authStorage.setUser(profile)
            } catch (error) {
                router.replace('/login')
                message.error(getErrorMessage(error, 'Không tải được thông tin cá nhân'))
            } finally {
                setLoading(false)
            }
        }
        run()
    }, [form, message, router])

    useEffect(() => {
        if (!loading && user) {
            form.setFieldsValue({
                displayName: user.displayName || ''
            })
        }
    }, [loading, user, form])

    const displayLabel = useMemo(() => user?.displayName || user?.username || 'User', [user])

    const saveProfile = async (values: { displayName: string }) => {
        setSaving(true)
        try {
            const updated = await chatApi.updateMyProfile({ displayName: values.displayName.trim() || undefined })
            setUser(updated)
            authStorage.setUser(updated)
            message.success('Đã cập nhật thông tin cá nhân')
        } catch (error) {
            message.error(getErrorMessage(error, 'Cập nhật thất bại'))
        } finally {
            setSaving(false)
        }
    }

    const uploadAvatar = async (file?: File) => {
        if (!file) return
        setUploading(true)
        try {
            const uploaded = await chatApi.uploadFiles([file])
            if (!uploaded[0]?.url) throw new Error('Upload chưa có URL, vui lòng kiểm tra CLOUDINARY')
            const updated = await chatApi.updateMyProfile({ avatar: uploaded[0].url })
            setUser(updated)
            authStorage.setUser(updated)
            message.success('Đã cập nhật avatar')
        } catch (error) {
            message.error(getErrorMessage(error, 'Upload avatar thất bại'))
        } finally {
            setUploading(false)
        }
    }

    const deleteAvatar = async () => {
        setDeleting(true)
        try {
            const updated = await chatApi.deleteMyAvatar()
            setUser(updated)
            authStorage.setUser(updated)
            message.success('Đã xóa avatar')
        } catch (error) {
            message.error(getErrorMessage(error, 'Xóa avatar thất bại'))
        } finally {
            setDeleting(false)
        }
    }

    return (
        <main id="main-content" className="mx-auto h-screen max-w-3xl p-4 md:p-6">
            <Card className="glass-panel relative rounded-3xl!" loading={loading}>
                <div className="absolute top-5 right-5">
                    <ThemeToggle />
                </div>
                <Space orientation="vertical" size={18} className="w-full">
                    <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.push('/chat')}>
                        Quay lại chat
                    </Button>

                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
                        <Avatar size={92} src={user?.avatar || undefined} className="bg-indigo-600">
                            {displayLabel[0]}
                        </Avatar>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={event => {
                                uploadAvatar(event.target.files?.[0])
                                event.currentTarget.value = ''
                            }}
                        />
                        <Space wrap>
                            <Button
                                icon={<UploadOutlined />}
                                loading={uploading}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Đổi avatar
                            </Button>
                            <Button danger icon={<DeleteOutlined />} loading={deleting} onClick={deleteAvatar}>
                                Xóa avatar
                            </Button>
                        </Space>
                    </div>

                    <Form form={form} layout="vertical" onFinish={saveProfile} requiredMark={false}>
                        <Form.Item label="Username">
                            <Input value={user?.username} disabled />
                        </Form.Item>
                        <Form.Item label="Email">
                            <Input value={user?.email} disabled />
                        </Form.Item>
                        <Form.Item
                            name="displayName"
                            label="Display name"
                            rules={[{ min: 1, max: 80, message: 'Display name từ 1-80 ký tự' }]}
                        >
                            <Input placeholder="Tên hiển thị" maxLength={80} />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={saving}>
                            Lưu thay đổi
                        </Button>
                    </Form>

                    <Typography.Text type="secondary">
                        Avatar được lưu ở tài khoản và đồng bộ khi quay lại trang chat.
                    </Typography.Text>
                </Space>
            </Card>
        </main>
    )
}
