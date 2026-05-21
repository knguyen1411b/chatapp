import { PresenceStatus } from '@prisma/client'
import { parse as parseCookie } from 'cookie'
import { Server } from 'socket.io'

import { prisma } from '../config/prisma'
import { setPresence } from '../services/chat.service'
import { verifyAccessToken } from '../utils/token'

export const setupSocket = (io: Server) => {
    io.use((socket, next) => {
        try {
            const headerCookie = socket.handshake.headers.cookie
            const cookies = headerCookie ? parseCookie(headerCookie) : {}
            const token = (socket.handshake.auth?.token as string | undefined) ?? cookies.chat_access
            if (!token) throw new Error('Unauthorized')
            socket.data.user = verifyAccessToken(token)
            next()
        } catch {
            next(new Error('Unauthorized'))
        }
    })

    io.on('connection', async socket => {
        const user = socket.data.user as { userId: number; username: string }
        socket.join(`user:${user.userId}`)
        await setPresence(user.userId, PresenceStatus.ONLINE)
        io.emit('presence:update', { userId: user.userId, presence: 'ONLINE' })

        socket.on('presence:set', async (presence: PresenceStatus) => {
            const allowedPresence = ['ONLINE', 'AWAY', 'OFFLINE']
            if (!allowedPresence.includes(presence)) return

            await setPresence(user.userId, presence)
            io.emit('presence:update', { userId: user.userId, presence })
        })

        socket.on('conversation:join', async (conversationId: number) => {
            const member = await prisma.conversationMember.findUnique({
                where: { conversationId_userId: { conversationId, userId: user.userId } }
            })
            if (!member)
                return socket.emit('conversation:error', {
                    conversationId,
                    message: 'Không có quyền truy cập conversation'
                })
            socket.join(`conversation:${conversationId}`)
        })

        socket.on('typing:start', async (conversationId: number) => {
            const member = await prisma.conversationMember.findUnique({
                where: { conversationId_userId: { conversationId, userId: user.userId } }
            })
            if (!member) return
            socket
                .to(`conversation:${conversationId}`)
                .emit('typing:update', { conversationId, userId: user.userId, username: user.username, typing: true })
        })

        socket.on('typing:stop', async (conversationId: number) => {
            const member = await prisma.conversationMember.findUnique({
                where: { conversationId_userId: { conversationId, userId: user.userId } }
            })
            if (!member) return
            socket
                .to(`conversation:${conversationId}`)
                .emit('typing:update', { conversationId, userId: user.userId, username: user.username, typing: false })
        })

        socket.on('disconnect', async () => {
            await setPresence(user.userId, PresenceStatus.OFFLINE)
            io.emit('presence:update', { userId: user.userId, presence: 'OFFLINE' })
        })
    })
}
