import { Response } from 'express'
import { z } from 'zod'

import { NotFoundError, UnauthorizedError } from '../core/errors'
import { asyncHandler } from '../middleware/error.middleware'
import {
    deleteUserAvatar,
    getUserProfile,
    searchUser,
    updateUserProfile
} from '../services/user.service'
import { AuthRequest } from '../types/auth'

const updateProfileSchema = z
    .object({
        displayName: z.string().trim().min(1).max(80).optional(),
        avatar: z.string().trim().url().nullable().optional()
    })
    .refine(data => typeof data.displayName !== 'undefined' || typeof data.avatar !== 'undefined', {
        message: 'Không có dữ liệu cần cập nhật'
    })

export const searchUsersController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.authUser?.userId
    if (!userId) throw new UnauthorizedError('Unauthorized')

    const query = z
        .string()
        .trim()
        .min(1)
        .parse(req.query.query ?? '')

    const user = await searchUser(userId, query)
    if (!user) {
        throw new NotFoundError('Không tìm thấy user')
    }

    return res.json(user)
})

export const getMeController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.authUser?.userId
    if (!userId) throw new UnauthorizedError('Unauthorized')

    const user = await getUserProfile(userId)
    return res.json(user)
})

export const updateMeController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.authUser?.userId
    if (!userId) throw new UnauthorizedError('Unauthorized')

    const payload = updateProfileSchema.parse(req.body)
    const user = await updateUserProfile(userId, payload)
    return res.json(user)
})

export const deleteAvatarController = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.authUser?.userId
    if (!userId) throw new UnauthorizedError('Unauthorized')

    const user = await deleteUserAvatar(userId)
    return res.json(user)
})
