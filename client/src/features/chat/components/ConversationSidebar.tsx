import { DownOutlined, LogoutOutlined, PlusOutlined } from '@ant-design/icons'
import { Avatar, Badge, Button, Card, Dropdown, Empty, Input, Select, Tag, Typography } from 'antd'

import { ThemeToggle } from '@/features/theme'
import { AuthUser, Conversation } from '@/shared/lib/types'

import { ConversationItem } from './ConversationItem'

export const ConversationSidebar = ({
    currentUser,
    searchQuery,
    setSearchQuery,
    onSearch,
    searchResult,
    searchError,
    startPrivateLoading,
    onStartChat,
    conversations,
    selectedConversationId,
    onSelectConversation,
    onTogglePin,
    onOpenGroup,
    onOpenProfile,
    onLogout,
    currentPresence,
    onPresenceChange
}: {
    currentUser: AuthUser | null
    searchQuery: string
    setSearchQuery: (v: string) => void
    onSearch: (v: string) => void
    searchResult: AuthUser | undefined
    searchError: string
    startPrivateLoading: boolean
    onStartChat: () => void
    conversations: Conversation[]
    selectedConversationId: number | null
    onSelectConversation: (c: Conversation) => void
    onTogglePin: (conversationId: number) => void
    onOpenGroup: () => void
    onOpenProfile: () => void
    onLogout: () => void
    currentPresence: 'ONLINE' | 'AWAY' | 'OFFLINE'
    onPresenceChange: (value: 'ONLINE' | 'AWAY' | 'OFFLINE') => void
}) => {
    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-black/5 dark:bg-black/20">
            <Card
                variant="borderless"
                className="rounded-none! rounded-b-2xl! border-b border-purple-500/10 dark:border-white/5 bg-white/5 dark:bg-black/10 backdrop-blur-md"
                styles={{ body: { padding: '16px 14px' } }}
            >
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <Badge
                            dot
                            status={
                                currentUser?.presence === 'ONLINE'
                                    ? 'success'
                                    : currentUser?.presence === 'AWAY'
                                      ? 'warning'
                                      : 'default'
                            }
                            className="scale-110"
                        >
                            <Avatar
                                src={currentUser?.avatar || undefined}
                                className="shrink-0 bg-purple-600 border border-purple-400/20 shadow-md"
                            >
                                {(currentUser?.displayName || currentUser?.username || 'U')[0]}
                            </Avatar>
                        </Badge>
                        <div className="min-w-0 overflow-hidden">
                            <Typography.Text strong className="block truncate text-sm tracking-wide font-bold">
                                {currentUser?.displayName || currentUser?.username}
                            </Typography.Text>
                            <Typography.Text type="secondary" className="block truncate text-xs font-medium opacity-80">
                                {currentUser?.email}
                            </Typography.Text>
                        </div>
                    </div>
                    <Dropdown
                        trigger={['click']}
                        menu={{
                            items: [
                                { key: 'profile', label: 'Trang cá nhân', onClick: onOpenProfile },
                                { type: 'divider' },
                                { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: onLogout }
                            ]
                        }}
                    >
                        <Button
                            size="small"
                            type="text"
                            className="hover:bg-purple-500/10 rounded-lg p-1 shrink-0"
                            icon={<DownOutlined />}
                            aria-label="Mở menu tài khoản"
                        />
                    </Dropdown>
                </div>
                <div className="mb-3 flex items-center justify-between gap-2">
                    <ThemeToggle />
                    <Select
                        size="small"
                        value={currentPresence}
                        onChange={onPresenceChange}
                        options={[
                            { value: 'ONLINE', label: 'Trực tuyến' },
                            { value: 'AWAY', label: 'Vắng mặt' },
                            { value: 'OFFLINE', label: 'Ngoại tuyến' }
                        ]}
                        classNames={{
                            popup: {
                                root: 'rounded-xl! border border-purple-500/10'
                            }
                        }}
                        style={{ width: 120 }}
                        className="rounded-2xl! text-xs"
                    />
                </div>
                <Input.Search
                    aria-label="Tìm user để bắt đầu chat"
                    placeholder="Tìm người dùng..."
                    enterButton="Tìm"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onSearch={onSearch}
                    className="rounded-3xl!"
                />
                {searchResult && (
                    <Card
                        size="small"
                        className="mt-3 rounded-xl border border-purple-500/15 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-lg"
                        styles={{ body: { padding: 12 } }}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                                <Typography.Text strong className="block truncate text-sm font-semibold">
                                    {searchResult.displayName || searchResult.username}
                                </Typography.Text>
                                <Typography.Text type="secondary" className="truncate text-xs">
                                    {searchResult.email}
                                </Typography.Text>
                            </div>
                            <Tag color="purple" className="m-0 border-0 rounded-full font-bold">
                                Tìm thấy
                            </Tag>
                        </div>
                        <Button
                            type="primary"
                            size="small"
                            className="mt-3 h-8 bg-purple-600 hover:bg-purple-500 border-0 rounded-lg text-xs font-semibold"
                            loading={startPrivateLoading}
                            onClick={onStartChat}
                        >
                            Bắt đầu chat
                        </Button>
                    </Card>
                )}
                {searchError && (
                    <p aria-live="polite" className="mt-2 text-xs text-red-400 font-medium">
                        {searchError}
                    </p>
                )}
                <Button
                    className="hover-glow mt-3 h-10 bg-linear-to-r from-purple-600 to-indigo-600 border-0 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold flex items-center justify-center rounded-xl shadow-md transition-all text-xs"
                    block
                    icon={<PlusOutlined />}
                    onClick={onOpenGroup}
                >
                    Tạo nhóm mới
                </Button>
            </Card>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
                {conversations.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={<span className="text-xs text-slate-400">Chưa có cuộc trò chuyện</span>}
                    />
                ) : (
                    conversations.map(item => (
                        <ConversationItem
                            key={item.id}
                            conversation={item}
                            currentUserId={currentUser?.id ?? 0}
                            active={selectedConversationId === item.id}
                            onClick={() => onSelectConversation(item)}
                            onTogglePin={() => onTogglePin(item.id)}
                        />
                    ))
                )}
            </div>
        </div>
    )
}
