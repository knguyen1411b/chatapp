import bcrypt from 'bcryptjs'

import { TOKEN_EXPIRY } from '../core/constants'
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '../core/errors'
import { refreshTokenRepository } from '../repositories/refresh-token.repository'
import { userRepository } from '../repositories/user.repository'
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

const issueRefreshToken = async (userId: number): Promise<string> => {
    const rawToken = randomToken()
    const tokenHash = await bcrypt.hash(rawToken, 10)
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY.REFRESH_TOKEN_MS)

    const refresh = await refreshTokenRepository.create(userId, tokenHash, expiresAt)
    const signed = signRefreshToken({ userId, tokenId: refresh.id })
    return `${signed}.${rawToken}`
}

export const registerWithEmail = async (payload: {
    username: string
    email: string
    password: string
    displayName?: string
}) => {
    const existing = await userRepository.findByEmailOrUsername(payload.email, payload.username)
    if (existing) {
        throw new ConflictError('Username hoặc email đã tồn tại')
    }

    const passwordHash = await bcrypt.hash(payload.password, 10)
    const user = await userRepository.create({
        username: payload.username,
        email: payload.email,
        displayName: payload.displayName,
        passwordHash
    })

    const refreshToken = await issueRefreshToken(user.id)
    return { ...authPayload(user), refreshToken }
}

export const loginWithEmail = async (email: string, password: string) => {
    const user = await userRepository.findByEmail(email)
    if (!user?.passwordHash) {
        throw new UnauthorizedError('Sai email hoặc mật khẩu')
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
        throw new UnauthorizedError('Sai email hoặc mật khẩu')
    }

    const normalizedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar
    }
    const refreshToken = await issueRefreshToken(user.id)
    return { ...authPayload(normalizedUser), refreshToken }
}

export const oauthLogin = async (
    provider: 'google' | 'github',
    profile: { id: string; email: string; username: string; displayName?: string; avatar?: string }
) => {
    const user = await userRepository.upsertOAuth({
        provider,
        providerId: profile.id,
        email: profile.email,
        username: profile.username,
        displayName: profile.displayName,
        avatar: profile.avatar
    })

    const refreshToken = await issueRefreshToken(user.id)
    return { ...authPayload(user), refreshToken }
}

export const refreshSession = async (refreshCookieValue: string) => {
    const separatorIndex = refreshCookieValue.lastIndexOf('.')
    if (separatorIndex < 1) {
        throw new UnauthorizedError('Refresh token không hợp lệ')
    }

    const signedPart = refreshCookieValue.slice(0, separatorIndex)
    const rawPart = refreshCookieValue.slice(separatorIndex + 1)
    const payload = verifyRefreshToken(signedPart)

    const refresh = await refreshTokenRepository.findById(payload.tokenId)
    if (!refresh || refresh.userId !== payload.userId) {
        throw new UnauthorizedError('Refresh token không hợp lệ')
    }
    if (refresh.revokedAt || refresh.expiresAt < new Date()) {
        throw new UnauthorizedError('Refresh token đã hết hạn')
    }

    const match = await bcrypt.compare(rawPart, refresh.tokenHash)
    if (!match) {
        throw new UnauthorizedError('Refresh token không hợp lệ')
    }

    const user = await userRepository.findById(payload.userId)
    if (!user) {
        throw new NotFoundError('Người dùng không tồn tại')
    }

    const newRaw = randomToken()
    const newHash = await bcrypt.hash(newRaw, 10)
    const newExpiresAt = new Date(Date.now() + TOKEN_EXPIRY.REFRESH_TOKEN_MS)

    const replacement = await refreshTokenRepository.rotate(refresh.id, user.id, newHash, newExpiresAt)
    const signed = signRefreshToken({ userId: user.id, tokenId: replacement.id })

    const normalizedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar
    }

    return {
        accessToken: signAccessToken({ userId: user.id, username: user.username, email: user.email }),
        refreshToken: `${signed}.${newRaw}`,
        user: normalizedUser
    }
}

export const revokeSession = async (refreshCookieValue?: string) => {
    if (!refreshCookieValue) return
    const separatorIndex = refreshCookieValue.lastIndexOf('.')
    if (separatorIndex < 1) return

    try {
        const signedPart = refreshCookieValue.slice(0, separatorIndex)
        const payload = verifyRefreshToken(signedPart)
        await refreshTokenRepository.revokeByTokenId(payload.tokenId)
    } catch {
        // ignore invalid refresh cookie on logout
    }
}

export const requestPasswordReset = async (email: string) => {
    const user = await userRepository.findByEmail(email)
    if (!user) {
        return { message: 'Nếu email tồn tại bạn sẽ nhận hướng dẫn.' }
    }

    const token = randomToken()
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY.PASSWORD_RESET_MS)
    await userRepository.createPasswordResetToken(user.id, token, expiresAt)

    const mailResult = await sendResetPasswordEmail(user.email, token)
    if (mailResult.sent) {
        return { message: 'Đã gửi email reset mật khẩu' }
    }

    return { message: 'Mail chưa cấu hình, trả token dev', resetToken: token }
}

export const verifyPasswordResetToken = async (token: string, email: string) => {
    const reset = await userRepository.findPasswordResetToken(token)

    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
        throw new BadRequestError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn')
    }

    if (reset.user.email.toLowerCase() !== email.toLowerCase()) {
        throw new BadRequestError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn')
    }

    return { message: 'Token hợp lệ' }
}

export const resetPassword = async (token: string, email: string, newPassword: string) => {
    const reset = await userRepository.findPasswordResetToken(token)

    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
        throw new BadRequestError('Token không hợp lệ hoặc đã hết hạn')
    }
    if (reset.user.email.toLowerCase() !== email.toLowerCase()) {
        throw new BadRequestError('Token không hợp lệ hoặc đã hết hạn')
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await userRepository.resetPasswordTransaction(reset.userId, reset.id, passwordHash)

    return { message: 'Đổi mật khẩu thành công' }
}
