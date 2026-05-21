import { MoreOutlined } from '@ant-design/icons'
import { Dropdown, Tooltip, Typography } from 'antd'
import { motion } from 'framer-motion'

import { formatLastSeen } from '@/shared/lib/format'
import { Message } from '@/shared/lib/types'

export const MessageBubble = ({
    message,
    mine,
    currentUserId,
    onReply,
    onForward,
    onFavorite,
    onReact,
    onEdit,
    onDelete
}: {
    message: Message
    mine: boolean
    currentUserId: number
    onReply: (m: Message) => void
    onForward: (m: Message) => void
    onFavorite: (id: number) => void
    onReact: (id: number, emoji: string) => void
    onEdit: (id: number) => void
    onDelete: (id: number) => void
}) => {
    const fav = message.favorites?.some(f => f.userId === currentUserId)

    return (
        <div className={`flex ${mine ? 'justify-end' : 'justify-start'} w-full mb-3`}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-md border ${
                    mine
                        ? 'rounded-tr-none bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 border-purple-400/10 text-white shadow-purple-500/10'
                        : 'rounded-tl-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-purple-500/5 dark:border-white/5 text-slate-900 dark:text-slate-100'
                }`}
            >
                <div className="mb-1 flex items-center justify-between gap-3 border-b border-white/10 dark:border-white/5 pb-1">
                    <Typography.Text
                        className={`text-[10px] font-bold tracking-wider uppercase ${mine ? 'text-purple-100' : 'text-purple-500 dark:text-purple-300'}`}
                    >
                        {message.sender.displayName || message.sender.username}
                    </Typography.Text>
                    <Dropdown
                        menu={{
                            items: [
                                { key: 'reply', label: 'Trả lời', onClick: () => onReply(message) },
                                { key: 'forward', label: 'Chuyển tiếp', onClick: () => onForward(message) },
                                {
                                    key: 'save',
                                    label: fav ? 'Bỏ lưu' : 'Lưu tin nhắn',
                                    onClick: () => onFavorite(message.id)
                                },
                                ...(mine
                                    ? [{ key: 'edit', label: 'Chỉnh sửa', onClick: () => onEdit(message.id) }]
                                    : []),
                                ...(mine
                                    ? [{ key: 'delete', label: 'Xóa tin nhắn', onClick: () => onDelete(message.id) }]
                                    : [])
                            ]
                        }}
                        classNames={{
                            root: 'rounded-xl border border-purple-500/10'
                        }}
                    >
                        <button
                            type="button"
                            aria-label="Mở menu tin nhắn"
                            className={`rounded-lg p-0.5 transition-colors leading-none shrink-0 ${mine ? 'hover:bg-white/10 text-white/80' : 'hover:bg-purple-500/10 text-slate-400'}`}
                        >
                            <MoreOutlined />
                        </button>
                    </Dropdown>
                </div>
                {message.replyTo ? (
                    <div
                        className={`mb-2 rounded-lg px-2.5 py-1.5 text-xs border ${mine ? 'bg-purple-700/40 border-purple-400/20 text-purple-100' : 'bg-purple-500/5 border-purple-500/10 text-slate-600 dark:text-slate-300'}`}
                    >
                        <span className="font-bold block text-[10px] opacity-75">
                            Đang trả lời {message.replyTo.sender.username}:
                        </span>
                        <span className="italic block mt-0.5 truncate">{message.replyTo.content}</span>
                    </div>
                ) : null}
                {message.type === 'IMAGE' ? (
                    <a href={message.content} target="_blank" rel="noreferrer" className="block">
                        <img
                            src={message.content}
                            alt="Ảnh đã gửi"
                            className="max-h-72 w-full rounded-xl border border-white/10 object-cover"
                        />
                    </a>
                ) : message.type === 'FILE' ? (
                    <a
                        href={message.content}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex max-w-full items-center rounded-lg border px-3 py-2 text-sm underline-offset-2 hover:underline ${
                            mine
                                ? 'border-white/20 bg-purple-700/30 text-white'
                                : 'border-purple-500/20 bg-purple-500/5 text-slate-800 dark:text-slate-100'
                        }`}
                    >
                        Tải file đính kèm
                    </a>
                ) : (
                    <p className="wrap-break-word text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                )}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {['👍', '❤️', '😂', '😮'].map(emoji => {
                        const count = message.reactions?.filter(r => r.emoji === emoji).length || 0
                        return (
                            <Tooltip title={`Thả cảm xúc ${emoji}`} key={emoji}>
                                <button
                                    type="button"
                                    aria-label={`Thả cảm xúc ${emoji}`}
                                    className={`rounded-full px-2 py-0.5 text-xs transition-all flex items-center gap-1 border ${
                                        mine
                                            ? 'bg-purple-700/20 border-purple-400/10 hover:bg-purple-700/40 text-white'
                                            : 'bg-purple-500/5 border-purple-500/10 hover:bg-purple-500/10 text-slate-700 dark:text-slate-300'
                                    } ${count > 0 ? 'font-bold scale-105' : 'opacity-65 hover:opacity-100'}`}
                                    onClick={() => onReact(message.id, emoji)}
                                >
                                    <span>{emoji}</span>
                                    {count > 0 && <span className="text-[10px]">{count}</span>}
                                </button>
                            </Tooltip>
                        )
                    })}
                </div>
                <div
                    className={`mt-1.5 flex flex-wrap items-center justify-end gap-2 text-[9px] font-semibold opacity-75 ${mine ? 'text-purple-200' : 'text-slate-400 dark:text-slate-500'}`}
                >
                    <span>
                        {formatLastSeen(message.createdAt)}
                        {message.editedAt ? ' (đã sửa)' : ''}
                    </span>
                </div>
            </motion.div>
        </div>
    )
}
