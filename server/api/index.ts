import type { VercelRequest, VercelResponse } from '@vercel/node'
import serverless from 'serverless-http'

import { createApp } from '../src/app'

const app = createApp()
const handler = serverless(app)

export default async function vercelHandler(req: VercelRequest, res: VercelResponse) {
    return handler(req, res)
}
