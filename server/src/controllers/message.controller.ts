import { Request, Response } from 'express'
import { z } from 'zod'

import { createMessage } from '../services/chat.service'
import { AuthRequest } from '../types/auth'
import { getErrorMessage } from '../utils/http-error'

const emitMessage = (req: Request, room: string, event: 'message:new' | 'message:updated', payload: unknown) => {
    const io = req.app.get('io')
    if (io?.to) {
        io.to(room).emit(event, payload)
    }
}

export const createMessageController = async (req: Request, res: Response) => {
    try {
        const payload = z
            .object({
                conversationId: z.number().int().positive(),
                content: z.string().trim().min(1),
                type: z.enum(['TEXT', 'IMAGE', 'FILE', 'EMOJI']).optional(),
                replyToId: z.number().int().positive().optional(),
                forwardedFromId: z.number().int().positive().optional()
            })
            .parse(req.body)

        const userId = (req as AuthRequest).authUser!.userId
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
    } catch (e) {
        const message = getErrorMessage(e, 'Không thể gửi tin nhắn')
        if (e instanceof z.ZodError) return res.status(400).json({ message })
        if (message.includes('không thuộc conversation')) return res.status(403).json({ message })
        return res.status(500).json({ message })
    }
}
