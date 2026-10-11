import { NextFunction, Request, RequestHandler, Response } from 'express'
import { ZodSchema } from 'zod'

export const validateBody = (schema: ZodSchema): RequestHandler => {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body)
            next()
        } catch (error) {
            next(error)
        }
    }
}

export const validateQuery = (schema: ZodSchema): RequestHandler => {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            req.query = schema.parse(req.query)
            next()
        } catch (error) {
            next(error)
        }
    }
}

export const validateParams = (schema: ZodSchema): RequestHandler => {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            req.params = schema.parse(req.params)
            next()
        } catch (error) {
            next(error)
        }
    }
}
