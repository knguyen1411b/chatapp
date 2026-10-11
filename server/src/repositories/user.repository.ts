import { PresenceStatus } from '@prisma/client'
import { prisma } from '../config/prisma'

export const userPublicSelect = {
    id: true,
    username: true,
    email: true,
    displayName: true,
    avatar: true,
    presence: true,
    lastSeenAt: true,
    createdAt: true
} as const

export const userAuthSelect = {
    id: true,
    username: true,
    email: true,
    displayName: true,
    avatar: true
} as const

export class UserRepository {
    async findById(id: number) {
        return prisma.user.findUnique({
            where: { id },
            select: userPublicSelect
        })
    }

    async findByIdWithPassword(id: number) {
        return prisma.user.findUnique({
            where: { id }
        })
    }

    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email }
        })
    }

    async findByUsername(username: string) {
        return prisma.user.findUnique({
            where: { username }
        })
    }

    async findByEmailOrUsername(email: string, username: string) {
        return prisma.user.findFirst({
            where: { OR: [{ email }, { username }] }
        })
    }

    async create(data: {
        username: string
        email: string
        passwordHash: string
        displayName?: string
    }) {
        return prisma.user.create({
            data,
            select: userAuthSelect
        })
    }

    async upsertOAuth(data: {
        provider: 'google' | 'github'
        providerId: string
        email: string
        username: string
        displayName?: string
        avatar?: string
    }) {
        return prisma.user.upsert({
            where: {
                provider_providerId: {
                    provider: data.provider,
                    providerId: data.providerId
                }
            },
            update: {
                email: data.email,
                username: data.username,
                displayName: data.displayName,
                avatar: data.avatar
            },
            create: {
                provider: data.provider,
                providerId: data.providerId,
                email: data.email,
                username: data.username,
                displayName: data.displayName,
                avatar: data.avatar
            },
            select: userAuthSelect
        })
    }

    async update(id: number, data: { displayName?: string; avatar?: string | null; passwordHash?: string }) {
        return prisma.user.update({
            where: { id },
            data,
            select: userPublicSelect
        })
    }

    async updatePresence(userId: number, presence: PresenceStatus) {
        const result = await prisma.user.updateMany({
            where: { id: userId },
            data: {
                presence,
                lastSeenAt: presence === PresenceStatus.OFFLINE ? new Date() : undefined
            }
        })
        return result.count > 0
    }

    async search(currentUserId: number, query: string) {
        const q = query.trim()
        if (!q) return null

        return prisma.user.findFirst({
            where: {
                id: { not: currentUserId },
                OR: [
                    { username: { equals: q, mode: 'insensitive' } },
                    { email: { equals: q, mode: 'insensitive' } },
                    { displayName: { equals: q, mode: 'insensitive' } }
                ]
            },
            select: userPublicSelect
        })
    }

    async findManyByIdentifiers(identifiers: string[]) {
        return prisma.user.findMany({
            where: {
                OR: identifiers.flatMap(i => [
                    { username: { equals: i, mode: 'insensitive' as const } },
                    { email: { equals: i, mode: 'insensitive' as const } },
                    { displayName: { equals: i, mode: 'insensitive' as const } }
                ])
            },
            select: { id: true, username: true, email: true, displayName: true }
        })
    }

    async createPasswordResetToken(userId: number, token: string, expiresAt: Date) {
        return prisma.passwordResetToken.create({
            data: { userId, token, expiresAt }
        })
    }

    async findPasswordResetToken(token: string) {
        return prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: { select: { email: true } } }
        })
    }

    async resetPasswordTransaction(userId: number, tokenId: number, passwordHash: string) {
        return prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { passwordHash }
            }),
            prisma.passwordResetToken.update({
                where: { id: tokenId },
                data: { usedAt: new Date() }
            })
        ])
    }
}

export const userRepository = new UserRepository()
