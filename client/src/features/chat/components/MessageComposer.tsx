import { useRef } from 'react'

import { PaperClipOutlined, PictureOutlined, SendOutlined } from '@ant-design/icons'
import { Button, Card, Input, Typography } from 'antd'

import { Message } from '@/shared/lib/types'

const { TextArea } = Input

export const MessageComposer = ({
    text,
    onChange,
    onSend,
    loading,
    uploading,
    onSendFiles,
    replyTo,
    onCancelReply,
    typingText
}: {
    text: string
    onChange: (v: string) => void
    onSend: () => void
    loading: boolean
    uploading: boolean
    onSendFiles: (files: File[]) => void
    replyTo: Message | null
    onCancelReply: () => void
    typingText: string
}) => {
    const imageInputRef = useRef<HTMLInputElement | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const handlePickFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files
        const files = fileList ? Array.from(fileList) : []
        if (files.length) {
            onSendFiles(files)
        }
        event.target.value = ''
    }

    return (
        <Card
            variant="borderless"
            className="rounded-none! border-t border-purple-500/10 dark:border-white/5 bg-white/5 dark:bg-black/10 backdrop-blur-md"
            styles={{ body: { padding: '16px 20px' } }}
        >
            {typingText ? (
                <Typography.Text
                    aria-live="polite"
                    type="secondary"
                    className="mb-2 block text-xs italic font-medium text-purple-400"
                >
                    {typingText}
                </Typography.Text>
            ) : null}
            {replyTo ? (
                <div className="mb-3 flex items-center justify-between rounded-xl border border-purple-500/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-3.5 py-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="truncate">
                        <span className="font-bold">Đang trả lời {replyTo.sender.username}:</span>{' '}
                        <span className="italic">{replyTo.content}</span>
                    </span>
                    <button
                        type="button"
                        aria-label="Hủy trả lời"
                        className="ml-3 font-semibold text-red-400 hover:text-red-300 transition-colors shrink-0"
                        onClick={onCancelReply}
                    >
                        Hủy
                    </button>
                </div>
            ) : null}
            <div className="flex gap-2">
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePickFiles}
                    aria-label="Chọn ảnh gửi"
                />
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handlePickFiles}
                    aria-label="Chọn file gửi"
                />
                <Button
                    aria-label="Gửi ảnh"
                    icon={<PictureOutlined />}
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploading || loading}
                    size="large"
                    className="h-11 w-11 shrink-0 rounded-xl border border-purple-500/20 bg-white/10 hover:bg-white/20"
                />
                <Button
                    aria-label="Gửi file"
                    icon={<PaperClipOutlined />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || loading}
                    size="large"
                    className="h-11 w-11 shrink-0 rounded-xl border border-purple-500/20 bg-white/10 hover:bg-white/20"
                />
                <Input
                    aria-label="Khung nhập tin nhắn"
                    placeholder="Nhập tin nhắn…"
                    value={text}
                    onChange={e => onChange(e.target.value)}
                    onPressEnter={e => {
                        if (!e.shiftKey) {
                            e.preventDefault()
                            if (text.trim() && !loading) onSend()
                        }
                    }}
                    size="large"
                    className="rounded-xl border border-purple-500/10 bg-white/5 focus:border-purple-500/80"
                />
                <Button
                    aria-label="Gửi tin nhắn"
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={onSend}
                    disabled={loading || !text.trim()}
                    loading={uploading}
                    size="large"
                    className="hover-glow h-11 w-11 shrink-0 rounded-xl border-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition-all hover:from-purple-500 hover:to-indigo-500"
                />
            </div>
        </Card>
    )
}
