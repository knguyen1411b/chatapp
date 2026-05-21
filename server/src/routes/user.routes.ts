import { Router } from 'express'

import {
    deleteAvatarController,
    getMeController,
    searchUsersController,
    updateMeController
} from '../controllers/user.controller'
import { authMiddleware } from '../middleware/auth.middleware'

export const userRouter = Router()
userRouter.use(authMiddleware as any)
userRouter.get('/me', getMeController as any)
userRouter.patch('/me', updateMeController as any)
userRouter.delete('/me/avatar', deleteAvatarController as any)
userRouter.get('/search', searchUsersController as any)
