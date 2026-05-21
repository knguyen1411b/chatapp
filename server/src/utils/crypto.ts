import crypto from 'crypto'

export const randomToken = () => crypto.randomBytes(32).toString('hex')
