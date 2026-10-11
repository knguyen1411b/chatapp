import { AuthUser } from './types'

const USER_KEY = 'chat_user'
const ACCESS_TOKEN_KEY = 'chat_access_token'
const REFRESH_TOKEN_KEY = 'chat_refresh_token'

export const authStorage = {
    getUser: (): AuthUser | null => {
        if (typeof window === 'undefined') return null
        const raw = window.localStorage.getItem(USER_KEY)
        if (!raw) return null
        try {
            return JSON.parse(raw) as AuthUser
        } catch {
            return null
        }
    },
    setUser: (user: AuthUser | null) => {
        if (typeof window === 'undefined') return
        if (user) {
            window.localStorage.setItem(USER_KEY, JSON.stringify(user))
        } else {
            window.localStorage.removeItem(USER_KEY)
        }
    },
    getAccessToken: (): string | null => {
        if (typeof window === 'undefined') return null
        return window.localStorage.getItem(ACCESS_TOKEN_KEY)
    },
    setAccessToken: (token: string | null) => {
        if (typeof window === 'undefined') return
        if (token) {
            window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
        } else {
            window.localStorage.removeItem(ACCESS_TOKEN_KEY)
        }
    },
    getRefreshToken: (): string | null => {
        if (typeof window === 'undefined') return null
        return window.localStorage.getItem(REFRESH_TOKEN_KEY)
    },
    setRefreshToken: (token: string | null) => {
        if (typeof window === 'undefined') return
        if (token) {
            window.localStorage.setItem(REFRESH_TOKEN_KEY, token)
        } else {
            window.localStorage.removeItem(REFRESH_TOKEN_KEY)
        }
    },
    setSession: (session: { user: AuthUser; accessToken?: string; refreshToken?: string }) => {
        if (typeof window === 'undefined') return
        authStorage.setUser(session.user)
        if (session.accessToken) authStorage.setAccessToken(session.accessToken)
        if (session.refreshToken) authStorage.setRefreshToken(session.refreshToken)
    },
    clear: () => {
        if (typeof window === 'undefined') return
        window.localStorage.removeItem(USER_KEY)
        window.localStorage.removeItem(ACCESS_TOKEN_KEY)
        window.localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
}
