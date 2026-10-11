import axios from 'axios'
import { authStorage } from './auth-storage'

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true
})

api.interceptors.request.use(config => {
    const token = authStorage.getAccessToken()
    if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

let refreshingPromise: Promise<void> | null = null

api.interceptors.response.use(
    response => response,
    async error => {
        const status = error?.response?.status
        const originalConfig = error?.config
        const url = typeof originalConfig?.url === 'string' ? originalConfig.url : ''
        const isAuthAttempt =
            url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')

        if (status !== 401 || !originalConfig || originalConfig._retry || isAuthAttempt) {
            return Promise.reject(error)
        }

        originalConfig._retry = true
        if (!refreshingPromise) {
            const currentRefreshToken = authStorage.getRefreshToken()
            refreshingPromise = api
                .post('/auth/refresh', { refreshToken: currentRefreshToken || undefined })
                .then(res => {
                    const data = res.data
                    if (data?.accessToken) {
                        authStorage.setAccessToken(data.accessToken)
                    }
                    if (data?.refreshToken) {
                        authStorage.setRefreshToken(data.refreshToken)
                    }
                    if (data?.user) {
                        authStorage.setUser(data.user)
                    }
                })
                .catch(refreshErr => {
                    authStorage.clear()
                    return Promise.reject(refreshErr)
                })
                .finally(() => {
                    refreshingPromise = null
                })
        }

        try {
            await refreshingPromise
            const newToken = authStorage.getAccessToken()
            if (newToken && originalConfig.headers) {
                originalConfig.headers.Authorization = `Bearer ${newToken}`
            }
            return api(originalConfig)
        } catch {
            return Promise.reject(error)
        }
    }
)

export const serverFileUrl = (url: string) => `${process.env.NEXT_PUBLIC_SERVER_URL}${url}`
