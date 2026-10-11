import { Request, Response } from 'express'
import { COOKIE_KEYS, TOKEN_EXPIRY } from '../core/constants'

export interface CookieConfig {
    httpOnly: boolean
    sameSite: 'none' | 'lax'
    secure: boolean
    path: string
    domain?: string
    partitioned?: boolean
}

export const getCookieOptions = (req: Request): CookieConfig => {
    const isHttps =
        req.secure ||
        req.headers['x-forwarded-proto'] === 'https' ||
        process.env.NODE_ENV === 'production' ||
        process.env.VERCEL === '1'

    return {
        httpOnly: true,
        sameSite: (isHttps ? 'none' : 'lax') as 'none' | 'lax',
        secure: isHttps,
        path: '/',
        ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {})
    }
}

export const setAuthCookies = (
    req: Request,
    res: Response,
    payload: { accessToken: string; refreshToken: string }
) => {
    const options = getCookieOptions(req)
    const extra = options.secure ? { partitioned: true } : {}

    res.cookie(COOKIE_KEYS.ACCESS_TOKEN, payload.accessToken, {
        ...options,
        ...extra,
        maxAge: TOKEN_EXPIRY.ACCESS_TOKEN_MS
    } as any)

    res.cookie(COOKIE_KEYS.REFRESH_TOKEN, payload.refreshToken, {
        ...options,
        ...extra,
        maxAge: TOKEN_EXPIRY.REFRESH_TOKEN_MS
    } as any)
}

export const clearAuthCookies = (req: Request, res: Response) => {
    const options = getCookieOptions(req)
    const extra = options.secure ? { partitioned: true } : {}

    res.clearCookie(COOKIE_KEYS.ACCESS_TOKEN, { ...options, ...extra } as any)
    res.clearCookie(COOKIE_KEYS.REFRESH_TOKEN, { ...options, ...extra } as any)
}
