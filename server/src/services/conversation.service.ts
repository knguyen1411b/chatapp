import { BadRequestError, ForbiddenError, NotFoundError } from '../core/errors'
import { conversationRepository } from '../repositories/conversation.repository'
import { userRepository } from '../repositories/user.repository'

export const ensureMember = async (conversationId: number, userId: number) => {
    const member = await conversationRepository.findMember(conversationId, userId)
    if (!member) {
        throw new ForbiddenError('Bạn không thuộc conversation này')
    }
    return member
}

export const createOrGetPrivateConversation = async (currentUserId: number, targetUserId: number) => {
    if (currentUserId === targetUserId) {
        throw new BadRequestError('Không thể chat với chính mình')
    }

    const target = await userRepository.findById(targetUserId)
    if (!target) {
        throw new NotFoundError('User không tồn tại')
    }

    const [a, b] = [currentUserId, targetUserId].sort((x, y) => x - y)
    const privateKey = `${a}:${b}`

    const existing = await conversationRepository.findPrivateByKey(privateKey)
    if (existing) {
        return {
            ...existing,
            lastMessage: existing.messages[0] ?? null
        }
    }

    const conversation = await conversationRepository.createPrivate(currentUserId, targetUserId, privateKey)
    return {
        ...conversation,
        lastMessage: null
    }
}

export const createGroupConversation = async (
    currentUserId: number,
    name: string,
    identifiers: string[]
) => {
    const uniqueIdentifiers = Array.from(new Set(identifiers.map(x => x.trim()).filter(Boolean)))
    if (uniqueIdentifiers.length < 2) {
        throw new BadRequestError('Nhóm cần ít nhất 2 thành viên khác bạn')
    }

    const users = await userRepository.findManyByIdentifiers(uniqueIdentifiers)

    const notFound = uniqueIdentifiers.filter(
        idn =>
            !users.some(u =>
                [u.username, u.email, u.displayName]
                    .filter(Boolean)
                    .some(v => v!.toLowerCase() === idn.toLowerCase())
            )
    )
    if (notFound.length) {
        throw new NotFoundError(`Không tìm thấy user: ${notFound.join(', ')}`)
    }

    const memberIds = Array.from(new Set(users.map(u => u.id).filter(id => id !== currentUserId)))
    if (memberIds.length < 2) {
        throw new BadRequestError('Nhóm cần ít nhất 2 thành viên khác bạn')
    }

    const conversation = await conversationRepository.createGroup(currentUserId, name, memberIds)
    return {
        ...conversation,
        lastMessage: null
    }
}

export const listMyConversations = async (currentUserId: number) => {
    const rawConversations = await conversationRepository.findUserConversations(currentUserId)

    const mapped = await Promise.all(
        rawConversations.map(async c => {
            const me = c.members.find(m => m.userId === currentUserId)
            const lastReadAt = me?.lastReadAt ?? null
            const unreadCount = await conversationRepository.countUnreadMessages(c.id, currentUserId, lastReadAt)

            return {
                ...c,
                lastMessage: c.messages[0] ?? null,
                isPinned: c.pinnedBy.length > 0,
                unreadCount
            }
        })
    )

    return mapped.sort(
        (a, b) => Number(b.isPinned) - Number(a.isPinned) || +new Date(b.updatedAt) - +new Date(a.updatedAt)
    )
}

export const markConversationAsRead = async (conversationId: number, userId: number) => {
    await ensureMember(conversationId, userId)
    await conversationRepository.updateLastRead(conversationId, userId)
    return { ok: true }
}

export const togglePinConversation = async (conversationId: number, userId: number) => {
    await ensureMember(conversationId, userId)
    return conversationRepository.togglePin(conversationId, userId)
}
