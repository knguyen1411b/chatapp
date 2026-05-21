import { Alert } from 'antd'

import { Conversation, Message } from '@/shared/lib/types'

import { ChatHeader } from './ChatHeader'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'
import { MessageComposer } from './MessageComposer'
import { MessageList } from './MessageList'

export const ChatWindow = ({
    conversation,
    currentUserId,
    messages,
    messagesNextCursor,
    loadingMoreMessages,
    loadingMessages,
    typingText,
    text,
    onTextChange,
    onSend,
    sending,
    uploading,
    onSendFiles,
    replyTo,
    onCancelReply,
    onReply,
    onForward,
    onFavorite,
    onReact,
    onEdit,
    onDelete,
    onLoadMoreMessages,
    onBack,
    socketConnected
}: {
    conversation: Conversation | null
    currentUserId: number
    messages: Message[]
    messagesNextCursor: number | null
    loadingMoreMessages: boolean
    loadingMessages: boolean
    typingText: string
    text: string
    onTextChange: (v: string) => void
    onSend: () => void
    sending: boolean
    uploading: boolean
    onSendFiles: (files: File[]) => void
    replyTo: Message | null
    onCancelReply: () => void
    onReply: (m: Message) => void
    onForward: (m: Message) => void
    onFavorite: (id: number) => void
    onReact: (id: number, emoji: string) => void
    onEdit: (id: number) => void
    onDelete: (id: number) => void
    onLoadMoreMessages: () => void
    onBack?: () => void
    socketConnected: boolean
}) => {
    if (!conversation) {
        return (
            <EmptyState
                title="Chưa có cuộc trò chuyện"
                description="Tìm người dùng hoặc tạo nhóm để bắt đầu trò chuyện"
            />
        )
    }

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <ChatHeader conversation={conversation} currentUserId={currentUserId} onBack={onBack} />
            {!socketConnected ? (
                <Alert
                    type="warning"
                    showIcon
                    banner
                    title="Socket đang reconnect…"
                    className="rounded-none! border-x-0 border-t-0"
                />
            ) : null}
            {loadingMessages ? (
                <LoadingState label="Đang tải tin nhắn…" />
            ) : (
                <>
                    <MessageList
                        messages={messages}
                        currentUserId={currentUserId}
                        onReply={onReply}
                        onForward={onForward}
                        onFavorite={onFavorite}
                        onReact={onReact}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onLoadMore={onLoadMoreMessages}
                        hasMore={Boolean(messagesNextCursor)}
                        loadingMore={loadingMoreMessages}
                    />
                    <MessageComposer
                        text={text}
                        onChange={onTextChange}
                        onSend={onSend}
                        loading={sending}
                        uploading={uploading}
                        onSendFiles={onSendFiles}
                        replyTo={replyTo}
                        onCancelReply={onCancelReply}
                        typingText={typingText}
                    />
                </>
            )}
        </div>
    )
}
