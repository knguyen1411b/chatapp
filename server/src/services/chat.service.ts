/**
 * Chat Service Facade
 * Provides unified access to conversation, message, and presence operations.
 * Maintained for backward compatibility and high cohesion.
 */
export {
    createGroupConversation,
    createOrGetPrivateConversation,
    ensureMember,
    listMyConversations,
    markConversationAsRead,
    togglePinConversation
} from './conversation.service'

export {
    createMessage,
    deleteMessage,
    editMessage,
    getConversationMessages,
    getMessageById,
    toggleFavoriteMessage,
    toggleReaction
} from './message.service'

export {
    searchUser,
    setPresence
} from './user.service'
