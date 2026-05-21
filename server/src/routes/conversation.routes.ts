import { Router } from 'express'

import {
    createGroupConversationController,
    createPrivateConversationController,
    deleteMessageController,
    editMessageController,
    getConversationMessagesController,
    getMyConversationsController,
    markConversationAsReadController,
    toggleFavoriteMessageController,
    togglePinConversationController,
    toggleReactionController
} from '../controllers/conversation.controller'
import { authMiddleware } from '../middleware/auth.middleware'

export const conversationRouter = Router()
conversationRouter.use(authMiddleware as any)
conversationRouter.post('/private', createPrivateConversationController as any)
conversationRouter.post('/group', createGroupConversationController as any)
conversationRouter.get('/my', getMyConversationsController as any)
conversationRouter.get('/:id/messages', getConversationMessagesController as any)
conversationRouter.post('/:id/read', markConversationAsReadController as any)
conversationRouter.post('/:id/pin', togglePinConversationController as any)
conversationRouter.post('/messages/:id/favorite', toggleFavoriteMessageController as any)
conversationRouter.post('/messages/:id/reaction', toggleReactionController as any)
conversationRouter.patch('/messages/:id', editMessageController as any)
conversationRouter.delete('/messages/:id', deleteMessageController as any)
