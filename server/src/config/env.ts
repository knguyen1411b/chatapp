import dotenv from 'dotenv'

dotenv.config()

const cleanEnv = (value?: string) => {
    if (typeof value !== 'string') return ''
    const trimmed = value.trim()
    if (
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
        return trimmed.slice(1, -1).trim()
    }
    return trimmed
}

export const env = {
    port: Number(cleanEnv(process.env.PORT) || 5000),
    databaseUrl: cleanEnv(process.env.DATABASE_URL),
    jwtSecret: cleanEnv(process.env.JWT_SECRET) || 'dev_secret',
    clientUrl: cleanEnv(process.env.CLIENT_URL) || 'http://localhost:3000',
    serverUrl: cleanEnv(process.env.SERVER_URL) || 'http://localhost:5000',
    googleClientId: cleanEnv(process.env.GOOGLE_CLIENT_ID),
    googleClientSecret: cleanEnv(process.env.GOOGLE_CLIENT_SECRET),
    githubClientId: cleanEnv(process.env.GITHUB_CLIENT_ID),
    githubClientSecret: cleanEnv(process.env.GITHUB_CLIENT_SECRET),
    cloudinaryCloudName: cleanEnv(process.env.CLOUDINARY_CLOUD_NAME),
    cloudinaryApiKey: cleanEnv(process.env.CLOUDINARY_API_KEY),
    cloudinaryApiSecret: cleanEnv(process.env.CLOUDINARY_API_SECRET),
    cloudinaryFolder: cleanEnv(process.env.CLOUDINARY_FOLDER) || 'chatapp',
    mailUser: cleanEnv(process.env.MAIL_USER),
    mailPass: cleanEnv(process.env.MAIL_PASS)
}
