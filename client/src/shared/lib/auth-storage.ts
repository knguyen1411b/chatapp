import { AuthUser } from './types'

const USER_KEY = 'chat_user'

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
    setUser: (user: AuthUser) => {
        if (typeof window === 'undefined') return
        window.localStorage.setItem(USER_KEY, JSON.stringify(user))
    },
    clear: () => {
        if (typeof window === 'undefined') return
        window.localStorage.removeItem(USER_KEY)
    }
}
