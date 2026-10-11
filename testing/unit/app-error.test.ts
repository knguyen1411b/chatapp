import { describe, expect, it } from 'vitest'
import {
    AppError,
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError
} from '../../server/src/core/errors'

describe('Domain Errors (Clean Architecture Core)', () => {
    it('AppError should set message and statusCode properly', () => {
        const error = new AppError('Custom error', 418)
        expect(error.message).toBe('Custom error')
        expect(error.statusCode).toBe(418)
        expect(error.isOperational).toBe(true)
        expect(error).toBeInstanceOf(Error)
        expect(error).toBeInstanceOf(AppError)
    })

    it('BadRequestError should default to 400', () => {
        const error = new BadRequestError('Dữ liệu sai')
        expect(error.statusCode).toBe(400)
        expect(error.message).toBe('Dữ liệu sai')
        expect(error).toBeInstanceOf(AppError)
    })

    it('UnauthorizedError should default to 401', () => {
        const error = new UnauthorizedError()
        expect(error.statusCode).toBe(401)
        expect(error.message).toBe('Unauthorized')
        expect(error).toBeInstanceOf(AppError)
    })

    it('ForbiddenError should default to 403', () => {
        const error = new ForbiddenError()
        expect(error.statusCode).toBe(403)
        expect(error.message).toBe('Không có quyền truy cập')
        expect(error).toBeInstanceOf(AppError)
    })

    it('NotFoundError should default to 404', () => {
        const error = new NotFoundError('Tài nguyên không tìm thấy')
        expect(error.statusCode).toBe(404)
        expect(error.message).toBe('Tài nguyên không tìm thấy')
        expect(error).toBeInstanceOf(AppError)
    })

    it('ConflictError should default to 409', () => {
        const error = new ConflictError('Email đã tồn tại')
        expect(error.statusCode).toBe(409)
        expect(error.message).toBe('Email đã tồn tại')
        expect(error).toBeInstanceOf(AppError)
    })
})
