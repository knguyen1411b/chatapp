import { NextFunction, RequestHandler, Response } from 'express'

import { AuthRequest } from '../types/auth'
import { verifyAccessToken } from '../utils/token'

export const authMiddleware: RequestHandler = (req, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    const cookieToken = req.cookies?.chat_access as string | undefined
    const token = bearerToken ?? cookieToken

    try {
        if (!token) {
            res.status(401).json({ message: 'Unauthorized' })
            return
        }
        ;(req as AuthRequest).authUser = verifyAccessToken(token)
        next()
    } catch {
        res.status(401).json({ message: 'Invalid token' })
    }
}
