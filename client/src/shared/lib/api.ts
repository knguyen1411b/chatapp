import axios from 'axios'

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true
})

let refreshingPromise: Promise<void> | null = null

api.interceptors.response.use(
    response => response,
    async error => {
        const status = error?.response?.status
        const originalConfig = error?.config
        const isAuthRoute = typeof originalConfig?.url === 'string' && originalConfig.url.startsWith('/auth/')

        if (status !== 401 || !originalConfig || originalConfig._retry || isAuthRoute) {
            return Promise.reject(error)
        }

        originalConfig._retry = true
        if (!refreshingPromise) {
            refreshingPromise = api
                .post('/auth/refresh')
                .then(() => {})
                .finally(() => {
                    refreshingPromise = null
                })
        }

        try {
            await refreshingPromise
            return api(originalConfig)
        } catch {
            return Promise.reject(error)
        }
    }
)

export const serverFileUrl = (url: string) => `${process.env.NEXT_PUBLIC_SERVER_URL}${url}`
