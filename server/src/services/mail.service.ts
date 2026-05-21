import { env } from '../config/env'
import { hasMailConfig, mailTransporter } from '../config/mail'

export const sendResetPasswordEmail = async (to: string, token: string) => {
    if (!hasMailConfig || !mailTransporter) {
        return { sent: false }
    }

    const resetUrl = `${env.clientUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(to)}`

    await mailTransporter.sendMail({
        from: env.mailUser,
        to,
        subject: 'Reset your password',
        html: `<p>Bạn đã yêu cầu đặt lại mật khẩu.</p><p>Nhấn vào link sau để tiếp tục:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Link hết hạn sau 30 phút.</p>`
    })

    return { sent: true }
}
