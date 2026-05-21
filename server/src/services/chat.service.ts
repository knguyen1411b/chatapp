import { MessageType, PresenceStatus } from '@prisma/client'

import { prisma } from '../config/prisma'

export const setPresence = async (userId: number, presence: PresenceStatus) => {
    const result = await prisma.user.updateMany({
        where: { id: userId },
        data: { presence, lastSeenAt: presence === 'OFFLINE' ? new Date() : undefined }
    })

    return result.count > 0
}

export const searchUser = async (currentUserId: number, query: string) => {
    const q = query.trim()
    if (!q) return null
    return prisma.user.findFirst({
        where: {
            id: { not: currentUserId },
            OR: [
                { username: { equals: q, mode: 'insensitive' } },
                { email: { equals: q, mode: 'insensitive' } },
                { displayName: { equals: q, mode: 'insensitive' } }
            ]
        },
        select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            avatar: true,
            presence: true,
            lastSeenAt: true
        }
    })
}

export const ensureMember = async (conversationId: number, userId: number) => {
    const m = await prisma.conversationMember.findUnique({
        where: { conversationId_userId: { conversationId, userId } }
    })
    if (!m) throw new Error('Bạn không thuộc conversation này')
}

const messageIncludeForUser = (userId: number) => ({
    sender: {
        select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            avatar: true,
            presence: true,
            lastSeenAt: true
        }
    },
    replyTo: { select: { id: true, content: true, sender: { select: { username: true } } } },
    reactions: true,
    favorites: { where: { userId } }
})

export const createOrGetPrivateConversation = async (currentUserId: number, targetUserId: number) => {
    if (currentUserId === targetUserId) throw new Error('Không thể chat với chính mình')
    const target = await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true } })
    if (!target) throw new Error('User không tồn tại')
    const [a, b] = [currentUserId, targetUserId].sort((x, y) => x - y)
    const privateKey = `${a}:${b}`

    const existing = await prisma.conversation.findUnique({
        where: { privateKey },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            displayName: true,
                            avatar: true,
                            presence: true,
                            lastSeenAt: true
                        }
                    }
                }
            },
            pinnedBy: true,
            messages: {
                take: 1,
                orderBy: { createdAt: 'desc' },
                include: { sender: { select: { id: true, username: true } } }
            }
        }
    })
    if (existing) return { ...existing, lastMessage: existing.messages[0] ?? null }

    const conversation = await prisma.conversation.create({
        data: {
            type: 'PRIVATE',
            privateKey,
            createdBy: currentUserId,
            members: {
                create: [
                    { userId: currentUserId, role: 'ADMIN' as const },
                    { userId: targetUserId, role: 'MEMBER' as const }
                ]
            }
        },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            displayName: true,
                            avatar: true,
                            presence: true,
                            lastSeenAt: true
                        }
                    }
                }
            },
            pinnedBy: true,
            messages: true
        }
    })

    return { ...conversation, lastMessage: null }
}

export const createGroupConversation = async (currentUserId: number, name: string, identifiers: string[]) => {
    const uniqueIdentifiers = Array.from(new Set(identifiers.map(x => x.trim()).filter(Boolean)))
    if (uniqueIdentifiers.length < 2) throw new Error('Nhóm cần ít nhất 2 thành viên khác bạn')

    const users = await prisma.user.findMany({
        where: {
            OR: uniqueIdentifiers.flatMap(i => [
                { username: { equals: i, mode: 'insensitive' as const } },
                { email: { equals: i, mode: 'insensitive' as const } },
                { displayName: { equals: i, mode: 'insensitive' as const } }
            ])
        },
        select: { id: true, username: true, email: true, displayName: true }
    })

    const notFound = uniqueIdentifiers.filter(
        idn =>
            !users.some(u =>
                [u.username, u.email, u.displayName].filter(Boolean).some(v => v!.toLowerCase() === idn.toLowerCase())
            )
    )
    if (notFound.length) throw new Error(`Không tìm thấy user: ${notFound.join(', ')}`)

    const memberIds = Array.from(new Set(users.map(u => u.id).filter(id => id !== currentUserId)))
    if (memberIds.length < 2) throw new Error('Nhóm cần ít nhất 2 thành viên khác bạn')

    const c = await prisma.conversation.create({
        data: {
            type: 'GROUP',
            name,
            createdBy: currentUserId,
            members: {
                create: [
                    { userId: currentUserId, role: 'ADMIN' as const },
                    ...memberIds.map(id => ({ userId: id, role: 'MEMBER' as const }))
                ]
            }
        },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            displayName: true,
                            avatar: true,
                            presence: true,
                            lastSeenAt: true
                        }
                    }
                }
            },
            pinnedBy: true,
            messages: true
        }
    })

    return { ...c, lastMessage: null }
}

