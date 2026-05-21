import { Request, Response } from 'express'
import { z } from 'zod'

import {
    createGroupConversation,
    createOrGetPrivateConversation,
    deleteMessage,
    editMessage,
    getConversationMessages,
    getMessageById,
    listMyConversations,
    markConversationAsRead,
    toggleFavoriteMessage,
    togglePinConversation,
    toggleReaction
} from '../services/chat.service'
import { AuthRequest } from '../types/auth'
import { getErrorMessage } from '../utils/http-error'

const uid = (req: AuthRequest) => req.authUser!.userId
const emitMessageUpdated = (req: AuthRequest, conversationId: number, payload: unknown) => {
    const io = req.app.get('io')
    if (io?.to) {
        io.to(`conversation:${conversationId}`).emit('message:updated', payload)
    }
}

export const createPrivateConversationController = async (req: AuthRequest, res: Response) => {
    try {
        const payload = z.object({ targetUserId: z.number().int().positive() }).parse(req.body)
        return res.status(201).json(await createOrGetPrivateConversation(uid(req), payload.targetUserId))
    } catch (e) {
        const message = getErrorMessage(e, 'Không thể tạo cuộc trò chuyện')
        if (e instanceof z.ZodError) return res.status(400).json({ message })
        return res.status(400).json({ message })
    }
}

export const createGroupConversationController = async (req: AuthRequest, res: Response) => {
    try {
        const payload = z
            .object({ name: z.string().trim().min(1), members: z.array(z.string().trim().min(1)) })
            .parse(req.body)
        return res.status(201).json(await createGroupConversation(uid(req), payload.name, payload.members))
    } catch (e) {
        const message = getErrorMessage(e, 'Không thể tạo nhóm')
        if (e instanceof z.ZodError) return res.status(400).json({ message })
        return res.status(400).json({ message })
    }
}

export const getMyConversationsController = async (req: AuthRequest, res: Response) =>
    res.json(await listMyConversations(uid(req)))

export const getConversationMessagesController = async (req: AuthRequest, res: Response) => {
    try {
        const conversationId = z.coerce.number().int().positive().parse(req.params.id)
        const query = z
            .object({
                cursor: z.coerce.number().int().positive().optional(),
                take: z.coerce.number().int().positive().max(100).optional()
            })
            .parse(req.query)
        return res.json(await getConversationMessages(conversationId, uid(req), query))
    } catch (e) {
        const message = getErrorMessage(e, 'Không thể lấy tin nhắn')
        if (e instanceof z.ZodError) return res.status(400).json({ message })
        return res.status(403).json({ message })
    }
}

export const markConversationAsReadController = async (req: AuthRequest, res: Response) => {
    try {
        const conversationId = z.coerce.number().int().positive().parse(req.params.id)
        return res.json(await markConversationAsRead(conversationId, uid(req)))
    } catch (e) {
        const message = getErrorMessage(e, 'Không thể đánh dấu đã đọc')
        if (e instanceof z.ZodError) return res.status(400).json({ message })
        return res.status(403).json({ message })
    }
}

export const togglePinConversationController = async (req: AuthRequest, res: Response) => {
    try {
        const conversationId = z.coerce.number().int().positive().parse(req.params.id)
        return res.json(await togglePinConversation(conversationId, uid(req)))
    } catch (e) {
        const message = getErrorMessage(e, 'Không thể ghim cuộc trò chuyện')
        if (e instanceof z.ZodError) return res.status(400).json({ message })
        return res.status(403).json({ message })
    }
}

export const toggleFavoriteMessageController = async (req: AuthRequest, res: Response) => {
    try {
        const messageId = z.coerce.number().int().positive().parse(req.params.id)
        const result = await toggleFavoriteMessage(messageId, uid(req))
        const updated = await getMessageById(messageId, uid(req))
        emitMessageUpdated(req, updated.conversationId, updated)
        return res.json(result)
    } catch (e) {
        const message = getErrorMessage(e, 'Không thể lưu tin nhắn')
        if (e instanceof z.ZodError) return res.status(400).json({ message })
        return res.status(403).json({ message })
    }
}

export const toggleReactionController = async (req: AuthRequest, res: Response) => {
    try {
        const emoji = z.string().min(1).parse(req.body.emoji)
        const messageId = z.coerce.number().int().positive().parse(req.params.id)
        const result = await toggleReaction(messageId, uid(req), emoji)
        const updated = await getMessageById(messageId, uid(req))
        emitMessageUpdated(req, updated.conversationId, updated)
        return res.json(result)
    } catch (e) {
        const message = getErrorMessage(e, 'Không thể thả cảm xúc')
        if (e instanceof z.ZodError) return res.status(400).json({ message })
        return res.status(403).json({ message })
    }
}

export const editMessageController = async (req: AuthRequest, res: Response) => {
    try {
        const content = z.string().trim().min(1).parse(req.body.content)
        const messageId = z.coerce.number().int().positive().parse(req.params.id)
        const updated = await editMessage(messageId, uid(req), content)
        emitMessageUpdated(req, updated.conversationId, updated)
        return res.json(updated)
    } catch (e) {
        const message = getErrorMessage(e, 'Không thể sửa tin nhắn')
        if (e instanceof z.ZodError) return res.status(400).json({ message })
        return res.status(403).json({ message })
    }
}

export const deleteMessageController = async (req: AuthRequest, res: Response) => {
    try {
        const messageId = z.coerce.number().int().positive().parse(req.params.id)
        const updated = await deleteMessage(messageId, uid(req))
        emitMessageUpdated(req, updated.conversationId, updated)
        return res.json(updated)
    } catch (e) {
        const message = getErrorMessage(e, 'Không thể xoá tin nhắn')
        if (e instanceof z.ZodError) return res.status(400).json({ message })
        return res.status(403).json({ message })
    }
}
