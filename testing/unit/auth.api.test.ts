import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import app from '../../server/src/app'
import { prisma } from '../../server/src/config/prisma'

describe('Backend Auth API Integration Tests', () => {
    const timestamp = Date.now()
    const testUser = {
        username: `test_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: 'password123',
        displayName: 'Test User'
    }

    let accessToken: string
    let refreshToken: string
    let authCookie: string

    beforeAll(async () => {
        // Clean up any test user if exists
        await prisma.user.deleteMany({
            where: {
                OR: [{ username: testUser.username }, { email: testUser.email }]
            }
        })
    })

    afterAll(async () => {
        // Clean up test data
        await prisma.user.deleteMany({
            where: {
                OR: [{ username: testUser.username }, { email: testUser.email }]
            }
        })
        await prisma.$disconnect()
    })

    it('GET /api/health should return 200 OK', async () => {
        const res = await request(app).get('/api/health')
        expect(res.status).toBe(200)
        expect(res.body.message).toBe('OK')
    })

    it('POST /api/auth/register should create user, return tokens and set cookies', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser)

        expect(res.status).toBe(201)
        expect(res.body.user).toBeDefined()
        expect(res.body.user.email).toBe(testUser.email)
        expect(res.body.accessToken).toBeDefined()
        expect(res.body.refreshToken).toBeDefined()

        // Verify cookies are set
        const cookies = res.headers['set-cookie']
        expect(cookies).toBeDefined()
        expect(cookies.some((c: string) => c.includes('chat_access'))).toBe(true)
        expect(cookies.some((c: string) => c.includes('chat_refresh'))).toBe(true)

        accessToken = res.body.accessToken
        refreshToken = res.body.refreshToken
        authCookie = cookies.find((c: string) => c.startsWith('chat_access=')) || ''
    })

    it('POST /api/auth/login should authenticate user, return tokens and set cookies', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            })

        expect(res.status).toBe(200)
        expect(res.body.user).toBeDefined()
        expect(res.body.user.email).toBe(testUser.email)
        expect(res.body.accessToken).toBeDefined()
        expect(res.body.refreshToken).toBeDefined()

        // Update tokens
        accessToken = res.body.accessToken
        refreshToken = res.body.refreshToken
    })

    it('GET /api/auth/me should authorize using Bearer token', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${accessToken}`)

        expect(res.status).toBe(200)
        expect(res.body.email).toBe(testUser.email)
        expect(res.body.username).toBe(testUser.username)
    })

    it('GET /api/auth/me should authorize using Cookie', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', [`chat_access=${accessToken}`])

        expect(res.status).toBe(200)
        expect(res.body.email).toBe(testUser.email)
    })

    it('GET /api/auth/me without token should return 401 Unauthorized', async () => {
        const res = await request(app).get('/api/auth/me')
        expect(res.status).toBe(401)
    })

    it('POST /api/auth/refresh with body refreshToken should rotate session', async () => {
        const res = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken })

        expect(res.status).toBe(200)
        expect(res.body.accessToken).toBeDefined()
        expect(res.body.refreshToken).toBeDefined()
        expect(res.body.user).toBeDefined()

        // Newly issued token should work
        const newAccess = res.body.accessToken
        const check = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${newAccess}`)
        expect(check.status).toBe(200)
    })

    it('POST /api/auth/logout should revoke session and clear cookies', async () => {
        const res = await request(app)
            .post('/api/auth/logout')
            .send({ refreshToken })

        expect(res.status).toBe(200)
        const cookies = res.headers['set-cookie']
        expect(cookies).toBeDefined()
        expect(cookies.some((c: string) => c.includes('chat_access=;'))).toBe(true)
    })
})
