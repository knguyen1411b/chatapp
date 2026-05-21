import nodemailer from 'nodemailer'

import { env } from './env'

export const hasMailConfig = !!env.mailUser && !!env.mailPass

export const mailTransporter = hasMailConfig
    ? nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: env.mailUser,
              pass: env.mailPass
          }
      })
    : null
