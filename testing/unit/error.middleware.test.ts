import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { NotFoundError, UnauthorizedError } from '../../server/src/core/errors'
import { asyncHandler, errorHandler, notFoundHandler } from '../../server/src/middleware/error.middleware'
import type { Request, Response, NextFunction } from 'express'

describe('Error Middleware & Async Handler', () => {
    const mockResponse = () => {
        const res: Partial<Response> = {}
        res.status = vi.fn().mockReturnValue(res)
        res.json = vi.fn().mockReturnValue(res)
        return res as Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> }
    }

    it('errorHandler should handle AppError subclasses with correct statusCode', () => {
        const res = mockResponse()
        const req = {} as Request
        const next = vi.fn() as NextFunction

        const err = new UnauthorizedError('Phiên đăng nhập hết hạn')
        errorHandler(err, req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({ message: 'Phiên đăng nhập hết hạn' })
    })

    it('errorHandler should handle ZodError with 400 status and issue details', () => {
        const res = mockResponse()
        const req = {} as Request
        const next = vi.fn() as NextFunction

        let zodErr: unknown
        try {
            z.object({ name: z.string().min(5, 'Tên phải ít nhất 5 ký tự') }).parse({ name: 'ab' })
        } catch (e) {
            zodErr = e
        }

        errorHandler(zodErr, req, res, next)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Tên phải ít nhất 5 ký tự',
                errors: expect.any(Array)
            })
        )
    })

    it('errorHandler should handle JWT errors with 401 status', () => {
        const res = mockResponse()
        const req = {} as Request
        const next = vi.fn() as NextFunction

        const jwtErr = new Error('jwt expired')
        jwtErr.name = 'TokenExpiredError'

        errorHandler(jwtErr, req, res, next)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({ message: 'Token không hợp lệ hoặc đã hết hạn' })
    })

    it('notFoundHandler should return 404 with standard message', () => {
        const res = mockResponse()
        const req = {} as Request

        notFoundHandler(req, res)
        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({ message: 'Đường dẫn không tồn tại' })
    })

    it('asyncHandler should catch promise rejections and call next(err)', async () => {
        const req = {} as Request
        const res = mockResponse()
        const next = vi.fn()

        const expectedError = new NotFoundError('Not found item')
        const asyncFn = asyncHandler(async () => {
            throw expectedError
        })

        asyncFn(req, res, next)
        // Wait for microtask queue
        await new Promise(resolve => setTimeout(resolve, 10))

        expect(next).toHaveBeenCalledWith(expectedError)
    })
})
