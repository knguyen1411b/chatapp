'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import { QueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { App } from 'antd'

import { useChatSocket } from '@/shared/hooks/use-chat-socket'
import { authStorage } from '@/shared/lib/auth-storage'
import { chatApi } from '@/shared/lib/chat-api'
import { getErrorMessage } from '@/shared/lib/http'
import { AuthUser, Conversation, Message } from '@/shared/lib/types'

type Params = {
    queryClient: QueryClient
}

export const useChatPageState = ({ queryClient }: Params) => {
    const router = useRouter()
    const { message } = App.useApp()

    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
    const [authBootstrapped, setAuthBootstrapped] = useState(false)
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [messagesNextCursor, setMessagesNextCursor] = useState<number | null>(null)
    const [loadingMoreMessages, setLoadingMoreMessages] = useState(false)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [typingText, setTypingText] = useState('')
    const [text, setText] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchError, setSearchError] = useState('')
    const [replyTo, setReplyTo] = useState<Message | null>(null)
    const [forwardOpen, setForwardOpen] = useState(false)
    const [forwardMessage, setForwardMessage] = useState<Message | null>(null)
    const [forwardConversationId, setForwardConversationId] = useState<number | null>(null)
    const [groupOpen, setGroupOpen] = useState(false)
    const [groupName, setGroupName] = useState('')
    const [groupMemberInput, setGroupMemberInput] = useState('')
    const [groupMembers, setGroupMembers] = useState<string[]>([])
    const [groupMemberChecking, setGroupMemberChecking] = useState(false)
    const [groupError, setGroupError] = useState('')
    const [mobileChatOpen, setMobileChatOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    const selectedConversationIdRef = useRef<number | null>(null)
    const activeLoadConversationIdRef = useRef<number | null>(null)
    const typingStopTimerRef = useRef<NodeJS.Timeout | null>(null)

    const resetChatState = useCallback(() => {
        setSelectedConversation(null)
        selectedConversationIdRef.current = null
        activeLoadConversationIdRef.current = null
        setMessages([])
        setTypingText('')
        setText('')
        setReplyTo(null)
    }, [])

    useEffect(() => {
        chatApi
            .getMe()
            .then(user => {
                setCurrentUser(user)
                authStorage.setUser(user)
            })
            .catch(() => {
                setCurrentUser(null)
                authStorage.clear()
            })
            .finally(() => setAuthBootstrapped(true))
    }, [])

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            if (!mobile) setMobileChatOpen(true)
            if (mobile && !selectedConversationIdRef.current) setMobileChatOpen(false)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        if (!authBootstrapped) return
        if (!currentUser) {
            router.replace('/login')
            return
        }
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [authBootstrapped, currentUser, router])

    const upsertMessage = useCallback((incoming: Message) => {
        setMessages(prev => {
            const existingIndex = prev.findIndex(x => x.id === incoming.id)
            if (existingIndex === -1) return [...prev, incoming]
            const next = [...prev]
            next[existingIndex] = { ...next[existingIndex], ...incoming }
            return next
        })
    }, [])

    const handlePresenceUpdate = useCallback(
        (payload: { userId: number; presence: 'ONLINE' | 'AWAY' | 'OFFLINE' }) => {
            setCurrentUser(prev =>
                prev && prev.id === payload.userId ? { ...prev, presence: payload.presence } : prev
            )
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
        },
        [queryClient]
    )

    const handleTypingUpdate = useCallback((payload: { conversationId: number; username: string; typing: boolean }) => {
        if (selectedConversationIdRef.current !== payload.conversationId) return
        setTypingText(payload.typing ? `${payload.username} đang nhập…` : '')
    }, [])

    const handleMessageUpdated = useCallback(
        (incomingMessage: Message) => {
            if (selectedConversationIdRef.current === incomingMessage.conversationId) {
                upsertMessage(incomingMessage)
            }
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
        },
        [queryClient, upsertMessage]
    )

    const handleMessageNew = useCallback(
        (incomingMessage: Message) => {
            if (selectedConversationIdRef.current === incomingMessage.conversationId) {
                upsertMessage(incomingMessage)
            } else if (
                typeof window !== 'undefined' &&
                'Notification' in window &&
                Notification.permission === 'granted'
            ) {
                new Notification(`${incomingMessage.sender.displayName || incomingMessage.sender.username}`, {
                    body: incomingMessage.content || 'Tin nhắn mới'
                })
            }
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
        },
        [queryClient, upsertMessage]
    )

    const { socketRef, connected } = useChatSocket({
        enabled: Boolean(currentUser),
        onMessageNew: handleMessageNew,
        onMessageUpdated: handleMessageUpdated,
        onTypingUpdate: handleTypingUpdate,
        onPresenceUpdate: handlePresenceUpdate
    })

    useEffect(
        () => () => {
            if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current)
        },
        []
    )

    const conversationsQuery = useQuery({
        queryKey: ['conversations'],
        queryFn: chatApi.getMyConversations,
        enabled: Boolean(currentUser)
    })

    const openConversation = useCallback(
        async (conversation: Conversation) => {
            setSelectedConversation(conversation)
            selectedConversationIdRef.current = conversation.id
            activeLoadConversationIdRef.current = conversation.id
            setReplyTo(null)
            setTypingText('')
            setMessages([])
            setMessagesNextCursor(null)
            if (isMobile) setMobileChatOpen(true)

            socketRef.current?.emit('conversation:join', conversation.id)
            setLoadingMessages(true)

            try {
                const nextMessages = await chatApi.getConversationMessages(conversation.id)
                if (activeLoadConversationIdRef.current === conversation.id) {
                    setMessages(nextMessages.items)
                    setMessagesNextCursor(nextMessages.nextCursor)
                    chatApi.markConversationAsRead(conversation.id).catch(() => {})
                }
            } catch (error) {
                message.error(getErrorMessage(error, 'Không tải được tin nhắn'))
            } finally {
                if (activeLoadConversationIdRef.current === conversation.id) {
                    setLoadingMessages(false)
                }
            }
        },
        [isMobile, message, socketRef]
    )

    const loadMoreMessages = useCallback(async () => {
        const conversationId = selectedConversationIdRef.current
        if (!conversationId || !messagesNextCursor || loadingMoreMessages) return

        setLoadingMoreMessages(true)
        try {
            const older = await chatApi.getConversationMessages(conversationId, messagesNextCursor)
            setMessages(prev => {
                const existingIds = new Set(prev.map(message => message.id))
                const merged = [...older.items.filter(message => !existingIds.has(message.id)), ...prev]
                return merged
            })
            setMessagesNextCursor(older.nextCursor)
        } catch (error) {
            message.error(getErrorMessage(error, 'Không tải thêm được tin nhắn'))
        } finally {
            setLoadingMoreMessages(false)
        }
    }, [loadingMoreMessages, message, messagesNextCursor])

    const searchMutation = useMutation({
        mutationFn: chatApi.searchUser,
        onSuccess: () => setSearchError(''),
        onError: error => setSearchError(getErrorMessage(error, 'Không tìm thấy người dùng'))
    })

    const startPrivateMutation = useMutation({
        mutationFn: chatApi.startPrivateConversation,
        onSuccess: async conversation => {
            setSearchQuery('')
            setSearchError('')
            searchMutation.reset()
            await conversationsQuery.refetch()
            await openConversation(conversation)
        },
        onError: error => setSearchError(getErrorMessage(error, 'Không thể bắt đầu chat'))
    })

    const createGroupMutation = useMutation({
        mutationFn: chatApi.createGroupConversation,
        onSuccess: async conversation => {
            setGroupOpen(false)
            setGroupName('')
            setGroupMemberInput('')
            setGroupMembers([])
            setGroupError('')
            await conversationsQuery.refetch()
            await openConversation(conversation)
        },
        onError: error => setGroupError(getErrorMessage(error, 'Tạo nhóm thất bại'))
    })

    const sendMutation = useMutation({
        mutationFn: async () => {
            if (!selectedConversation) throw new Error('Conversation chưa hợp lệ')
            return chatApi.sendMessage({
                conversationId: selectedConversation.id,
                content: text.trim(),
                type: 'TEXT',
                replyToId: replyTo?.id
            })
        },
        onSuccess: () => {
            setReplyTo(null)
            setText('')
            if (selectedConversationIdRef.current) {
                socketRef.current?.emit('typing:stop', selectedConversationIdRef.current)
            }
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
        },
        onError: error => message.error(getErrorMessage(error, 'Không gửi được tin nhắn'))
    })

    const sendFilesMutation = useMutation({
        mutationFn: async (files: File[]) => {
            if (!selectedConversation) throw new Error('Conversation chưa hợp lệ')
            if (!files.length) return
            const uploadedFiles = await chatApi.uploadFiles(files)
            await Promise.all(
                uploadedFiles.map(file =>
                    chatApi.sendMessage({
                        conversationId: selectedConversation.id,
                        content: file.url,
                        type: file.type
                    })
                )
            )
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
        },
        onError: error => message.error(getErrorMessage(error, 'Không gửi được ảnh hoặc file'))
    })

    const conversations = useMemo(() => conversationsQuery.data ?? [], [conversationsQuery.data])

    const startChatWithFoundUser = () => {
        if (!searchMutation.data?.id) {
            setSearchError('Không lấy được thông tin người dùng')
            return
        }
        startPrivateMutation.mutate(searchMutation.data.id)
    }

    const togglePin = async (conversationId: number) => {
        try {
            await chatApi.togglePinConversation(conversationId)
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
        } catch (error) {
            message.error(getErrorMessage(error, 'Không thể ghim cuộc trò chuyện'))
        }
    }

    const toggleFavorite = async (messageId: number) => {
        try {
            await chatApi.toggleFavoriteMessage(messageId)
        } catch (error) {
            message.error(getErrorMessage(error, 'Không thể lưu tin nhắn'))
        }
    }

    const react = async (messageId: number, emoji: string) => {
        try {
            await chatApi.toggleMessageReaction(messageId, emoji)
        } catch (error) {
            message.error(getErrorMessage(error, 'Không thể thả cảm xúc'))
        }
    }

    const editMessage = async (messageId: number) => {
        const nextContent = prompt('Sửa tin nhắn:')
        if (!nextContent) return
        try {
            await chatApi.editMessage(messageId, nextContent)
        } catch (error) {
            message.error(getErrorMessage(error, 'Không thể sửa tin nhắn'))
        }
    }

    const deleteMessage = async (messageId: number) => {
        try {
            await chatApi.deleteMessage(messageId)
        } catch (error) {
            message.error(getErrorMessage(error, 'Không thể xóa tin nhắn'))
        }
    }

    const forwardMessageSubmit = async () => {
        if (!forwardMessage || !forwardConversationId) return
        try {
            await chatApi.sendMessage({
                conversationId: forwardConversationId,
                content: forwardMessage.content,
                type: forwardMessage.type,
                forwardedFromId: forwardMessage.id
            })
            setForwardOpen(false)
            setForwardConversationId(null)
            setForwardMessage(null)
        } catch (error) {
            message.error(getErrorMessage(error, 'Không thể chuyển tiếp tin nhắn'))
        }
    }

    const handleTyping = (value: string) => {
        setText(value)
        if (!selectedConversationIdRef.current) return
        if (value) {
            socketRef.current?.emit('typing:start', selectedConversationIdRef.current)
            if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current)
            typingStopTimerRef.current = setTimeout(() => {
                if (selectedConversationIdRef.current) {
                    socketRef.current?.emit('typing:stop', selectedConversationIdRef.current)
                }
            }, 1200)
            return
        }
        socketRef.current?.emit('typing:stop', selectedConversationIdRef.current)
    }

    const addGroupMember = async (value?: string) => {
        const nextValue = (value ?? groupMemberInput).trim()
        if (!nextValue) return
        if (groupMembers.some(member => member.toLowerCase() === nextValue.toLowerCase())) {
            setGroupError('Thành viên đã được thêm')
            setGroupMemberInput('')
            return
        }
        if (
            currentUser &&
            [currentUser.username, currentUser.email, currentUser.displayName]
                .filter(Boolean)
                .some(v => v!.toLowerCase() === nextValue.toLowerCase())
        ) {
            setGroupError('Không thể thêm chính bạn vào danh sách thành viên')
            return
        }

        setGroupMemberChecking(true)
        try {
            const foundUser = await chatApi.searchUser(nextValue)
            if (groupMembers.some(member => member.toLowerCase() === foundUser.username.toLowerCase())) {
                setGroupError('Thành viên đã được thêm')
                return
            }
            setGroupMembers(prev => [...prev, foundUser.username])
            setGroupMemberInput('')
            setGroupError('')
        } catch (error) {
            setGroupError(getErrorMessage(error, `Không tìm thấy user: ${nextValue}`))
        } finally {
            setGroupMemberChecking(false)
        }
    }

    const removeGroupMember = (value: string) => {
        setGroupMembers(prev => prev.filter(member => member !== value))
    }

    const createGroup = () => {
        if (!groupName.trim()) return setGroupError('Vui lòng nhập tên nhóm')
        if (groupMembers.length < 2) return setGroupError('Nhóm cần ít nhất 2 thành viên')
        createGroupMutation.mutate({ name: groupName.trim(), members: groupMembers })
    }

    const logout = () => {
        authStorage.clear()
        chatApi.logout().catch(() => {})
        setCurrentUser(null)
        resetChatState()
        queryClient.removeQueries({ queryKey: ['conversations'] })
        socketRef.current?.removeAllListeners()
        socketRef.current?.disconnect()
        if (typeof window !== 'undefined') {
            window.location.replace('/login')
            return
        }
        router.replace('/login')
    }

    return {
        authBootstrapped,
        currentUser,
        selectedConversation,
        messages,
        messagesNextCursor,
        loadingMoreMessages,
        loadingMessages,
        typingText,
        text,
        searchQuery,
        searchError,
        replyTo,
        forwardOpen,
        forwardMessage,
        forwardConversationId,
        groupOpen,
        groupName,
        groupMemberInput,
        groupMembers,
        groupMemberChecking,
        groupError,
        mobileChatOpen,
        isMobile,
        connected,
        conversations,
        searchMutation,
        startPrivateMutation,
        createGroupMutation,
        sendMutation,
        sendFilesMutation,
        setSearchQuery,
        setSearchError,
        setReplyTo,
        setForwardOpen,
        setForwardMessage,
        setForwardConversationId,
        setGroupOpen,
        setGroupName,
        setGroupMemberInput,
        setGroupError,
        setCurrentUser,
        setMobileChatOpen,
        openConversation,
        loadMoreMessages,
        startChatWithFoundUser,
        togglePin,
        toggleFavorite,
        react,
        editMessage,
        deleteMessage,
        forwardMessageSubmit,
        handleTyping,
        addGroupMember,
        removeGroupMember,
        createGroup,
        logout,
        socketRef
    }
}
