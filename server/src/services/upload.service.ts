import streamifier from 'streamifier'
import { cloudinary, hasCloudinaryConfig } from '../config/cloudinary'
import { env } from '../config/env'
import { BadRequestError } from '../core/errors'

export interface UploadResult {
    url: string
    fileName: string
    mimeType: string
    size: number
    type: 'IMAGE' | 'FILE'
}

export const uploadFiles = async (files: Express.Multer.File[]): Promise<UploadResult[]> => {
    if (!files || files.length === 0) {
        throw new BadRequestError('Không có file upload')
    }

    return Promise.all(
        files.map(async file => {
            const isImage = file.mimetype.startsWith('image/')
            const fileType: 'IMAGE' | 'FILE' = isImage ? 'IMAGE' : 'FILE'

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
                    type: fileType
                }
            }

            return {
                url: '',
                fileName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                type: fileType
            }
        })
    )
}
