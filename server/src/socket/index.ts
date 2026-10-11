import { PresenceStatus } from '@prisma/client'
import { parse as parseCookie } from 'cookie'
import { Server } from 'socket.io'

import { COOKIE_KEYS, SOCKET_EVENTS } from '../core/constants'
import { conversationRepository } from '../repositories/conversation.repository'
import { setPresence } from '../services/user.service'
import { verifyAccessToken } from '../utils/token'

export const setupSocket = (io: Server) => {
    io.use((socket, next) => {
        try {
            const headerCookie = socket.handshake.headers.cookie
            const cookies = headerCookie ? parseCookie(headerCookie) : {}
            const authHeader = socket.handshake.headers.authorization
            const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
            const token =
                (socket.handshake.auth?.token as string | undefined) ??
                bearerToken ??
                cookies[COOKIE_KEYS.ACCESS_TOKEN]

            if (!token) throw new Error('Unauthorized')
            socket.data.user = verifyAccessToken(token)
            next()
        } catch {
            next(new Error('Unauthorized'))
        }
    })

    io.on(SOCKET_EVENTS.CONNECTION, async socket => {
        const user = socket.data.user as { userId: number; username: string }
        socket.join(`user:${user.userId}`)
        await setPresence(user.userId, PresenceStatus.ONLINE)
        io.emit(SOCKET_EVENTS.PRESENCE_UPDATE, { userId: user.userId, presence: 'ONLINE' })

        socket.on(SOCKET_EVENTS.PRESENCE_SET, async (presence: PresenceStatus) => {
            const allowedPresence = ['ONLINE', 'AWAY', 'OFFLINE']
            if (!allowedPresence.includes(presence)) return

            await setPresence(user.userId, presence)
            io.emit(SOCKET_EVENTS.PRESENCE_UPDATE, { userId: user.userId, presence })
        })

        socket.on(SOCKET_EVENTS.CONVERSATION_JOIN, async (conversationId: number) => {
            const member = await conversationRepository.findMember(conversationId, user.userId)
            if (!member) {
                return socket.emit(SOCKET_EVENTS.CONVERSATION_ERROR, {
                    conversationId,
                    message: 'Không có quyền truy cập conversation'
                })
            }
            socket.join(`conversation:${conversationId}`)
        })

        socket.on(SOCKET_EVENTS.TYPING_START, async (conversationId: number) => {
            const member = await conversationRepository.findMember(conversationId, user.userId)
            if (!member) return

            socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.TYPING_UPDATE, {
                conversationId,
                userId: user.userId,
                username: user.username,
                typing: true
            })
        })

        socket.on(SOCKET_EVENTS.TYPING_STOP, async (conversationId: number) => {
            const member = await conversationRepository.findMember(conversationId, user.userId)
            if (!member) return

            socket.to(`conversation:${conversationId}`).emit(SOCKET_EVENTS.TYPING_UPDATE, {
                conversationId,
                userId: user.userId,
                username: user.username,
                typing: false
            })
        })

        socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
            await setPresence(user.userId, PresenceStatus.OFFLINE)
            io.emit(SOCKET_EVENTS.PRESENCE_UPDATE, { userId: user.userId, presence: 'OFFLINE' })
        })
    })
}
