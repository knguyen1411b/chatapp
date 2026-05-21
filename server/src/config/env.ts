import dotenv from 'dotenv'

dotenv.config()

export const env = {
    port: Number(process.env.PORT ?? 5000),
    databaseUrl: process.env.DATABASE_URL ?? '',
    jwtSecret: process.env.JWT_SECRET ?? 'dev_secret',
    clientUrl: process.env.CLIENT_URL ?? 'http://localhost:3000',
    serverUrl: process.env.SERVER_URL ?? 'http://localhost:5000',
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    githubClientId: process.env.GITHUB_CLIENT_ID ?? '',
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? '',
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
    cloudinaryFolder: process.env.CLOUDINARY_FOLDER ?? 'chatapp',
    mailUser: process.env.MAIL_USER ?? '',
    mailPass: process.env.MAIL_PASS ?? ''
}
