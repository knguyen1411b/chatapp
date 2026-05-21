'use client'

import { useEffect, useRef } from 'react'
import { useState } from 'react'

import { Socket, io } from 'socket.io-client'

import { Message } from '@/shared/lib/types'

type TypingPayload = {
    conversationId: number
    username: string
    typing: boolean
}

type PresencePayload = {
    userId: number
    presence: 'ONLINE' | 'AWAY' | 'OFFLINE'
}

type UseChatSocketParams = {
    enabled: boolean
    onMessageNew: (message: Message) => void
    onMessageUpdated: (message: Message) => void
    onTypingUpdate: (payload: TypingPayload) => void
    onPresenceUpdate: (payload: PresencePayload) => void
}

export const useChatSocket = ({
    enabled,
    onMessageNew,
    onMessageUpdated,
    onTypingUpdate,
    onPresenceUpdate
}: UseChatSocketParams) => {
    const socketRef = useRef<Socket | null>(null)
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        if (!enabled) {
            socketRef.current?.removeAllListeners()
            socketRef.current?.disconnect()
            socketRef.current = null
            return
        }

        const endpoint = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_SERVER_URL || ''
        if (!endpoint) return

        const socket = io(endpoint, { withCredentials: true })
        socketRef.current = socket

        socket.on('message:new', onMessageNew)
        socket.on('message:updated', onMessageUpdated)
        socket.on('typing:update', onTypingUpdate)
        socket.on('presence:update', onPresenceUpdate)
        socket.on('connect', () => setConnected(true))
        socket.on('disconnect', () => setConnected(false))

        return () => {
            socket.off('message:new', onMessageNew)
            socket.off('message:updated', onMessageUpdated)
            socket.off('typing:update', onTypingUpdate)
            socket.off('presence:update', onPresenceUpdate)
            socket.off('connect')
            socket.off('disconnect')
            socket.disconnect()
            socketRef.current = null
        }
    }, [enabled, onMessageNew, onMessageUpdated, onPresenceUpdate, onTypingUpdate])

    return { socketRef, connected }
}
