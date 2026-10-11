import { MessageType } from '@prisma/client'
import { PAGINATION } from '../core/constants'
import { BadRequestError, ForbiddenError, NotFoundError } from '../core/errors'
import { conversationRepository } from '../repositories/conversation.repository'
import { messageRepository } from '../repositories/message.repository'
import { ensureMember } from './conversation.service'

export const getConversationMessages = async (
    conversationId: number,
    userId: number,
    opts?: { cursor?: number; take?: number }
) => {
    await ensureMember(conversationId, userId)
    const take = Math.min(
        Math.max(opts?.take ?? PAGINATION.DEFAULT_PAGE_SIZE, PAGINATION.MIN_PAGE_SIZE),
        PAGINATION.MAX_PAGE_SIZE
    )

    const data = await messageRepository.findManyByConversation(conversationId, userId, {
        cursor: opts?.cursor,
        take
    })

    const hasMore = data.length > take
    const list = (hasMore ? data.slice(0, take) : data).reverse()

    return {
        items: list,
        nextCursor: hasMore ? data[take - 1].id : null
    }
}

export const getMessageById = async (messageId: number, userId: number) => {
    const m = await messageRepository.findById(messageId, userId)
    if (!m) {
        throw new NotFoundError('Không tìm thấy tin nhắn')
    }
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

    const message = await messageRepository.create({
        conversationId: payload.conversationId,
        senderId: payload.senderId,
        content: payload.content,
        type: payload.type ?? 'TEXT',
        replyToId: payload.replyToId,
        forwardedFromId: payload.forwardedFromId
    })

    await conversationRepository.touchUpdatedAt(payload.conversationId)
    return message
}

export const editMessage = async (messageId: number, userId: number, content: string) => {
    const m = await messageRepository.findRawById(messageId)
    if (!m || m.senderId !== userId || m.deletedAt) {
        throw new BadRequestError('Không thể sửa tin nhắn')
    }

    return messageRepository.updateContent(messageId, content, userId)
}

export const deleteMessage = async (messageId: number, userId: number) => {
    const m = await messageRepository.findRawById(messageId)
    if (!m || m.senderId !== userId) {
        throw new BadRequestError('Không thể xoá tin nhắn')
    }

    return messageRepository.softDelete(messageId, userId)
}

export const toggleReaction = async (messageId: number, userId: number, emoji: string) => {
    const message = await messageRepository.findRawById(messageId)
    if (!message) {
        throw new NotFoundError('Không tìm thấy tin nhắn')
    }
    await ensureMember(message.conversationId, userId)

    const existing = await messageRepository.findReaction(messageId, userId, emoji)
    if (existing) {
        await messageRepository.deleteReaction(messageId, userId, emoji)
        return { removed: true }
    }

    await messageRepository.createReaction(messageId, userId, emoji)
    return { removed: false }
}

export const toggleFavoriteMessage = async (messageId: number, userId: number) => {
    const message = await messageRepository.findRawById(messageId)
    if (!message) {
        throw new NotFoundError('Không tìm thấy tin nhắn')
    }
    await ensureMember(message.conversationId, userId)

    const existing = await messageRepository.findFavorite(messageId, userId)
    if (existing) {
        await messageRepository.deleteFavorite(messageId, userId)
        return { removed: true }
    }

    await messageRepository.createFavorite(messageId, userId)
    return { removed: false }
}
