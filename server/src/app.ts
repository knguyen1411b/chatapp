import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import path from 'path'
import { Server } from 'socket.io'

import passport from './config/passport'
import { authRouter } from './routes/auth.routes'
import { conversationRouter } from './routes/conversation.routes'
import { messageRouter } from './routes/message.routes'
import { uploadRouter } from './routes/upload.routes'
import { userRouter } from './routes/user.routes'

export const createApp = (io?: Server) => {
    const app = express()
    const allowedOrigins = (process.env.CLIENT_URL ?? 'http://localhost:3000')
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean)

    if (io) {
        app.set('io', io)
    }

    app.use(
        cors({
            origin(origin, callback) {
                if (!origin) return callback(null, true)
                if (allowedOrigins.includes(origin)) return callback(null, true)
                return callback(new Error(`CORS blocked for origin: ${origin}`))
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
    app.use('/api/auth', authRouter)
    app.use('/api/users', userRouter)
    app.use('/api/conversations', conversationRouter)
    app.use('/api/messages', messageRouter)
    app.use('/api/upload', uploadRouter)

    return app
}

const app = createApp()

export default app
