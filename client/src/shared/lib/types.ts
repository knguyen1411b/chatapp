export type AuthUser = {
    id: number
    username: string
    email: string
    displayName?: string | null
    avatar?: string | null
    presence?: 'ONLINE' | 'AWAY' | 'OFFLINE'
    lastSeenAt?: string | null
}

export type AuthResponse = {
    user: AuthUser
}

export type Reaction = {
    messageId: number
    userId: number
    emoji: string
}

export type Message = {
    id: number
    conversationId: number
    senderId: number
    content: string
    type: 'TEXT' | 'IMAGE' | 'FILE' | 'EMOJI'
    createdAt: string
    editedAt?: string | null
    deletedAt?: string | null
    sender: AuthUser
    replyTo?: { id: number; content: string; sender: { username: string } } | null
    reactions?: Reaction[]
    favorites?: Array<{ userId: number }>
}

export type Conversation = {
    id: number
    type: 'PRIVATE' | 'GROUP'
    name?: string | null
    createdAt: string
    updatedAt: string
    isPinned?: boolean
    unreadCount?: number
    members: Array<{ userId: number; role: 'ADMIN' | 'MEMBER'; user: AuthUser }>
    lastMessage?: Message | null
}

export type PaginatedMessages = {
    items: Message[]
    nextCursor: number | null
}
