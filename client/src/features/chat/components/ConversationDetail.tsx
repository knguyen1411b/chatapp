import {
    CalendarOutlined,
    CrownOutlined,
    InfoCircleOutlined,
    MailOutlined,
    PushpinOutlined,
    UserOutlined
} from '@ant-design/icons'
import { Avatar, Badge, Card, Divider, Space, Tag, Typography } from 'antd'
import dayjs from 'dayjs'

import { Conversation } from '@/shared/lib/types'

export const ConversationDetail = ({
    conversation,
    currentUserId,
    onTogglePin
}: {
    conversation: Conversation | null
    currentUserId: number
    onTogglePin?: (id: number) => void
}) => {
    if (!conversation) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500">
                <InfoCircleOutlined className="text-3xl mb-3 opacity-60 text-purple-400 animate-pulse-slow" />
                <Typography.Text className="text-sm font-semibold opacity-70">
                    Chọn một cuộc trò chuyện để xem chi tiết
                </Typography.Text>
            </div>
        )
    }

    const isGroup = conversation.type === 'GROUP'

    const otherMember = !isGroup ? conversation.members.find(m => m.userId !== currentUserId) : null
    const otherUser = otherMember?.user

    const title = isGroup
        ? conversation.name || 'Nhóm trò chuyện'
        : otherUser?.displayName || otherUser?.username || 'Người dùng'

    const presenceStatus = otherUser?.presence || 'OFFLINE'

    return (
        <div className="h-full flex flex-col overflow-y-auto custom-scrollbar p-5 bg-white/5 dark:bg-black/10 backdrop-blur-md border-l border-purple-500/10 dark:border-white/5">
            <div className="flex flex-col items-center text-center mt-6!">
                <Avatar size={84}>{title[0]}</Avatar>
                <Typography.Title
                    level={4}
                    className="mt-3! mb-0! text-slate-900 dark:text-white font-bold tracking-wide"
                >
                    {title}
                </Typography.Title>

                <Typography.Text type="secondary" className="text-xs mt-1 block opacity-85">
                    {isGroup
                        ? 'Nhóm công khai'
                        : presenceStatus === 'ONLINE'
                          ? 'Đang hoạt động'
                          : presenceStatus === 'AWAY'
                            ? 'Đang vắng'
                            : 'Ngoại tuyến'}
                </Typography.Text>
            </div>

            <Divider className="my-4! border-purple-500/10 dark:border-white/5" />

            {!isGroup && otherUser ? (
                <div className="space-y-4!">
                    <Card
                        size="small"
                        className="border-purple-500/10 bg-white/20 dark:bg-slate-950/20 rounded-xl"
                        title={
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                Thông tin cá nhân
                            </span>
                        }
                    >
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2.5">
                                <UserOutlined className="text-slate-400" />
                                <div className="min-w-0">
                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">
                                        Tên tài khoản
                                    </div>
                                    <div className="truncate font-semibold">{otherUser.username}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <MailOutlined className="text-slate-400" />
                                <div className="min-w-0">
                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">
                                        Địa chỉ Email
                                    </div>
                                    <div className="truncate font-semibold">{otherUser.email}</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card
                        size="small"
                        className="border-purple-500/10 bg-white/20 dark:bg-slate-950/20 rounded-xl"
                        title={
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                Cài đặt & Tùy chọn
                            </span>
                        }
                    >
                        <div className="text-sm text-slate-400 dark:text-slate-500 mb-2">
                            <div
                                className="p-2 hover:bg-purple-500/5 rounded-lg cursor-pointer transition-colors"
                                onClick={() => onTogglePin?.(conversation.id)}
                            >
                                <Space className="text-xs font-semibold">
                                    <PushpinOutlined className="text-slate-400" />
                                    <span>{conversation.isPinned ? 'Bỏ ghim hội thoại' : 'Ghim hội thoại này'}</span>
                                </Space>
                            </div>
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="space-y-4!">
                    <Card
                        size="small"
                        className="border-purple-500/10 bg-white/20 dark:bg-slate-950/20 rounded-xl"
                        title={
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                Chi tiết nhóm
                            </span>
                        }
                    >
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2.5">
                                <CalendarOutlined className="text-slate-400" />
                                <div>
                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">
                                        Ngày tạo nhóm
                                    </div>
                                    <div className="font-semibold">
                                        {dayjs(conversation.createdAt).format('DD/MM/YYYY')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card
                        size="small"
                        className="border-purple-500/10 bg-white/20 dark:bg-slate-950/20 rounded-xl"
                        title={
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                Thành viên ({conversation.members.length})
                            </span>
                        }
                    >
                        <div>
                            {conversation.members.map(member => (
                                <div
                                    key={member.userId}
                                    className="px-1 py-2 border-b border-purple-500/5 last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            dot
                                            status={
                                                member.user.presence === 'ONLINE'
                                                    ? 'success'
                                                    : member.user.presence === 'AWAY'
                                                      ? 'warning'
                                                      : 'default'
                                            }
                                        >
                                            <Avatar className="bg-purple-500/20 text-purple-600 border border-purple-500/10 font-bold text-xs">
                                                {(member.user.displayName || member.user.username)[0].toUpperCase()}
                                            </Avatar>
                                        </Badge>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold truncate max-w-30">
                                                    {member.user.displayName || member.user.username}
                                                </span>
                                                {member.role === 'ADMIN' ? (
                                                    <Tag
                                                        color="purple"
                                                        icon={<CrownOutlined />}
                                                        className="m-0 border-0 scale-90"
                                                    >
                                                        Admin
                                                    </Tag>
                                                ) : null}
                                            </div>
                                            <span className="text-[10px] opacity-70 block truncate">
                                                @{member.user.username}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