export const listMyConversations = async (currentUserId: number) => {
    const data = await prisma.conversation.findMany({
        where: { members: { some: { userId: currentUserId } } },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            displayName: true,
                            avatar: true,
                            presence: true,
                            lastSeenAt: true
                        }
                    }
                }
            },
            messages: {
                take: 1,
                orderBy: { createdAt: 'desc' },
                include: { sender: { select: { id: true, username: true } } }
            },
            pinnedBy: { where: { userId: currentUserId } }
        },
        orderBy: { updatedAt: 'desc' }
    })

    const mapped = await Promise.all(
        data.map(async c => {
            const me = c.members.find(m => m.userId === currentUserId)
            const lastReadAt = me?.lastReadAt ?? null
            const unreadCount = await prisma.message.count({
                where: {
                    conversationId: c.id,
                    senderId: { not: currentUserId },
                    ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {})
                }
            })
            return { ...c, lastMessage: c.messages[0] ?? null, isPinned: c.pinnedBy.length > 0, unreadCount }
        })
    )

    return mapped.sort(
        (a, b) => Number(b.isPinned) - Number(a.isPinned) || +new Date(b.updatedAt) - +new Date(a.updatedAt)
    )
}

export const getConversationMessages = async (
    conversationId: number,
    userId: number,
    opts?: { cursor?: number; take?: number }
) => {
    await ensureMember(conversationId, userId)
    const take = Math.min(Math.max(opts?.take ?? 50, 1), 100)
    const data = await prisma.message.findMany({
        where: { conversationId },
        ...(opts?.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
        take: take + 1,
        orderBy: { createdAt: 'desc' },
        include: messageIncludeForUser(userId)
    })
    const hasMore = data.length > take
    const list = (hasMore ? data.slice(0, take) : data).reverse()
    return {
        items: list,
        nextCursor: hasMore ? data[take - 1].id : null
    }
}

export const markConversationAsRead = async (conversationId: number, userId: number) => {
    await ensureMember(conversationId, userId)
    await prisma.conversationMember.update({
        where: { conversationId_userId: { conversationId, userId } },
        data: { lastReadAt: new Date() }
    })
    return { ok: true }
}

export const getMessageById = async (messageId: number, userId: number) => {
    const m = await prisma.message.findUnique({ where: { id: messageId }, include: messageIncludeForUser(userId) })
    if (!m) throw new Error('Không tìm thấy tin nhắn')
    await ensureMember(m.conversationId, userId)
    return m
}

export const createMessage = async (payload: {
    conversationId: number
    senderId: number
    content: string
    type?: MessageType
    replyToId?: number
    forwardedFromId?: number
}) => {
    await ensureMember(payload.conversationId, payload.senderId)

    const message = await prisma.message.create({
        data: {
            conversationId: payload.conversationId,
            senderId: payload.senderId,
            content: payload.content,
            type: payload.type ?? 'TEXT',
            replyToId: payload.replyToId,
            forwardedFromId: payload.forwardedFromId
        },
        include: messageIncludeForUser(payload.senderId)
    })

    await prisma.conversation.update({ where: { id: payload.conversationId }, data: { updatedAt: new Date() } })
    return message
}

export const editMessage = async (messageId: number, userId: number, content: string) => {
    const m = await prisma.message.findUnique({ where: { id: messageId } })
    if (!m || m.senderId !== userId || m.deletedAt) throw new Error('Không thể sửa tin nhắn')
    return prisma.message.update({
        where: { id: messageId },
        data: { content, editedAt: new Date() },
        include: messageIncludeForUser(userId)
    })
}

export const deleteMessage = async (messageId: number, userId: number) => {
    const m = await prisma.message.findUnique({ where: { id: messageId } })
    if (!m || m.senderId !== userId) throw new Error('Không thể xoá tin nhắn')
    return prisma.message.update({
        where: { id: messageId },
        data: { content: 'Message deleted', deletedAt: new Date() },
        include: messageIncludeForUser(userId)
    })
}

export const toggleReaction = async (messageId: number, userId: number, emoji: string) => {
    const message = await prisma.message.findUnique({ where: { id: messageId }, select: { conversationId: true } })
    if (!message) throw new Error('Không tìm thấy tin nhắn')
    await ensureMember(message.conversationId, userId)

    const existing = await prisma.messageReaction.findUnique({
        where: { messageId_userId_emoji: { messageId, userId, emoji } }
    })
    if (existing) {
        await prisma.messageReaction.delete({ where: { messageId_userId_emoji: { messageId, userId, emoji } } })
        return { removed: true }
    }

    await prisma.messageReaction.create({ data: { messageId, userId, emoji } })
    return { removed: false }
}

export const toggleFavoriteMessage = async (messageId: number, userId: number) => {
    const message = await prisma.message.findUnique({ where: { id: messageId }, select: { conversationId: true } })
    if (!message) throw new Error('Không tìm thấy tin nhắn')
    await ensureMember(message.conversationId, userId)

    const existing = await prisma.favoriteMessage.findUnique({ where: { messageId_userId: { messageId, userId } } })
    if (existing) {
        await prisma.favoriteMessage.delete({ where: { messageId_userId: { messageId, userId } } })
        return { removed: true }
    }
    await prisma.favoriteMessage.create({ data: { messageId, userId } })
    return { removed: false }
}

export const togglePinConversation = async (conversationId: number, userId: number) => {
    await ensureMember(conversationId, userId)
    const existing = await prisma.pinnedConversation.findUnique({
        where: { conversationId_userId: { conversationId, userId } }
    })
    if (existing) {
        await prisma.pinnedConversation.delete({ where: { conversationId_userId: { conversationId, userId } } })
        return { removed: true }
    }
    await prisma.pinnedConversation.create({ data: { conversationId, userId } })
    return { removed: false }
}
