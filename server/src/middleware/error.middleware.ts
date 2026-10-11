import { NextFunction, Request, RequestHandler, Response } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../core/errors'

export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}

export const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message
        })
    }

    if (err instanceof ZodError || (err as any)?.name === 'ZodError') {
        const issues = (err as any).issues ?? []
        const firstMessage = issues[0]?.message ?? 'Dữ liệu không hợp lệ'
        return res.status(400).json({
            message: firstMessage,
            errors: issues
        })
    }

    if (err instanceof Error) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' })
        }

        // Check if message indicates permission or auth
        if (err.message.includes('không thuộc conversation') || err.message.includes('Không thể')) {
            // Check status codes if any custom message
        }

        const statusCode = (err as any).statusCode || (err as any).status || 500
        const isProduction = process.env.NODE_ENV === 'production'

        return res.status(statusCode).json({
            message: statusCode === 500 && isProduction ? 'Đã xảy ra lỗi máy chủ' : err.message
        })
    }

    return res.status(500).json({ message: 'Lỗi không xác định' })
}

export const notFoundHandler = (_req: Request, res: Response) => {
    res.status(404).json({ message: 'Đường dẫn không tồn tại' })
}
