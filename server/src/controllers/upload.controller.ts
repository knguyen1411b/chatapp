import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/error.middleware'
import { uploadFiles } from '../services/upload.service'

export const uploadFilesController = asyncHandler(async (req: Request, res: Response) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? []
    const results = await uploadFiles(files)
    return res.json(results)
})
