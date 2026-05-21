import type { VercelRequest, VercelResponse } from '@vercel/node'
import serverless from 'serverless-http'

let cachedHandler:
    | ((req: VercelRequest, res: VercelResponse) => Promise<unknown> | unknown)
    | null = null

const getHandler = async () => {
    if (cachedHandler) return cachedHandler
    const { createApp } = await import('../src/app')
    const app = createApp()
    cachedHandler = serverless(app)
    return cachedHandler
}

export default async function vercelHandler(req: VercelRequest, res: VercelResponse) {
    try {
        const handler = await getHandler()
        return handler(req, res)
    } catch (error) {
        console.error('Vercel function bootstrap failed:', error)
        if (!res.headersSent) {
            return res.status(500).json({
                message: 'Server bootstrap failed',
                hint: 'Check Vercel Environment Variables and runtime logs'
            })
        }
        return
    }
}
