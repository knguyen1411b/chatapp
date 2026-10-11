import { describe, expect, it } from 'vitest'
import { getCookieOptions } from '../../server/src/controllers/auth.controller'
import type { Request } from 'express'

describe('Cookie Options Calculation', () => {
    it('should configure lax sameSite and insecure cookie on plain local HTTP', () => {
        const req = {
            secure: false,
            headers: {}
        } as unknown as Request

        const originalEnv = process.env.NODE_ENV
        process.env.NODE_ENV = 'development'
        delete process.env.VERCEL

        const options = getCookieOptions(req)
        expect(options.httpOnly).toBe(true)
        expect(options.path).toBe('/')
        expect(options.sameSite).toBe('lax')
        expect(options.secure).toBe(false)

        process.env.NODE_ENV = originalEnv
    })

    it('should configure sameSite=none and secure=true when HTTPS header is forwarded', () => {
        const req = {
            secure: false,
            headers: {
                'x-forwarded-proto': 'https'
            }
        } as unknown as Request

        const options = getCookieOptions(req)
        expect(options.httpOnly).toBe(true)
        expect(options.path).toBe('/')
        expect(options.sameSite).toBe('none')
        expect(options.secure).toBe(true)
    })

    it('should configure sameSite=none and secure=true in production environment', () => {
        const originalEnv = process.env.NODE_ENV
        process.env.NODE_ENV = 'production'

        const req = {
            secure: false,
            headers: {}
        } as unknown as Request

        const options = getCookieOptions(req)
        expect(options.sameSite).toBe('none')
        expect(options.secure).toBe(true)

        process.env.NODE_ENV = originalEnv
    })

    it('should attach domain if COOKIE_DOMAIN environment variable is set', () => {
        const originalDomain = process.env.COOKIE_DOMAIN
        process.env.COOKIE_DOMAIN = '.example.com'

        const req = {
            secure: true,
            headers: {}
        } as unknown as Request

        const options = getCookieOptions(req)
        expect(options.domain).toBe('.example.com')

        if (originalDomain !== undefined) {
            process.env.COOKIE_DOMAIN = originalDomain
        } else {
            delete process.env.COOKIE_DOMAIN
        }
    })
})
