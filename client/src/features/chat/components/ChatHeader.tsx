import { ArrowLeftOutlined, EllipsisOutlined } from '@ant-design/icons'
import { Avatar, Badge, Button, Card, Dropdown, Space, Typography } from 'antd'

import { formatLastSeen } from '@/shared/lib/format'
import { Conversation } from '@/shared/lib/types'

export const ChatHeader = ({
    conversation,
    currentUserId,
    onBack
}: {
    conversation: Conversation
    currentUserId: number
    onBack?: () => void
}) => {
    const other = conversation.members.find(m => m.userId !== currentUserId)?.user
    const title =
        conversation.type === 'GROUP' ? conversation.name || 'Nhóm' : other?.displayName || other?.username || 'Private'
    const subtitle =
        conversation.type === 'GROUP'
            ? `${conversation.members.length} thành viên`
            : other?.presence === 'ONLINE'
              ? 'Đang hoạt động'
              : other?.presence === 'AWAY'
                ? 'Đang vắng'
                : other?.lastSeenAt
                  ? `Hoạt động ${formatLastSeen(other.lastSeenAt)}`
                  : 'Offline'

    return (
        <Card
            variant="borderless"
            className="rounded-none! border-b border-purple-500/10 dark:border-white/5 bg-white/5 dark:bg-black/10 backdrop-blur-md"
            styles={{ body: { padding: '16px 20px' } }}
        >
            <div className="flex items-center justify-between gap-3">
                <Space size={14}>
                    {onBack ? (
                        <Button
                            aria-label="Quay lại danh sách trò chuyện"
                            size="middle"
                            className="rounded-xl border-purple-500/10 dark:border-white/10 hover:bg-purple-500/10 hover:text-purple-400"
                            icon={<ArrowLeftOutlined />}
                            onClick={onBack}
                        />
                    ) : null}
                    <Badge
                        dot
                        status={
                            other?.presence === 'ONLINE'
                                ? 'success'
                                : other?.presence === 'AWAY'
                                  ? 'warning'
                                  : 'default'
                        }
                        className="scale-120"
                    >
                        <Avatar className="bg-purple-600 text-white font-bold border border-purple-400/20 shadow-md">
                            {title[0]}
                        </Avatar>
                    </Badge>
                    <div className="min-w-0">
                        <Typography.Text strong className="block truncate text-sm tracking-wide font-bold">
                            {title}
                        </Typography.Text>
                        <Typography.Text type="secondary" className="block truncate text-xs font-medium opacity-80">
                            {subtitle}
                        </Typography.Text>
                    </div>
                </Space>
                <Dropdown
                    menu={{ items: [{ key: 'info', label: 'Thông tin cuộc trò chuyện' }] }}
                    className="rounded-xl border border-purple-500/10"
                >
                    <Button
                        aria-label="Mở menu cuộc trò chuyện"
                        className="rounded-xl border-purple-500/10 dark:border-white/10 hover:bg-purple-500/10"
                        icon={<EllipsisOutlined />}
                    />
                </Dropdown>
            </div>
        </Card>
    )
}
