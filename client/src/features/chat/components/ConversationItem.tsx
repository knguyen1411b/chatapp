import { PushpinOutlined } from '@ant-design/icons'
import { Avatar, Badge, Button, Card, Space, Tag, Typography } from 'antd'
import { motion } from 'framer-motion'

import { formatShortTime } from '@/shared/lib/format'
import { Conversation } from '@/shared/lib/types'

export const ConversationItem = ({
    conversation,
    currentUserId,
    active,
    onClick,
    onTogglePin
}: {
    conversation: Conversation
    currentUserId: number
    active: boolean
    onClick: () => void
    onTogglePin: () => void
}) => {
    const other = conversation.members.find(m => m.userId !== currentUserId)?.user
    const title =
        conversation.type === 'GROUP' ? conversation.name || 'Nhóm' : other?.displayName || other?.username || 'Private'
    const unreadCount = conversation.unreadCount ?? 0

    return (
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.16 }}>
            <Card
                hoverable
                size="small"
                onClick={onClick}
                className={`mb-2.5 cursor-pointer rounded-2xl border transition-all ${
                    active
                        ? 'border-purple-500 bg-purple-500/15 shadow-[0_0_15px_-3px_rgba(139,92,246,0.25)] dark:border-purple-400 dark:bg-purple-500/10'
                        : 'border-purple-500/5 bg-white/30 dark:border-white/5 dark:bg-slate-900/20 hover:border-purple-500/20 dark:hover:border-white/10'
                }`}
                styles={{ body: { padding: '12px 10px' } }}
            >
                <div className="flex items-start gap-3">
                    <Badge
                        dot
                        status={
                            other?.presence === 'ONLINE'
                                ? 'success'
                                : other?.presence === 'AWAY'
                                  ? 'warning'
                                  : 'default'
                        }
                        className="shrink-0"
                    >
                        <Avatar
                            src={other?.avatar || undefined}
                            className="bg-purple-600 text-white font-bold border border-white/5 shadow-sm"
                        >
                            {title[0]}
                        </Avatar>
                    </Badge>
                    <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                            <Typography.Text strong ellipsis className="text-sm tracking-wide">
                                {title}
                            </Typography.Text>
                            <Typography.Text type="secondary" className="shrink-0 text-[10px] font-medium opacity-80">
                                {formatShortTime(conversation.updatedAt)}
                            </Typography.Text>
                        </div>
                        <Typography.Paragraph
                            ellipsis={{ rows: 1 }}
                            className="mb-2! mt-0.5! text-xs! text-slate-500! dark:text-slate-400! font-medium"
                        >
                            {conversation.lastMessage ? conversation.lastMessage.content : 'Bắt đầu cuộc trò chuyện'}
                        </Typography.Paragraph>
                        <div className="flex items-center justify-between gap-2 mt-1">
                            <Space size={4} wrap>
                                <Tag
                                    className="m-0 border-0 rounded-full text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5"
                                    color={conversation.type === 'GROUP' ? 'purple' : 'blue'}
                                >
                                    {conversation.type}
                                </Tag>
                                {conversation.isPinned ? (
                                    <Tag
                                        className="m-0 border-0 rounded-full text-[10px] font-semibold px-2 py-0.5"
                                        color="gold"
                                    >
                                        PIN
                                    </Tag>
                                ) : null}
                                {unreadCount > 0 ? (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-500 px-1 text-[10px] font-bold text-white shadow-md">
                                        {unreadCount}
                                    </span>
                                ) : null}
                            </Space>
                            <Button
                                aria-label={conversation.isPinned ? 'Bỏ ghim cuộc trò chuyện' : 'Ghim cuộc trò chuyện'}
                                size="small"
                                type="text"
                                className="h-6 w-6 rounded-lg flex items-center justify-center p-0 ml-auto hover:bg-purple-500/10"
                                onClick={e => {
                                    e.stopPropagation()
                                    onTogglePin()
                                }}
                            >
                                <PushpinOutlined
                                    className={conversation.isPinned ? 'text-yellow-500' : 'text-slate-400'}
                                />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
