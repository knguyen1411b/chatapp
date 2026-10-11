import { Router } from 'express'

import { env } from '../config/env'
import passport from '../config/passport'
import {
    forgotPassword,
    login,
    logout,
    me,
    refresh,
    register,
    resetPasswordController,
    setAuthCookies,
    verifyResetPasswordController
} from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth.middleware'

export const authRouter = Router()
authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/refresh', refresh)
authRouter.post('/logout', logout)
authRouter.get('/me', authMiddleware as any, me as any)
authRouter.post('/forgot-password', forgotPassword)
authRouter.get('/reset-password/verify', verifyResetPasswordController)
authRouter.post('/reset-password', resetPasswordController)

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))
authRouter.get('/github', passport.authenticate('github', { session: false }))

authRouter.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${env.clientUrl}/login` }),
    (req, res) => {
        const auth = req.user as {
            accessToken: string
            refreshToken: string
            user: { id: number; email: string; username: string; displayName?: string | null; avatar?: string | null }
        }
        setAuthCookies(req, res, auth)
        const targetUrl = new URL(`${env.clientUrl}/login`)
        targetUrl.searchParams.set('token', auth.accessToken)
        targetUrl.searchParams.set('refreshToken', auth.refreshToken)
        res.redirect(targetUrl.toString())
    }
)

authRouter.get(
    '/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: `${env.clientUrl}/login` }),
    (req, res) => {
        const auth = req.user as {
            accessToken: string
            refreshToken: string
            user: { id: number; email: string; username: string; displayName?: string | null; avatar?: string | null }
        }
        setAuthCookies(req, res, auth)
        const targetUrl = new URL(`${env.clientUrl}/login`)
        targetUrl.searchParams.set('token', auth.accessToken)
        targetUrl.searchParams.set('refreshToken', auth.refreshToken)
        res.redirect(targetUrl.toString())
    }
)
