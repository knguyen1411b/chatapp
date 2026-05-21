import { Request, Response } from 'express'
import { z } from 'zod'

import { prisma } from '../config/prisma'
import {
    loginWithEmail,
    refreshSession,
    registerWithEmail,
    requestPasswordReset,
    resetPassword,
    revokeSession,
    verifyPasswordResetToken
} from '../services/auth.service'
import { AuthRequest } from '../types/auth'

const registerSchema = z.object({
    username: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    displayName: z.string().optional()
})
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) })
const isProduction = process.env.NODE_ENV === 'production'
const cookieOptions = {
    httpOnly: true,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    secure: isProduction,
    path: '/'
}

const setAuthCookies = (res: Response, payload: { accessToken: string; refreshToken: string }) => {
    res.cookie('chat_access', payload.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
    res.cookie('chat_refresh', payload.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
}

const clearAuthCookies = (res: Response) => {
    res.clearCookie('chat_access', cookieOptions)
    res.clearCookie('chat_refresh', cookieOptions)
}

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Request failed')

export const register = async (req: Request, res: Response) => {
    try {
        const data = registerSchema.parse(req.body)
        const auth = await registerWithEmail(data)
        setAuthCookies(res, auth)
        res.status(201).json({ user: auth.user })
    } catch (e) {
        res.status(400).json({ message: errorMessage(e) })
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const data = loginSchema.parse(req.body)
        const auth = await loginWithEmail(data.email, data.password)
        setAuthCookies(res, auth)
        res.json({ user: auth.user })
    } catch (e) {
        res.status(400).json({ message: errorMessage(e) })
    }
}

export const refresh = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies?.chat_refresh as string | undefined
        if (!refreshToken) return res.status(401).json({ message: 'Thiếu refresh token' })
        const auth = await refreshSession(refreshToken)
        setAuthCookies(res, auth)
        res.json({ user: auth.user })
    } catch (e) {
        clearAuthCookies(res)
        res.status(401).json({ message: errorMessage(e) })
    }
}

export const logout = async (req: Request, res: Response) => {
    await revokeSession(req.cookies?.chat_refresh as string | undefined)
    clearAuthCookies(res)
    res.json({ message: 'Đăng xuất thành công' })
}

export const me = async (req: Request, res: Response) => {
    try {
        const auth = (req as AuthRequest).authUser
        if (!auth) return res.status(401).json({ message: 'Unauthorized' })
        const user = await prisma.user.findUnique({
            where: { id: auth.userId },
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
        if (!user) return res.status(401).json({ message: 'Unauthorized' })
        res.json(user)
    } catch (e) {
        res.status(401).json({ message: errorMessage(e) })
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        res.json(await requestPasswordReset(z.string().email().parse(req.body.email)))
    } catch (e) {
        res.status(400).json({ message: errorMessage(e) })
    }
}

export const verifyResetPasswordController = async (req: Request, res: Response) => {
    try {
        const payload = z
            .object({
                token: z.string().min(1),
                email: z.string().email()
            })
            .parse(req.query)
        res.json(await verifyPasswordResetToken(payload.token, payload.email))
    } catch (e) {
        res.status(400).json({ message: errorMessage(e) })
    }
}

export const resetPasswordController = async (req: Request, res: Response) => {
    try {
        const payload = z
            .object({ token: z.string().min(1), email: z.string().email(), newPassword: z.string().min(6) })
            .parse(req.body)
        res.json(await resetPassword(payload.token, payload.email, payload.newPassword))
    } catch (e) {
        res.status(400).json({ message: errorMessage(e) })
    }
}
