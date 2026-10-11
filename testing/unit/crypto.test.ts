import { describe, expect, it } from 'vitest'
import { randomToken } from '../../server/src/utils/crypto'

describe('Crypto Utilities', () => {
    it('should generate a 64-character hex string token', () => {
        const token = randomToken()
        expect(token).toHaveLength(64)
        expect(/^[0-9a-f]+$/i.test(token)).toBe(true)
    })

    it('should generate distinct tokens on successive calls', () => {
        const token1 = randomToken()
        const token2 = randomToken()
        expect(token1).not.toBe(token2)
    })
})
