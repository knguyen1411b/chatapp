import { prisma } from '../config/prisma'

const memberUserSelect = {
    id: true,
    username: true,
    email: true,
    displayName: true,
    avatar: true,
    presence: true,
    lastSeenAt: true
} as const

const conversationInclude = {
    members: {
        include: {
            user: {
                select: memberUserSelect
            }
        }
    },
    pinnedBy: true,
    messages: {
        take: 1,
        orderBy: { createdAt: 'desc' as const },
        include: { sender: { select: { id: true, username: true } } }
    }
}

export class ConversationRepository {
    async findPrivateByKey(privateKey: string) {
        return prisma.conversation.findUnique({
            where: { privateKey },
            include: conversationInclude
        })
    }

    async createPrivate(currentUserId: number, targetUserId: number, privateKey: string) {
        return prisma.conversation.create({
            data: {
                type: 'PRIVATE',
                privateKey,
                createdBy: currentUserId,
                members: {
                    create: [
                        { userId: currentUserId, role: 'ADMIN' },
                        { userId: targetUserId, role: 'MEMBER' }
                    ]
                }
            },
            include: conversationInclude
        })
    }

    async createGroup(currentUserId: number, name: string, memberUserIds: number[]) {
        return prisma.conversation.create({
            data: {
                type: 'GROUP',
                name,
                createdBy: currentUserId,
                members: {
                    create: [
                        { userId: currentUserId, role: 'ADMIN' },
                        ...memberUserIds.map(id => ({ userId: id, role: 'MEMBER' as const }))
                    ]
                }
            },
            include: {
                members: {
                    include: {
                        user: { select: memberUserSelect }
                    }
                },
                pinnedBy: true,
                messages: true
            }
        })
    }

    async findUserConversations(userId: number) {
        return prisma.conversation.findMany({
            where: {
                members: {
                    some: { userId }
                }
            },
            include: {
                members: {
                    include: {
                        user: { select: memberUserSelect }
                    }
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                    include: { sender: { select: { id: true, username: true } } }
                },
                pinnedBy: {
                    where: { userId }
                }
            },
            orderBy: { updatedAt: 'desc' }
        })
    }

    async findMember(conversationId: number, userId: number) {
        return prisma.conversationMember.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId
                }
            }
        })
    }

    async countUnreadMessages(conversationId: number, userId: number, lastReadAt: Date | null) {
        return prisma.message.count({
            where: {
                conversationId,
                senderId: { not: userId },
                ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {})
            }
        })
    }

    async updateLastRead(conversationId: number, userId: number) {
        return prisma.conversationMember.update({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId
                }
            },
            data: {
                lastReadAt: new Date()
            }
        })
    }

    async togglePin(conversationId: number, userId: number) {
        const existing = await prisma.pinnedConversation.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId
                }
            }
        })

        if (existing) {
            await prisma.pinnedConversation.delete({
                where: {
                    conversationId_userId: {
                        conversationId,
                        userId
                    }
                }
            })
            return { removed: true }
        }

        await prisma.pinnedConversation.create({
            data: {
                conversationId,
                userId
            }
        })
        return { removed: false }
    }

    async touchUpdatedAt(conversationId: number) {
        return prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        })
    }
}

export const conversationRepository = new ConversationRepository()
