import { Request } from 'express'

import { JwtPayload } from '../utils/token'

export interface AuthRequest extends Request {
    authUser?: JwtPayload
}
