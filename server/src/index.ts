import http from 'http'
import { Server } from 'socket.io'

import { createApp } from './app'
import { env } from './config/env'
import { setupSocket } from './socket'

const app = createApp()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: env.clientUrl, credentials: true } })
app.set('io', io)
setupSocket(io)

server.listen(env.port, () => console.log(`Server running at http://localhost:${env.port}`))
