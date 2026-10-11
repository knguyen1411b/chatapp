import { describe, expect, it } from 'vitest'
import {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
} from '../../server/src/utils/token'

describe('Token Utilities', () => {
    const payload = {
        userId: 1,
        email: 'test@example.com',
        username: 'testuser'
    }

    it('should correctly sign and verify access tokens', () => {
        const token = signAccessToken(payload)
        expect(token).toBeDefined()
        expect(typeof token).toBe('string')

        const decoded = verifyAccessToken(token)
        expect(decoded.userId).toBe(payload.userId)
        expect(decoded.email).toBe(payload.email)
        expect(decoded.username).toBe(payload.username)
    })

    it('should throw an error for an invalid access token', () => {
        expect(() => verifyAccessToken('invalid.token.structure')).toThrow()
    })

    it('should correctly sign and verify refresh tokens', () => {
        const refreshPayload = {
            userId: 1,
            tokenId: 42
        }
        const token = signRefreshToken(refreshPayload)
        expect(token).toBeDefined()

        const decoded = verifyRefreshToken(token)
        expect(decoded.userId).toBe(refreshPayload.userId)
        expect(decoded.tokenId).toBe(refreshPayload.tokenId)
    })
})
