import { Router } from 'express'
import { uploadFilesController } from '../controllers/upload.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { upload } from '../middleware/upload.middleware'

export const uploadRouter = Router()

uploadRouter.use(authMiddleware as any)
uploadRouter.post('/', upload.array('files', 10), uploadFilesController)
