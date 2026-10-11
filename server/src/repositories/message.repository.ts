import { MessageType } from '@prisma/client'
import { prisma } from '../config/prisma'

export const messageIncludeForUser = (userId: number) => ({
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
    replyTo: {
        select: {
            id: true,
            content: true,
            sender: { select: { username: true } }
        }
    },
    reactions: true,
    favorites: { where: { userId } }
})

export class MessageRepository {
    async findManyByConversation(
        conversationId: number,
        userId: number,
        opts?: { cursor?: number; take?: number }
    ) {
        const take = Math.min(Math.max(opts?.take ?? 50, 1), 100)
        return prisma.message.findMany({
            where: { conversationId },
            ...(opts?.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
            take: take + 1,
            orderBy: { createdAt: 'desc' },
            include: messageIncludeForUser(userId)
        })
    }

    async findById(messageId: number, userId: number) {
        return prisma.message.findUnique({
            where: { id: messageId },
            include: messageIncludeForUser(userId)
        })
    }

    async findRawById(messageId: number) {
        return prisma.message.findUnique({
            where: { id: messageId },
            select: {
                id: true,
                senderId: true,
                conversationId: true,
                deletedAt: true
            }
        })
    }

    async create(payload: {
        conversationId: number
        senderId: number
        content: string
        type?: MessageType
        replyToId?: number
        forwardedFromId?: number
    }) {
        return prisma.message.create({
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
    }

    async updateContent(messageId: number, content: string, userId: number) {
        return prisma.message.update({
            where: { id: messageId },
            data: {
                content,
                editedAt: new Date()
            },
            include: messageIncludeForUser(userId)
        })
    }

    async softDelete(messageId: number, userId: number) {
        return prisma.message.update({
            where: { id: messageId },
            data: {
                content: 'Message deleted',
                deletedAt: new Date()
            },
            include: messageIncludeForUser(userId)
        })
    }

    async findReaction(messageId: number, userId: number, emoji: string) {
        return prisma.messageReaction.findUnique({
            where: {
                messageId_userId_emoji: {
                    messageId,
                    userId,
                    emoji
                }
            }
        })
    }

    async createReaction(messageId: number, userId: number, emoji: string) {
        return prisma.messageReaction.create({
            data: { messageId, userId, emoji }
        })
    }

    async deleteReaction(messageId: number, userId: number, emoji: string) {
        return prisma.messageReaction.delete({
            where: {
                messageId_userId_emoji: {
                    messageId,
                    userId,
                    emoji
                }
            }
        })
    }

    async findFavorite(messageId: number, userId: number) {
        return prisma.favoriteMessage.findUnique({
            where: {
                messageId_userId: {
                    messageId,
                    userId
                }
            }
        })
    }

    async createFavorite(messageId: number, userId: number) {
        return prisma.favoriteMessage.create({
            data: { messageId, userId }
        })
    }

    async deleteFavorite(messageId: number, userId: number) {
        return prisma.favoriteMessage.delete({
            where: {
                messageId_userId: {
                    messageId,
                    userId
                }
            }
        })
    }
}

export const messageRepository = new MessageRepository()
