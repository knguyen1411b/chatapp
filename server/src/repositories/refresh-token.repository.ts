import { prisma } from '../config/prisma'

export class RefreshTokenRepository {
    async create(userId: number, tokenHash: string, expiresAt: Date) {
        return prisma.refreshToken.create({
            data: {
                userId,
                tokenHash,
                expiresAt
            }
        })
    }

    async findById(id: number) {
        return prisma.refreshToken.findUnique({
            where: { id }
        })
    }

    async rotate(oldTokenId: number, userId: number, newHash: string, newExpiresAt: Date) {
        const replacement = await prisma.refreshToken.create({
            data: {
                userId,
                tokenHash: newHash,
                expiresAt: newExpiresAt
            }
        })

        await prisma.refreshToken.update({
            where: { id: oldTokenId },
            data: {
                revokedAt: new Date(),
                replacedById: replacement.id
            }
        })

        return replacement
    }

    async revokeByTokenId(id: number) {
        return prisma.refreshToken.updateMany({
            where: { id, revokedAt: null },
            data: { revokedAt: new Date() }
        })
    }
}

export const refreshTokenRepository = new RefreshTokenRepository()
