import { Response } from 'express'
import { z } from 'zod'

import { UnauthorizedError } from '../core/errors'
import { asyncHandler } from '../middleware/error.middleware'
import {
    createGroupConversation,
    createOrGetPrivateConversation,
    listMyConversations,
    markConversationAsRead,
    togglePinConversation
} from '../services/conversation.service'
import {
    deleteMessage,
    editMessage,
    getConversationMessages,
    getMessageById,
    toggleFavoriteMessage,
    toggleReaction
} from '../services/message.service'
import { AuthRequest } from '../types/auth'

const uid = (req: AuthRequest): number => {
    const id = req.authUser?.userId
    if (!id) throw new UnauthorizedError('Unauthorized')
    return id
}

const emitMessageUpdated = (req: AuthRequest, conversationId: number, payload: unknown) => {
    const io = req.app.get('io')
    if (io?.to) {
        io.to(`conversation:${conversationId}`).emit('message:updated', payload)
    }
}

export const createPrivateConversationController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const payload = z.object({ targetUserId: z.number().int().positive() }).parse(req.body)
    const result = await createOrGetPrivateConversation(uid(req), payload.targetUserId)
    return res.status(201).json(result)
})

export const createGroupConversationController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const payload = z
        .object({
            name: z.string().trim().min(1),
            members: z.array(z.string().trim().min(1))
        })
        .parse(req.body)

    const result = await createGroupConversation(uid(req), payload.name, payload.members)
    return res.status(201).json(result)
})

export const getMyConversationsController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await listMyConversations(uid(req))
    return res.json(result)
})

export const getConversationMessagesController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const conversationId = z.coerce.number().int().positive().parse(req.params.id)
    const query = z
        .object({
            cursor: z.coerce.number().int().positive().optional(),
            take: z.coerce.number().int().positive().max(100).optional()
        })
        .parse(req.query)

    const result = await getConversationMessages(conversationId, uid(req), query)
    return res.json(result)
})

export const markConversationAsReadController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const conversationId = z.coerce.number().int().positive().parse(req.params.id)
    const result = await markConversationAsRead(conversationId, uid(req))
    return res.json(result)
})

export const togglePinConversationController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const conversationId = z.coerce.number().int().positive().parse(req.params.id)
    const result = await togglePinConversation(conversationId, uid(req))
    return res.json(result)
})

export const toggleFavoriteMessageController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const messageId = z.coerce.number().int().positive().parse(req.params.id)
    const userId = uid(req)
    const result = await toggleFavoriteMessage(messageId, userId)
    const updated = await getMessageById(messageId, userId)
    emitMessageUpdated(req, updated.conversationId, updated)
    return res.json(result)
})

export const toggleReactionController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const emoji = z.string().min(1).parse(req.body.emoji)
    const messageId = z.coerce.number().int().positive().parse(req.params.id)
    const userId = uid(req)
    const result = await toggleReaction(messageId, userId, emoji)
    const updated = await getMessageById(messageId, userId)
    emitMessageUpdated(req, updated.conversationId, updated)
    return res.json(result)
})

export const editMessageController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const content = z.string().trim().min(1).parse(req.body.content)
    const messageId = z.coerce.number().int().positive().parse(req.params.id)
    const userId = uid(req)
    const updated = await editMessage(messageId, userId, content)
    emitMessageUpdated(req, updated.conversationId, updated)
    return res.json(updated)
})

export const deleteMessageController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const messageId = z.coerce.number().int().positive().parse(req.params.id)
    const userId = uid(req)
    const updated = await deleteMessage(messageId, userId)
    emitMessageUpdated(req, updated.conversationId, updated)
    return res.json(updated)
})
