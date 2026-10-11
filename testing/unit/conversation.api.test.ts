import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import app from '../../server/src/app'
import { prisma } from '../../server/src/config/prisma'

describe('Backend Conversation & Messaging Integration Tests', () => {
    const timestamp = Date.now()
    const userA = {
        username: `chat_a_${timestamp}`,
        email: `chat_a_${timestamp}@example.com`,
        password: 'password123',
        displayName: 'User Alice'
    }

    const userB = {
        username: `chat_b_${timestamp}`,
        email: `chat_b_${timestamp}@example.com`,
        password: 'password123',
        displayName: 'User Bob'
    }

    let tokenA: string
    let tokenB: string
    let userAId: number
    let userBId: number
    let conversationId: number
    let messageId: number

    beforeAll(async () => {
        // Register User A
        const resA = await request(app).post('/api/auth/register').send(userA)
        tokenA = resA.body.accessToken
        userAId = resA.body.user.id

        // Register User B
        const resB = await request(app).post('/api/auth/register').send(userB)
        tokenB = resB.body.accessToken
        userBId = resB.body.user.id
    })

    afterAll(async () => {
        // Clean up test data
        await prisma.message.deleteMany({
            where: {
                OR: [{ senderId: userAId }, { senderId: userBId }]
            }
        })
        await prisma.conversationMember.deleteMany({
            where: {
                OR: [{ userId: userAId }, { userId: userBId }]
            }
        })
        await prisma.conversation.deleteMany({
            where: {
                OR: [{ createdBy: userAId }, { createdBy: userBId }]
            }
        })
        await prisma.refreshToken.deleteMany({
            where: {
                OR: [{ userId: userAId }, { userId: userBId }]
            }
        })
        await prisma.user.deleteMany({
            where: {
                id: { in: [userAId, userBId] }
            }
        })
        await prisma.$disconnect()
    })

    it('GET /api/users/search should find user by username or displayName', async () => {
        const res = await request(app)
            .get(`/api/users/search?query=${userB.username}`)
            .set('Authorization', `Bearer ${tokenA}`)

        expect(res.status).toBe(200)
        expect(res.body.id).toBe(userBId)
        expect(res.body.username).toBe(userB.username)
    })

    it('PATCH /api/users/me should update profile displayName', async () => {
        const res = await request(app)
            .patch('/api/users/me')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ displayName: 'Alice Updated' })

        expect(res.status).toBe(200)
        expect(res.body.displayName).toBe('Alice Updated')
    })

    it('POST /api/conversations/private should create a private chat between Alice & Bob', async () => {
        const res = await request(app)
            .post('/api/conversations/private')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ targetUserId: userBId })

        expect(res.status).toBe(201)
        expect(res.body.id).toBeDefined()
        expect(res.body.type).toBe('PRIVATE')
        expect(res.body.members).toHaveLength(2)

        conversationId = res.body.id
    })

    it('POST /api/conversations/private idempotency should return same conversation', async () => {
        const res = await request(app)
            .post('/api/conversations/private')
            .set('Authorization', `Bearer ${tokenB}`)
            .send({ targetUserId: userAId })

        expect(res.status).toBe(201)
        expect(res.body.id).toBe(conversationId)
    })

    it('POST /api/messages should send a message into the conversation', async () => {
        const res = await request(app)
            .post('/api/messages')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({
                conversationId,
                content: 'Hello Bob! This is Alice.'
            })

        expect(res.status).toBe(201)
        expect(res.body.id).toBeDefined()
        expect(res.body.content).toBe('Hello Bob! This is Alice.')
        expect(res.body.senderId).toBe(userAId)

        messageId = res.body.id
    })

    it('GET /api/conversations/:id/messages should list messages in conversation', async () => {
        const res = await request(app)
            .get(`/api/conversations/${conversationId}/messages`)
            .set('Authorization', `Bearer ${tokenB}`)

        expect(res.status).toBe(200)
        expect(res.body.items).toBeDefined()
        expect(res.body.items.length).toBeGreaterThanOrEqual(1)
        expect(res.body.items[0].content).toBe('Hello Bob! This is Alice.')
    })

    it('POST /api/conversations/:id/read should mark messages as read for user', async () => {
        const res = await request(app)
            .post(`/api/conversations/${conversationId}/read`)
            .set('Authorization', `Bearer ${tokenB}`)

        expect(res.status).toBe(200)
        expect(res.body.ok).toBe(true)
    })

    it('POST /api/conversations/:id/pin should toggle conversation pin', async () => {
        const pinRes = await request(app)
            .post(`/api/conversations/${conversationId}/pin`)
            .set('Authorization', `Bearer ${tokenA}`)

        expect(pinRes.status).toBe(200)
        expect(pinRes.body.removed).toBe(false)

        const unpinRes = await request(app)
            .post(`/api/conversations/${conversationId}/pin`)
            .set('Authorization', `Bearer ${tokenA}`)

        expect(unpinRes.status).toBe(200)
        expect(unpinRes.body.removed).toBe(true)
    })

    it('POST /api/conversations/messages/:id/reaction should toggle reaction on message', async () => {
        const reactRes = await request(app)
            .post(`/api/conversations/messages/${messageId}/reaction`)
            .set('Authorization', `Bearer ${tokenB}`)
            .send({ emoji: '❤️' })

        expect(reactRes.status).toBe(200)
        expect(reactRes.body.removed).toBe(false)
    })
})
