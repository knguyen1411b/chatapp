import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import path from 'path'
import { Server } from 'socket.io'

import passport from './config/passport'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'
import { authRouter } from './routes/auth.routes'
import { conversationRouter } from './routes/conversation.routes'
import { messageRouter } from './routes/message.routes'
import { uploadRouter } from './routes/upload.routes'
import { userRouter } from './routes/user.routes'

export const createApp = (io?: Server) => {
    const app = express()
    app.set('trust proxy', 1)

    const allowedOrigins = (process.env.CLIENT_URL ?? 'http://localhost:3000')
        .split(',')
        .map(origin => origin.trim().replace(/\/+$/, ''))
        .filter(Boolean)

    if (io) {
        app.set('io', io)
    }

    app.use(
        cors({
            origin(origin, callback) {
                if (!origin) return callback(null, true)
                const normalized = origin.replace(/\/+$/, '')
                if (
                    allowedOrigins.includes(normalized) ||
                    allowedOrigins.includes('*') ||
                    (allowedOrigins.some(o => o.includes('.vercel.app')) && normalized.endsWith('.vercel.app'))
                ) {
                    return callback(null, true)
                }
                return callback(null, false)
            },
            credentials: true
        })
    )
    app.use(cookieParser())
    app.use(express.json())
    app.use(passport.initialize())
    app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')))

    app.get('/', (_req, res) => {
        res.json({
            message: 'Chat API is running',
            health: '/api/health'
        })
    })
    app.get('/api/health', (_req, res) => res.json({ message: 'OK' }))

    // API Routes
    app.use('/api/auth', authRouter)
    app.use('/api/users', userRouter)
    app.use('/api/conversations', conversationRouter)
    app.use('/api/messages', messageRouter)
    app.use('/api/upload', uploadRouter)

    // Global Error Handling Middleware
    app.use(notFoundHandler)
    app.use(errorHandler)

    return app
}

const app = createApp()

export default app
