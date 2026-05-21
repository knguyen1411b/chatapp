import { Router } from 'express'

import { createMessageController } from '../controllers/message.controller'
import { authMiddleware } from '../middleware/auth.middleware'

export const messageRouter = Router()
messageRouter.use(authMiddleware as any)
messageRouter.post('/', createMessageController as any)
