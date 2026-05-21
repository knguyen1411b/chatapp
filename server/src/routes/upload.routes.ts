import { Router } from 'express'
import streamifier from 'streamifier'

import { cloudinary, hasCloudinaryConfig } from '../config/cloudinary'
import { env } from '../config/env'
import { authMiddleware } from '../middleware/auth.middleware'
import { upload } from '../middleware/upload.middleware'

export const uploadRouter = Router()
uploadRouter.use(authMiddleware as any)

uploadRouter.post('/', upload.array('files', 10), async (req, res) => {
    try {
        const files = (req.files as Express.Multer.File[] | undefined) ?? []
        if (!files.length) {
            return res.status(400).json({ message: 'Không có file upload' })
        }

        const results = await Promise.all(
            files.map(async file => {
                if (hasCloudinaryConfig) {
                    const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
                        const stream = cloudinary.uploader.upload_stream(
                            {
                                folder: env.cloudinaryFolder,
                                resource_type: 'auto'
                            },
                            (error, result) => {
                                if (error || !result) {
                                    reject(error ?? new Error('Cloudinary upload failed'))
                                    return
                                }
                                resolve({ secure_url: result.secure_url })
                            }
                        )

                        streamifier.createReadStream(file.buffer).pipe(stream)
                    })

                    return {
                        url: uploaded.secure_url,
                        fileName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        type: file.mimetype.startsWith('image/') ? 'IMAGE' : 'FILE'
                    }
                }

                return {
                    url: '',
                    fileName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    type: file.mimetype.startsWith('image/') ? 'IMAGE' : 'FILE'
                }
            })
        )

        return res.json(results)
    } catch (error) {
        return res.status(500).json({ message: error instanceof Error ? error.message : 'Upload thất bại' })
    }
})
