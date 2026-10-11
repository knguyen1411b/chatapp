import { api } from './api'
import { authStorage } from './auth-storage'
import { AuthUser, Conversation, Message, PaginatedMessages } from './types'

export type AuthResponse = {
    user: AuthUser
    accessToken?: string
    refreshToken?: string
}

export const chatApi = {
    register: async (payload: { username: string; email: string; password: string; displayName?: string }) =>
        (await api.post<AuthResponse>('/auth/register', payload)).data,
    login: async (payload: { email: string; password: string }) =>
        (await api.post<AuthResponse>('/auth/login', payload)).data,
    refreshSession: async () => {
        const refreshToken = authStorage.getRefreshToken()
        return (await api.post<AuthResponse>('/auth/refresh', { refreshToken })).data
    },
    logout: async () => {
        const refreshToken = authStorage.getRefreshToken()
        return api.post('/auth/logout', { refreshToken })
    },
    getMe: async () => (await api.get<AuthUser>('/auth/me')).data,
    forgotPassword: async (email: string) =>
        (await api.post<{ message: string; resetToken?: string }>('/auth/forgot-password', { email })).data,
    verifyResetPasswordToken: async (token: string, email: string) =>
        (
            await api.get<{ message: string }>('/auth/reset-password/verify', {
                params: { token, email }
            })
        ).data,
    resetPassword: async (payload: { token: string; email: string; newPassword: string }) =>
        (await api.post<{ message: string }>('/auth/reset-password', payload)).data,
    getMyConversations: async () => (await api.get<Conversation[]>('/conversations/my')).data,
    getConversationMessages: async (conversationId: number, cursor?: number, take = 50) =>
        (
            await api.get<PaginatedMessages>(`/conversations/${conversationId}/messages`, {
                params: { cursor, take }
            })
        ).data,
    markConversationAsRead: async (conversationId: number) => api.post(`/conversations/${conversationId}/read`),
    searchUser: async (query: string) =>
        (await api.get<AuthUser>(`/users/search?query=${encodeURIComponent(query)}`)).data,
    getMyProfile: async () => (await api.get<AuthUser>('/users/me')).data,
    updateMyProfile: async (payload: { displayName?: string; avatar?: string | null }) =>
        (await api.patch<AuthUser>('/users/me', payload)).data,
    deleteMyAvatar: async () => (await api.delete<AuthUser>('/users/me/avatar')).data,
    uploadFiles: async (files: File[]) => {
        const formData = new FormData()
        files.forEach(file => formData.append('files', file))
        return (
            await api.post<Array<{ url: string; type: 'IMAGE' | 'FILE'; fileName: string }>>('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        ).data
    },
    startPrivateConversation: async (targetUserId: number) =>
        (await api.post<Conversation>('/conversations/private', { targetUserId })).data,
    createGroupConversation: async (payload: { name: string; members: string[] }) =>
        (await api.post<Conversation>('/conversations/group', payload)).data,
    sendMessage: async (payload: {
        conversationId: number
        content: string
        type?: 'TEXT' | 'IMAGE' | 'FILE' | 'EMOJI'
        replyToId?: number
        forwardedFromId?: number
    }) => (await api.post<Message>('/messages', payload)).data,
    togglePinConversation: async (conversationId: number) => api.post(`/conversations/${conversationId}/pin`),
    toggleFavoriteMessage: async (messageId: number) => api.post(`/conversations/messages/${messageId}/favorite`),
    toggleMessageReaction: async (messageId: number, emoji: string) =>
        api.post(`/conversations/messages/${messageId}/reaction`, { emoji }),
    editMessage: async (messageId: number, content: string) =>
        api.patch(`/conversations/messages/${messageId}`, { content }),
    deleteMessage: async (messageId: number) => api.delete(`/conversations/messages/${messageId}`)
}
