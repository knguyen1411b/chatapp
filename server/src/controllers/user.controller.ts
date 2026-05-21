import { Response } from 'express'
import { z } from 'zod'

import { prisma } from '../config/prisma'
import { searchUser } from '../services/chat.service'
import { AuthRequest } from '../types/auth'
import { getErrorMessage } from '../utils/http-error'

export const searchUsersController = async (req: AuthRequest, res: Response) => {
    try {
        const query = z
            .string()
            .trim()
            .min(1)
            .parse(req.query.query ?? '')
        const user = await searchUser(req.authUser!.userId, query)
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy user' })
        }

        return res.json(user)
    } catch (error) {
        return res.status(400).json({ message: getErrorMessage(error, 'Query không hợp lệ') })
    }
}

const userSelect = {
    id: true,
    username: true,
    email: true,
    displayName: true,
    avatar: true,
    presence: true,
    lastSeenAt: true,
    createdAt: true
}

export const getMeController = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.authUser?.userId
        if (!userId) return res.status(401).json({ message: 'Unauthorized' })

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: userSelect
        })
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' })
        return res.json(user)
    } catch (error) {
        return res.status(400).json({ message: getErrorMessage(error, 'Không tải được thông tin cá nhân') })
    }
}

export const updateMeController = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.authUser?.userId
        if (!userId) return res.status(401).json({ message: 'Unauthorized' })

        const payload = z
            .object({
                displayName: z.string().trim().min(1).max(80).optional(),
                avatar: z.string().trim().url().nullable().optional()
            })
            .refine(data => typeof data.displayName !== 'undefined' || typeof data.avatar !== 'undefined', {
                message: 'Không có dữ liệu cần cập nhật'
            })
            .parse(req.body)

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                displayName: payload.displayName,
                avatar: payload.avatar
            },
            select: userSelect
        })

        return res.json(user)
    } catch (error) {
        return res.status(400).json({ message: getErrorMessage(error, 'Cập nhật thông tin thất bại') })
    }
}

export const deleteAvatarController = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.authUser?.userId
        if (!userId) return res.status(401).json({ message: 'Unauthorized' })

        const user = await prisma.user.update({
            where: { id: userId },
            data: { avatar: null },
            select: userSelect
        })
        return res.json(user)
    } catch (error) {
        return res.status(400).json({ message: getErrorMessage(error, 'Xóa avatar thất bại') })
    }
}
