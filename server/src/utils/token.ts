import jwt from 'jsonwebtoken'

import { env } from '../config/env'

export interface JwtPayload {
    userId: number
    email: string
    username: string
}

export interface RefreshJwtPayload {
    userId: number
    tokenId: number
}

export const signAccessToken = (payload: JwtPayload) => jwt.sign(payload, env.jwtSecret, { expiresIn: '15m' })
export const verifyAccessToken = (token: string) => jwt.verify(token, env.jwtSecret) as JwtPayload

export const signRefreshToken = (payload: RefreshJwtPayload) => jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' })
export const verifyRefreshToken = (token: string) => jwt.verify(token, env.jwtSecret) as RefreshJwtPayload
