import { Request, Response } from 'express'
import { z } from 'zod'

import { UnauthorizedError } from '../core/errors'
import { asyncHandler } from '../middleware/error.middleware'
import { createMessage } from '../services/message.service'
import { AuthRequest } from '../types/auth'

const emitMessage = (req: Request, room: string, event: 'message:new' | 'message:updated', payload: unknown) => {
    const io = req.app.get('io')
    if (io?.to) {
        io.to(room).emit(event, payload)
    }
}

const createMessageSchema = z.object({
    conversationId: z.number().int().positive(),
    content: z.string().trim().min(1),
    type: z.enum(['TEXT', 'IMAGE', 'FILE', 'EMOJI']).optional(),
    replyToId: z.number().int().positive().optional(),
    forwardedFromId: z.number().int().positive().optional()
})

export const createMessageController = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).authUser?.userId
    if (!userId) throw new UnauthorizedError('Unauthorized')

    const payload = createMessageSchema.parse(req.body)

    const message = await createMessage({
        conversationId: payload.conversationId,
        senderId: userId,
        content: payload.content,
        type: payload.type,
        replyToId: payload.replyToId,
        forwardedFromId: payload.forwardedFromId
    })

    emitMessage(req, `conversation:${payload.conversationId}`, 'message:new', message)
    return res.status(201).json(message)
})
