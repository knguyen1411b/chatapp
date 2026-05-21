import { v2 as cloudinary } from 'cloudinary'

import { env } from './env'

export const hasCloudinaryConfig = !!env.cloudinaryCloudName && !!env.cloudinaryApiKey && !!env.cloudinaryApiSecret

if (hasCloudinaryConfig) {
    cloudinary.config({
        cloud_name: env.cloudinaryCloudName,
        api_key: env.cloudinaryApiKey,
        api_secret: env.cloudinaryApiSecret
    })
}

export { cloudinary }
