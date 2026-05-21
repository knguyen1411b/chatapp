import bcrypt from 'bcryptjs'

import { prisma } from '../config/prisma'
import { randomToken } from '../utils/crypto'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token'
import { sendResetPasswordEmail } from './mail.service'

const authPayload = (user: {
    id: number
    username: string
    email: string
    displayName: string | null
    avatar: string | null
}) => ({
    accessToken: signAccessToken({ userId: user.id, username: user.username, email: user.email }),
    user
})

const issueRefreshToken = async (userId: number) => {
    const rawToken = randomToken()
    const tokenHash = await bcrypt.hash(rawToken, 10)
    const refresh = await prisma.refreshToken.create({
        data: {
            userId,
            tokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    })
    const signed = signRefreshToken({ userId, tokenId: refresh.id })
    return `${signed}.${rawToken}`
}

export const registerWithEmail = async (payload: {
    username: string
    email: string
    password: string
    displayName?: string
}) => {
    const existing = await prisma.user.findFirst({
        where: { OR: [{ email: payload.email }, { username: payload.username }] }
    })
    if (existing) throw new Error('Username hoặc email đã tồn tại')

    const passwordHash = await bcrypt.hash(payload.password, 10)
    const user = await prisma.user.create({
        data: { username: payload.username, email: payload.email, displayName: payload.displayName, passwordHash },
        select: { id: true, username: true, email: true, displayName: true, avatar: true }
    })

    return { ...authPayload(user), refreshToken: await issueRefreshToken(user.id) }
}

export const loginWithEmail = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user?.passwordHash) throw new Error('Sai email hoặc mật khẩu')

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) throw new Error('Sai email hoặc mật khẩu')

    const normalizedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar
    }
    return { ...authPayload(normalizedUser), refreshToken: await issueRefreshToken(user.id) }
}

export const oauthLogin = async (
    provider: 'google' | 'github',
    profile: { id: string; email: string; username: string; displayName?: string; avatar?: string }
) => {
    const user = await prisma.user.upsert({
        where: { provider_providerId: { provider, providerId: profile.id } },
        update: {
            email: profile.email,
            username: profile.username,
            displayName: profile.displayName,
            avatar: profile.avatar
        },
        create: {
            provider,
            providerId: profile.id,
            email: profile.email,
            username: profile.username,
            displayName: profile.displayName,
            avatar: profile.avatar
        },
        select: { id: true, username: true, email: true, displayName: true, avatar: true }
    })

    return { ...authPayload(user), refreshToken: await issueRefreshToken(user.id) }
}

export const refreshSession = async (refreshCookieValue: string) => {
    const separatorIndex = refreshCookieValue.lastIndexOf('.')
    if (separatorIndex < 1) throw new Error('Refresh token không hợp lệ')

    const signedPart = refreshCookieValue.slice(0, separatorIndex)
    const rawPart = refreshCookieValue.slice(separatorIndex + 1)
    const payload = verifyRefreshToken(signedPart)

    const refresh = await prisma.refreshToken.findUnique({ where: { id: payload.tokenId } })
    if (!refresh || refresh.userId !== payload.userId) throw new Error('Refresh token không hợp lệ')
    if (refresh.revokedAt || refresh.expiresAt < new Date()) throw new Error('Refresh token đã hết hạn')

    const match = await bcrypt.compare(rawPart, refresh.tokenHash)
    if (!match) throw new Error('Refresh token không hợp lệ')

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, username: true, email: true, displayName: true, avatar: true }
    })
    if (!user) throw new Error('Người dùng không tồn tại')

    const newRaw = randomToken()
    const newHash = await bcrypt.hash(newRaw, 10)
    const replacement = await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: newHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    })

    await prisma.refreshToken.update({
        where: { id: refresh.id },
        data: { revokedAt: new Date(), replacedById: replacement.id }
    })

    const signed = signRefreshToken({ userId: user.id, tokenId: replacement.id })
    return {
        accessToken: signAccessToken({ userId: user.id, username: user.username, email: user.email }),
        refreshToken: `${signed}.${newRaw}`,
        user
    }
}

export const revokeSession = async (refreshCookieValue?: string) => {
    if (!refreshCookieValue) return
    const separatorIndex = refreshCookieValue.lastIndexOf('.')
    if (separatorIndex < 1) return
    try {
        const signedPart = refreshCookieValue.slice(0, separatorIndex)
        const payload = verifyRefreshToken(signedPart)
        await prisma.refreshToken.updateMany({
            where: { id: payload.tokenId, revokedAt: null },
            data: { revokedAt: new Date() }
        })
    } catch {
        // ignore invalid refresh cookie on logout
    }
}

export const requestPasswordReset = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return { message: 'Nếu email tồn tại bạn sẽ nhận hướng dẫn.' }

    const token = randomToken()
    await prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt: new Date(Date.now() + 30 * 60 * 1000) }
    })

    const mailResult = await sendResetPasswordEmail(user.email, token)
    if (mailResult.sent) {
        return { message: 'Đã gửi email reset mật khẩu' }
    }

    return { message: 'Mail chưa cấu hình, trả token dev', resetToken: token }
}

export const verifyPasswordResetToken = async (token: string, email: string) => {
    const reset = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: { select: { email: true } } }
    })

    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
        throw new Error('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn')
    }

    if (reset.user.email.toLowerCase() !== email.toLowerCase()) {
        throw new Error('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn')
    }

    return { message: 'Token hợp lệ' }
}

export const resetPassword = async (token: string, email: string, newPassword: string) => {
    const reset = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: { select: { email: true } } }
    })
    if (!reset || reset.usedAt || reset.expiresAt < new Date()) throw new Error('Token không hợp lệ hoặc đã hết hạn')
    if (reset.user.email.toLowerCase() !== email.toLowerCase()) {
        throw new Error('Token không hợp lệ hoặc đã hết hạn')
    }

    await prisma.$transaction([
        prisma.user.update({ where: { id: reset.userId }, data: { passwordHash: await bcrypt.hash(newPassword, 10) } }),
        prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } })
    ])

    return { message: 'Đổi mật khẩu thành công' }
}
