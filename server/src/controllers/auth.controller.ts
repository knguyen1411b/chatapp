import { Request, Response } from 'express'
import { z } from 'zod'

import { UnauthorizedError } from '../core/errors'
import { asyncHandler } from '../middleware/error.middleware'
import {
    loginWithEmail,
    refreshSession,
    registerWithEmail,
    requestPasswordReset,
    resetPassword,
    revokeSession,
    verifyPasswordResetToken
} from '../services/auth.service'
import { getUserProfile } from '../services/user.service'
import { AuthRequest } from '../types/auth'
import { clearAuthCookies, getCookieOptions, setAuthCookies } from '../utils/cookie'

// Re-export cookie helpers for backward compatibility & testing
export { clearAuthCookies, getCookieOptions, setAuthCookies }

const registerSchema = z.object({
    username: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    displayName: z.string().optional()
})

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export const register = asyncHandler(async (req: Request, res: Response) => {
    const data = registerSchema.parse(req.body)
    const auth = await registerWithEmail(data)
    setAuthCookies(req, res, auth)
    return res.status(201).json({
        user: auth.user,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken
    })
})

export const login = asyncHandler(async (req: Request, res: Response) => {
    const data = loginSchema.parse(req.body)
    const auth = await loginWithEmail(data.email, data.password)
    setAuthCookies(req, res, auth)
    return res.json({
        user: auth.user,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken
    })
})

export const refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken =
        (req.body?.refreshToken as string | undefined) ??
        (req.cookies?.chat_refresh as string | undefined)

    if (!refreshToken) {
        clearAuthCookies(req, res)
        throw new UnauthorizedError('Thiếu refresh token')
    }

    try {
        const auth = await refreshSession(refreshToken)
        setAuthCookies(req, res, auth)
        return res.json({
            user: auth.user,
            accessToken: auth.accessToken,
            refreshToken: auth.refreshToken
        })
    } catch (error) {
        clearAuthCookies(req, res)
        throw error
    }
})

export const logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken =
        (req.body?.refreshToken as string | undefined) ??
        (req.cookies?.chat_refresh as string | undefined)

    await revokeSession(refreshToken)
    clearAuthCookies(req, res)
    return res.json({ message: 'Đăng xuất thành công' })
})

export const me = asyncHandler(async (req: Request, res: Response) => {
    const auth = (req as AuthRequest).authUser
    if (!auth) {
        throw new UnauthorizedError('Unauthorized')
    }

    const user = await getUserProfile(auth.userId)
    return res.json(user)
})

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const email = z.string().email().parse(req.body.email)
    const result = await requestPasswordReset(email)
    return res.json(result)
})

export const verifyResetPasswordController = asyncHandler(async (req: Request, res: Response) => {
    const payload = z
        .object({
            token: z.string().min(1),
            email: z.string().email()
        })
        .parse(req.query)

    const result = await verifyPasswordResetToken(payload.token, payload.email)
    return res.json(result)
})

export const resetPasswordController = asyncHandler(async (req: Request, res: Response) => {
    const payload = z
        .object({
            token: z.string().min(1),
            email: z.string().email(),
            newPassword: z.string().min(6)
        })
        .parse(req.body)

    const result = await resetPassword(payload.token, payload.email, payload.newPassword)
    return res.json(result)
})
