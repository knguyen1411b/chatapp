import { PresenceStatus } from '@prisma/client'
import { NotFoundError } from '../core/errors'
import { userRepository } from '../repositories/user.repository'

export const getUserProfile = async (userId: number) => {
    const user = await userRepository.findById(userId)
    if (!user) {
        throw new NotFoundError('Không tìm thấy người dùng')
    }
    return user
}

export const updateUserProfile = async (
    userId: number,
    payload: { displayName?: string; avatar?: string | null }
) => {
    const user = await userRepository.findById(userId)
    if (!user) {
        throw new NotFoundError('Không tìm thấy người dùng')
    }

    return userRepository.update(userId, payload)
}

export const deleteUserAvatar = async (userId: number) => {
    const user = await userRepository.findById(userId)
    if (!user) {
        throw new NotFoundError('Không tìm thấy người dùng')
    }

    return userRepository.update(userId, { avatar: null })
}

export const searchUser = async (currentUserId: number, query: string) => {
    return userRepository.search(currentUserId, query)
}

export const setPresence = async (userId: number, presence: PresenceStatus) => {
    return userRepository.updatePresence(userId, presence)
}
