import { useEffect, useRef } from 'react'

import { Spin } from 'antd'

import { Message } from '@/shared/lib/types'

import { MessageBubble } from './MessageBubble'

export const MessageList = ({
    messages,
    currentUserId,
    onReply,
    onForward,
    onFavorite,
    onReact,
    onEdit,
    onDelete,
    onLoadMore,
    hasMore,
    loadingMore
}: {
    messages: Message[]
    currentUserId: number
    onReply: (m: Message) => void
    onForward: (m: Message) => void
    onFavorite: (id: number) => void
    onReact: (id: number, emoji: string) => void
    onEdit: (id: number) => void
    onDelete: (id: number) => void
    onLoadMore: () => void
    hasMore: boolean
    loadingMore: boolean
}) => {
    const endRef = useRef<HTMLDivElement | null>(null)
    const listRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ block: 'end' })
    }, [messages])

    const handleScroll = () => {
        if (!listRef.current || !hasMore || loadingMore) return
        if (listRef.current.scrollTop <= 40) {
            onLoadMore()
        }
    }

    return (
        <div ref={listRef} onScroll={handleScroll} className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
            <div className="space-y-3">
                {loadingMore ? (
                    <div className="flex justify-center py-2">
                        <Spin size="small" />
                    </div>
                ) : null}
                {messages.map(m => (
                    <MessageBubble
                        key={m.id}
                        message={m}
                        mine={m.senderId === currentUserId}
                        currentUserId={currentUserId}
                        onReply={onReply}
                        onForward={onForward}
                        onFavorite={onFavorite}
                        onReact={onReact}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
                <div ref={endRef} />
            </div>
        </div>
    )
}
